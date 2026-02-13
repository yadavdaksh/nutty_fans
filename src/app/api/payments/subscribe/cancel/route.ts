import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { squareSubscriptionId } = await request.json();

    if (!squareSubscriptionId) {
      return NextResponse.json({ error: 'Missing squareSubscriptionId' }, { status: 400 });
    }

    const isProduction = process.env.SQUARE_ENVIRONMENT === 'production';
    const baseUrl = isProduction ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';

    // According to Square API: POST /v2/subscriptions/{subscription_id}/cancel
    // With body: { cancel_at_period_end: true }
    const response = await fetch(`${baseUrl}/v2/subscriptions/${squareSubscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2024-12-18'
      },
      body: JSON.stringify({
        // This is the key part: stop renewal but keep access until end of period
        cancel_at_period_end: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Square Cancel API Failed:", JSON.stringify(data, null, 2));
      throw new Error(`Square API Error: ${data.errors?.[0]?.detail || response.statusText}`);
    }

    return NextResponse.json({ 
      success: true, 
      subscription: data.subscription 
    });

  } catch (error) {
    console.error('Subscription Cancel Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to cancel subscription on Square' },
      { status: 500 }
    );
  }
}
