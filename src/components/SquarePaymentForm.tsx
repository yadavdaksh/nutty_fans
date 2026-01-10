'use client';

import { CreditCard, PaymentForm } from 'react-square-web-payments-sdk';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SquarePaymentFormProps {
  amount: string; 
  userId: string;
  creatorId: string;
  tierId: string;
  creatorName: string;
  type?: 'subscription' | 'recharge'; // Default to subscription
  onSuccess: (result: unknown) => Promise<void>;
  onCancel?: () => void;
}

export default function SquarePaymentForm({ 
  amount, 
  userId, 
  creatorId, 
  tierId, 
  creatorName, 
  type = 'subscription', 
  onSuccess, 
  onCancel 
}: SquarePaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full">
      <PaymentForm
        applicationId={process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ''}
        locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ''}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cardTokenizeResponseReceived={async (token: any, verifiedBuyer) => {
          setLoading(true);
          setError(null);
          try {
            const response = await fetch('/api/payments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sourceId: token.token,
                verificationToken: verifiedBuyer?.token,
                amount: amount,
                userId: userId,
                creatorId: creatorId,
                tierId: tierId,
                type: type, 
              }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
              await onSuccess(data);
            } else {
              setError(data.error || 'Payment processing failed');
            }
          } catch (err) {
            console.error('Payment Error:', err);
            setError('An unexpected error occurred processing payment');
          } finally {
            setLoading(false);
          }
        }}
        createVerificationDetails={() => ({
          amount: amount,
          currencyCode: 'USD',
          intent: 'CHARGE',
          billingContact: {
            givenName: 'Test',
            familyName: 'User',
          }
        })}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
             <p className="text-sm text-gray-500 mb-1">Total to pay for {creatorName}</p>
             <p className="text-2xl font-bold text-gray-900">${amount}</p>
          </div>
          
          <CreditCard 
             buttonProps={{
               css: {
                 backgroundColor: '#9810fa',
                 fontSize: '16px',
                 color: '#fff',
                 '&:hover': {
                   backgroundColor: '#8109d6',
                 },
               }
             }}
          />
          
          {loading && (
             <div className="flex items-center justify-center gap-2 text-purple-600 mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Processing payment...</span>
             </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full py-2 text-gray-500 text-sm font-medium hover:text-gray-700 mt-2 disabled:opacity-50"
          >
            Cancel Transaction
          </button>
        </div>
      </PaymentForm>
    </div>
  );
}
