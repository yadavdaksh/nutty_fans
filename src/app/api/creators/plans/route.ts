import { NextResponse } from 'next/server';
import { getUserProfile, createCreatorProfile } from '@/lib/db';
import { getOrCreateSubscriptionPlan } from '@/lib/square-plans';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, tiers } = body;

    if (!userId || !tiers || !Array.isArray(tiers)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const creatorDisplayName = userProfile.displayName || 'Creator';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedTiers = await Promise.all(tiers.map(async (tier: any) => {
      // If we already have a plan ID and the price hasn't changed (complex to check), we could skip.
      // But simplifying: We always 'get or create' based on Name + Price key.
      
      // We construct a unique name for Square Catalog: "TierName - CreatorName"
      // This is what appears on the customer's bank statement or invoice often.
      const uniquePlanName = `${tier.name} - ${creatorDisplayName}`;
      const price = parseFloat(tier.price);

      if (isNaN(price)) {
          throw new Error(`Invalid price for tier ${tier.name}`);
      }

      // Create in Square
      const squarePlanId = await getOrCreateSubscriptionPlan(uniquePlanName, price);

      return {
        ...tier,
        squarePlanId
      };
    }));

    // Update Firestore
    // We treat this as an update to the 'subscriptionTiers' field
    await createCreatorProfile(userId, {
        subscriptionTiers: updatedTiers
    });

    return NextResponse.json({ success: true, tiers: updatedTiers });
  } catch (error) {
    console.error('Error syncing plans:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to sync plans' },
      { status: 500 }
    );
  }
}
