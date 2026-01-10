import { NextResponse } from 'next/server';
import { squareClient } from '@/lib/square';
import { addFunds } from '@/lib/db'; 
// Correction: We cannot use useAuth hook in API route. We will rely on passed userId or verify session if we had session cookies.
// For now, we will trust the userId passed in body (MVP) or verify firebase token if we implement that.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId, amount, userId, creatorId, tierId, type } = body; // type added

    if (!sourceId || !amount || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real app, verify the amount matches the tier price from DB.
    // For MVP, we use the amount sent from frontend (converted to cents/minor units for Square).
    
    // Square expects amount in bigint money (minor units, e.g. cents).
    // Assuming amount passed is in dollars (string or number), e.g. "5.00"
    const amountMoney = BigInt(Math.round(parseFloat(amount) * 100));

    const response = await squareClient.payments.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId: sourceId,
      amountMoney: {
        currency: 'USD',
        amount: amountMoney,
      },
      note: `Subscription for creator ${creatorId} tier ${tierId}`,
      buyerEmailAddress: 'example@test.com', // In real app, fetch user email
    });

    // SDK v43 returns the response body directly or properly typed
    // Note: If BigInt is returned, we need to handle serialization.
    // Inspecting 'response' to be sure, but assuming it has 'payment'
    // If response is the body, it has .payment.
    
    // Check if result is wrapped or direct
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payment = (response as any).payment || (response as any).result?.payment || (response as any).body?.payment;
    
    console.log('Payment processed:', { 
      id: payment?.id, 
      status: payment?.status, 
      type, 
      userId, 
      amountMoney 
    });

    if (type === 'recharge' && payment?.status === 'COMPLETED') {
       console.log('Adding funds to wallet...', { userId, amount: Number(amountMoney) });
       try {
         await addFunds(userId, Number(amountMoney), payment.id);
         console.log('Funds added successfully');
       } catch (err) {
         console.error('Error adding funds:', err);
       }
    } else if (type === 'subscription' && payment?.status === 'COMPLETED') {
       console.log('Processing subscription revenue...', { creatorId, amount: Number(amountMoney) });
       try {
          // Credit the creator's wallet
          if (creatorId) {
             await addFunds(
               creatorId, 
               Number(amountMoney), 
               payment.id, 
               'Subscription Revenue', 
               { subscriberId: userId, tierId, category: 'subscription' }
             );
             console.log('Creator credited successfully');
          } else {
             console.error('No creatorId provided for subscription payment');
          }
       } catch (err) {
          console.error('Error crediting creator:', err);
       }
    }

    return NextResponse.json({ 
      success: true, 
      payment: JSON.parse(JSON.stringify(payment, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value // Handle BigInt serialization
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
