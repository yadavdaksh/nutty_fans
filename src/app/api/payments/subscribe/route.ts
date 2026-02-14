import { NextResponse } from 'next/server';
import { squareClient } from '@/lib/square';
import { getUserProfile, updateUserProfile } from '@/lib/db';
import { getOrCreateSubscriptionPlan } from '@/lib/square-plans';

import { verifyAuth } from '@/lib/api-auth';
import { getCreatorProfile } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // 1. [SECURITY] Auth Verification
    const { user, error } = await verifyAuth(request);
    if (error) return error;

    const body = await request.json();
    const { sourceId, creatorId, tierName, price } = body; 
    const userId = user.uid; // Always use verified UID

    if (!sourceId || !price || !creatorId || !tierName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. [SECURITY] Price Verification
    const creatorData = await getCreatorProfile(creatorId);
    const tier = creatorData?.subscriptionTiers.find((t: { name: string; price: string }) => t.name === tierName);
    
    if (!tier) {
      return NextResponse.json({ error: 'Subscription tier not found' }, { status: 400 });
    }

    const expectedPrice = parseFloat(tier.price);
    const submittedPrice = parseFloat(price);

    if (Math.abs(expectedPrice - submittedPrice) > 0.01) {
      console.warn(`[SECURITY] Price mismatch in subscribe API. Expected: ${expectedPrice}, Submitted: ${submittedPrice}`);
      return NextResponse.json({ error: 'Price mismatch detected' }, { status: 400 });
    }

    const userProfile = await getUserProfile(userId);
    if (!userProfile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 1. Get/Create Customer
    let squareCustomerId = userProfile.squareCustomerId;
    if (!squareCustomerId) {
       const customerRes = await squareClient.customers.create({
          emailAddress: userProfile.email,
          givenName: userProfile.displayName,
          idempotencyKey: crypto.randomUUID(),
       });
       console.log("Square Customer Create Response:", JSON.stringify(customerRes, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value // Handle BigInt in JSON
       , 2));

       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       squareCustomerId = (customerRes as any).result?.customer?.id || (customerRes as any).customer?.id; 
       
       if (squareCustomerId) {
           await updateUserProfile(userId, { squareCustomerId });
       } else {
           console.error("Failed to parse customer ID from response");
       }
    }

    if (!squareCustomerId) throw new Error("Could not create customer profile");

    // 2. Save Card (Required for Subscriptions)
    const cardRes = await squareClient.cards.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId: sourceId,
      card: {
        customerId: squareCustomerId,
        cardholderName: userProfile.displayName,
      }
    });
    
    console.log("Square Card Save Response:", JSON.stringify(cardRes, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    , 2));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cardId = (cardRes as any).result?.card?.id || (cardRes as any).card?.id;
    
    if (!cardId) {
        console.error("Failed to parse Card ID. Full response:", cardRes);
        throw new Error("Failed to save card on file");
    }

    // 3. Get proper Plan ID
    // Check if Creator has this tier synced
    
    let planId: string | undefined;

    // Try to find existing plan ID in Creator's profile
    if (creatorData && creatorData.subscriptionTiers) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = creatorData.subscriptionTiers.find((t: any) => t.name === tierName);
        if (t && t.squarePlanId) {
            planId = t.squarePlanId;
            console.log(`Using existing Square Plan ID: ${planId} for tier ${tierName}`);
        }
    }

    if (!planId) {
        console.log(`Plan ID not found for ${tierName}, creating new one...`);
        // We create a plan specific to this Creator + Tier so the statement descriptor and price are correct.
        const uniquePlanName = `Sub: ${tierName} with ${creatorId.slice(0, 5)}...`; 
        planId = await getOrCreateSubscriptionPlan(uniquePlanName, parseFloat(price));
    }

    // 4. Create Subscription
    // DIRECT FETCH as SDK seems to drop 'planId'
    const isProduction = process.env.SQUARE_ENVIRONMENT === 'production';
    const baseUrl = isProduction ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
    
    console.log("Creating subscription with planId:", planId);

    const subResponse = await fetch(`${baseUrl}/v2/subscriptions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
            'Square-Version': '2024-12-18' // Newer version to ensure plan_id support
        },
        body: JSON.stringify({
            idempotency_key: crypto.randomUUID(),
            location_id: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '',
            plan_variation_id: planId, // This variable now holds the Variation ID
            customer_id: squareCustomerId,
            card_id: cardId,
            timezone: 'America/Los_Angeles'
        })
    });

    const subData = await subResponse.json();

    if (!subResponse.ok) {
        console.error("Subscription API Failed:", JSON.stringify(subData, null, 2));
        throw new Error(`Square API Error: ${subData.errors?.[0]?.detail || subResponse.statusText}`);
    }

    const subscription = subData.subscription;

    if (!subscription) throw new Error("Failed to create subscription");

    // Note: We don't manually add funds here! 
    // We wait for the 'invoice.payment_made' webhook to confirm the FIRST payment succeeded.
    // However, for UX, we might assume success if no error thrown, but safest is to rely on webhook
    // or check the initial invoice status immediately if included in response.

    return NextResponse.json({ 
      success: true, 
      subscriptionId: subscription.id,
      status: subscription.status 
    });

  } catch (error) {
    console.error('Subscription Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Subscription failed' },
      { status: 500 }
    );
  }
}
