export interface MercuryBankDetails {
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  emails: string[];
  country?: string;
  electronicAccountType?: 'businessChecking' | 'businessSavings' | 'personalChecking' | 'personalSavings';
  address?: {
    address1: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
}

const isProduction = process.env.MERCURY_ENVIRONMENT === 'production';
const MERCURY_API_BASE = isProduction 
  ? 'https://api.mercury.com/api/v1/' 
  : 'https://api-sandbox.mercury.com/api/v1/';

async function getMercuryAccount() {
  if (process.env.MERCURY_ACCOUNT_ID) {
    return process.env.MERCURY_ACCOUNT_ID;
  }

  // Fetch accounts if ID is not in env
  const response = await fetch(`${MERCURY_API_BASE}accounts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.MERCURY_API_KEY}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch Mercury accounts: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  const account = data.accounts?.[0];

  if (!account) {
    throw new Error('No Mercury accounts found for this API key');
  }

  return account.id;
}

export async function createMercuryRecipient(bankDetails: MercuryBankDetails) {
  const response = await fetch(`${MERCURY_API_BASE}recipients`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MERCURY_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      name: bankDetails.accountHolderName,
      emails: bankDetails.emails,
      defaultPaymentMethod: 'ach',
      electronicRoutingInfo: {
        accountNumber: bankDetails.accountNumber,
        routingNumber: bankDetails.routingNumber,
        electronicAccountType: bankDetails.electronicAccountType || 'personalChecking',
        address: bankDetails.address || {
          address1: '123 Main St',
          city: 'New York',
          region: 'NY',
          postalCode: '10001',
          country: bankDetails.country || 'US',
        }
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercury Recipient Error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.id; // Return the recipient ID
}

export async function triggerMercuryPayout(
  recipientId: string,
  amountInCents: number,
  idempotencyKey: string,
  note: string = 'Creator Payout'
) {
  const amountInDollars = amountInCents / 100;
  const accountId = await getMercuryAccount();

  const response = await fetch(`${MERCURY_API_BASE}account/${accountId}/transactions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MERCURY_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      recipientId: recipientId,
      amount: Number(amountInDollars.toFixed(2)),
      paymentMethod: 'ach',
      idempotencyKey: idempotencyKey,
      note: note,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Mercury API Error Body:', JSON.stringify(errorBody, null, 2));
    const errorMessage = errorBody.errors?.message || errorBody.message || response.statusText;
    throw new Error(`Mercury Payout Error: ${errorMessage}`);
  }

  const data = await response.json();
  return data;
}
