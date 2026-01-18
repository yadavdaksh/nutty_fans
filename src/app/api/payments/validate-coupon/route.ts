import { NextResponse } from 'next/server';
import { searchSquareDiscount } from '@/lib/square-catalog';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const result = await searchSquareDiscount(code);

    if (!result.valid) {
      return NextResponse.json(
        { error: 'Invalid or expired coupon code.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Coupon Validation Error:', error);
    return NextResponse.json(
      { error: 'Internal server error validating coupon' },
      { status: 500 }
    );
  }
}
