import { NextResponse } from 'next/server';
import { squareClient } from '@/lib/square';
import { getUserProfile } from '@/lib/db';
import { verifyAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    // 1. [SECURITY] Auth Verification
    const { user, error } = await verifyAuth(request);
    if (error) return error;

    const userId = user.uid; // Always use verified UID
    const userProfile = await getUserProfile(userId);

    if (!userProfile?.squareCustomerId) {
      return NextResponse.json({ cards: [] });
    }

    const response = (await squareClient.cards.list({
      customerId: userProfile.squareCustomerId,
    })) as unknown as { result: { cards?: Record<string, unknown>[] } };

    const cards = response.result?.cards || [];

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Error fetching Square cards:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}
