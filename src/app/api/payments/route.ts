/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { squareClient } from '@/lib/square';
import { addFunds, getUserProfile, updateUserProfile, getCreatorProfile } from '@/lib/db'; 

import { verifyAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
  try {
    // 1. [SECURITY] Auth Verification
    const { user, error } = await verifyAuth(request);
    if (error) {
      console.error('Payment Auth Error:', await error.json());
      return error;
    }

    const body = await request.json();
    console.log('Payment Request Body:', JSON.stringify(body, null, 2));

    const { sourceId, amount, creatorId, tierId, type, discountId, verificationToken } = body; 
    const userId = user.uid; // Always use verified UID

    if (!sourceId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // [SECURITY] Server-side Price Verification for Subscriptions
    let finalPayloadAmount = amount;
    if (type === 'subscription' && creatorId && tierId) {
      const creatorProfile = await getCreatorProfile(creatorId);
      const tier = creatorProfile?.subscriptionTiers.find(t => t.name.toLowerCase() === tierId.toLowerCase());
      
      if (!tier) {
        return NextResponse.json({ error: 'Subscription tier not found' }, { status: 400 });
      }

      const expectedPrice = parseFloat(tier.price);
      const submittedPrice = parseFloat(amount);

      // Allow small float epsilon or exact match
      if (Math.abs(expectedPrice - submittedPrice) > 0.01) {
        console.warn(`[SECURITY] Price mismatch detected for ${userId}. Expected: ${expectedPrice}, Submitted: ${submittedPrice}`);
        return NextResponse.json({ error: 'Price mismatch detected' }, { status: 400 });
      }
      
      finalPayloadAmount = tier.price; // Use the verified price
    }

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

    // 3. Create Order to apply discounts natively
    const basePriceMoney = BigInt(Math.round(parseFloat(finalPayloadAmount) * 100)); // The non-discounted price
    
    // Construct line items
    const lineItem: any = {
      name: `${type === 'subscription' ? 'Subscription' : 'Recharge'} - ${tierId || 'Generic'}`,
      quantity: '1',
      basePriceMoney: {
        amount: basePriceMoney,
        currency: 'USD'
      }
    };

    // Construct taxes/discounts
    const discounts = discountId ? [{ catalogObjectId: discountId }] : undefined;

    const orderReq = {
      idempotencyKey: crypto.randomUUID(),
      order: {
        locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '',
        customerId: squareCustomerId,
        lineItems: [lineItem],
        discounts: discounts
      }
    };

    const orderRes = await squareClient.orders.create(orderReq);
    const order = (orderRes as any).order || (orderRes as any).result?.order;
    
    if (!order) {
       throw new Error("Failed to create Square Order");
    }

    // 4. Process Payment for the Order
    // The order.totalMoney will reflect the discounted price
    const finalAmountMoney = order.totalMoney.amount;
    
    const paymentRes = await squareClient.payments.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId: paymentSourceId,
      amountMoney: {
        currency: 'USD',
        amount: finalAmountMoney,
      },
      orderId: order.id, // Link to the order
      note: `${type === 'subscription' ? 'Subscription' : 'Recharge'} for ${userId}`,
      customerId: squareCustomerId,
    });

    const payment = (paymentRes as any).payment || (paymentRes as any).result?.payment || (paymentRes as any).body?.payment;
    
    if (payment?.status === 'COMPLETED') {
       // Convert back to number for DB logic
       const finalAmountNumber = Number(finalAmountMoney);

       if (type === 'recharge') {
          await addFunds(userId, finalAmountNumber, payment.id);
       } else if (type === 'subscription') {
          if (creatorId) {
             await addFunds(
                creatorId, 
                finalAmountNumber, 
                payment.id, 
                'Subscription Revenue', 
                { subscriberId: userId, tierId, category: 'subscription', orderId: order.id, discountId },
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
    console.error('Payment Processing Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}
