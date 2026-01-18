import { squareClient } from './square';

export interface DiscountSearchResult {
  valid: boolean;
  id?: string;
  name?: string;
  type?: 'FIXED' | 'PERCENTAGE';
  value?: number;
  currency?: string;
}

export const searchSquareDiscount = async (code: string): Promise<DiscountSearchResult> => {
  try {
    const response = await squareClient.catalog.search({
      objectTypes: ['DISCOUNT'],
      query: {
        textQuery: {
          keywords: [code]
        }
      }
    });

    // Handle potential BigInt serialization issues by standardizing response access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (response as any).result || response;
    
    if (!result.objects || result.objects.length === 0) {
      return { valid: false };
    }

    // Find exact match (case insensitive)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const discountObj = result.objects.find((obj: any) => 
      obj.discountData?.name?.toUpperCase() === code.toUpperCase()
    );

    if (!discountObj) {
      return { valid: false };
    }

    if (!discountObj || !discountObj.discountData) {
      return { valid: false };
    }

    const data = discountObj.discountData;
    const type = data.percentage ? 'PERCENTAGE' : 'FIXED';
    let value = 0;
    let currency = 'USD';

    if (type === 'PERCENTAGE') {
      value = parseFloat(data.percentage);
    } else if (data.amountMoney) {
      // Square money is in cents/base units usually, but let's check format
      // If it's BigInt, converted to string often
      const amount = data.amountMoney.amount;
      value = Number(amount) / 100; // Convert cents to dollars
      currency = data.amountMoney.currency;
    }

    return {
      valid: true,
      id: discountObj.id,
      name: data.name,
      type,
      value,
      currency
    };

  } catch (error) {
    console.error('Error searching Square catalog:', error);
    return { valid: false };
  }
};
