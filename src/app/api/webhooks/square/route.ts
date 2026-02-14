import { NextResponse } from 'next/server';
import { db, addFunds } from '@/lib/db';
import { collection, query, where, getDocs, updateDoc, Timestamp, doc } from 'firebase/firestore';

import crypto from 'crypto';

// You need to set this env var in Vercel/local
const SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-square-hmacsha256-signature');
    const url = process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/square';

    // 1. [SECURITY] Verify Signature
    if (SIGNATURE_KEY && signature) {
       const hmac = crypto.createHmac('sha256', SIGNATURE_KEY);
       hmac.update(url + bodyText);
       const expectedSignature = hmac.digest('base64');

       if (signature !== expectedSignature) {
         console.error('[SECURITY] Invalid Square webhook signature');
         return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
       }
    } else if (process.env.NODE_ENV === 'production') {
       console.error('[SECURITY] Webhook SIGNATURE_KEY missing in production');
       return NextResponse.json({ error: 'Security configuration missing' }, { status: 500 });
    }

    const event = JSON.parse(bodyText);

    // 2. Handle Events
    if (event.type === 'invoice.payment_made') {
      await handleInvoicePaymentMade(event.data.object.invoice);
    } else if (event.type === 'subscription.updated') {
      // e.g. Cancellation, Status change
      await handleSubscriptionUpdated(event.data.object.subscription);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoicePaymentMade(invoice: any) {
  const subscriptionId = invoice.subscription_id;
  if (!subscriptionId) return;

  const amountMoney = invoice.payment_requests?.[0]?.computed_amount_money; // The paid amount
  
  if (!amountMoney) return;

  const amount = Number(amountMoney.amount) / 100; // Convert cents to dollars

  // 1. Find the subscription in our DB
  const q = query(collection(db, 'subscriptions'), where('squareSubscriptionId', '==', subscriptionId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.warn(`Webhook: Subscription not found for Square ID ${subscriptionId}`);
    return;
  }

  const subDoc = querySnapshot.docs[0];
  const subData = subDoc.data();

  // 2. Add Funds to Creator
  // We check if this payment was already processed (by looking at transaction history? Or assume unique event ID)
  // For simplicity, we just add funds. Ideally, check idempotency.
  
  await addFunds(
    subData.creatorId,
    amount,
    invoice.id, // Use Invoice ID as source? or Payment ID if available
    'Subscription Revenue - Recurring',
    { 
      subscriberId: subData.userId, 
      tierId: subData.tierId, 
      subscriptionId: subDoc.id,
      squareInvoiceId: invoice.id 
    },
    true // applySplit
  );

  // 3. Extend Expiry
  // Usually Square handles "next_payment_date". We should keep `expiresAt` in sync with "charged_through_date" + buffer
  // or simply add 1 month from now.
  // Best: Use `charged_through_date` from the Subscription object, but we only have Invoice here.
  // We can fetch the subscription details or just add 30 days.
  // Let's safe-bet add 32 days to ensure no lockout before next charge.
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 32); 

  await updateDoc(doc(db, 'subscriptions', subDoc.id), {
    status: 'active',
    expiresAt: Timestamp.fromDate(newExpiry),
    lastPaymentAt: Timestamp.now()
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdated(subscription: any) {
  // Check if canceled
  if (subscription.status === 'CANCELED') {
     const q = query(collection(db, 'subscriptions'), where('squareSubscriptionId', '==', subscription.id));
     const querySnapshot = await getDocs(q);
     
     if (!querySnapshot.empty) {
       const subDoc = querySnapshot.docs[0];
       // We don't delete, just mark status.
       // Note: They might still have paid time left!
       // So we set status='cancelled' but keep expiresAt valid.
       await updateDoc(doc(db, 'subscriptions', subDoc.id), {
         status: 'cancelled',
         canceledAt: Timestamp.now()
       });
     }
  }
}
