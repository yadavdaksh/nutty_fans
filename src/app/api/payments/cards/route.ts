import { NextResponse } from 'next/server';
import { squareClient } from '@/lib/square';
import { getUserProfile } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

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
