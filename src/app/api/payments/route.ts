import { NextResponse } from 'next/server';
import { squareClient } from '@/lib/square';
import { addFunds, getUserProfile, updateUserProfile } from '@/lib/db'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId, amount, userId, creatorId, tierId, type } = body; 

    if (!sourceId || !amount || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const amountMoney = BigInt(Math.round(parseFloat(amount) * 100));
    const userProfile = await getUserProfile(userId);

    if (!userProfile) {
       return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    let squareCustomerId = userProfile.squareCustomerId;

    // 1. Handle Square Customer Creation
    if (!squareCustomerId) {
       try {
          const customerRes = await squareClient.customers.create({
             emailAddress: userProfile.email,
             givenName: userProfile.displayName.split(' ')[0] || 'User',
             idempotencyKey: crypto.randomUUID(),
          });
          squareCustomerId = (customerRes as any).customer?.id || (customerRes as any).result?.customer?.id;
          if (squareCustomerId) {
             await updateUserProfile(userId, { squareCustomerId });
          }
       } catch (err) {
          console.error('Error creating Square customer:', err);
       }
    }

    let paymentSourceId = sourceId;

    // 2. If subscription, we might want to save the card for recurring payments
    if (type === 'subscription' && squareCustomerId) {
       try {
          // Link card to customer for recurring use
          const cardRes = await squareClient.cards.create({
            idempotencyKey: crypto.randomUUID(),
            sourceId: sourceId,
            card: {
              customerId: squareCustomerId,
              cardholderName: userProfile.displayName,
            }
          });
          
          const cardId = (cardRes as any).card?.id || (cardRes as any).result?.card?.id;
          if (cardId) {
             paymentSourceId = cardId;
             console.log('Card linked to customer for recurring billing:', cardId);
          }
       } catch (err) {
          console.error('Error linking card:', err);
          // Don't fail the initial payment if card linking fails for some reason
       }
    }

    // 3. Process Initial Payment
    const response = await squareClient.payments.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId: paymentSourceId,
      amountMoney: {
        currency: 'USD',
        amount: amountMoney,
      },
      note: `${type === 'subscription' ? 'Subscription' : 'Recharge'} for ${userId}`,
      customerId: squareCustomerId,
    });

    const payment = (response as any).payment || (response as any).result?.payment || (response as any).body?.payment;
    
    if (payment?.status === 'COMPLETED') {
       if (type === 'recharge') {
          await addFunds(userId, Number(amountMoney), payment.id);
       } else if (type === 'subscription') {
          if (creatorId) {
             await addFunds(
               creatorId, 
               Number(amountMoney), 
               payment.id, 
               'Subscription Revenue', 
               { subscriberId: userId, tierId, category: 'subscription' },
               true // applySplit
             );
          }
       }
    }

    return NextResponse.json({ 
      success: true, 
      payment: JSON.parse(JSON.stringify(payment, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value 
      ))
    });

  } catch (error) {
    console.error('Square Payment Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}
