'use client';

import { useState } from 'react';
import { X, Wallet } from 'lucide-react';
import SquarePaymentForm from './SquarePaymentForm';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast'; // Assuming we have it

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RechargeModal({ isOpen, onClose, onSuccess }: RechargeModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('10.00');
  const [customAmount, setCustomAmount] = useState('');
  const [step, setStep] = useState<'select' | 'pay'>('select');

  if (!isOpen) return null;

  const handleSelectAmount = (val: string) => {
    setAmount(val);
    setCustomAmount('');
    setStep('pay');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAmount || parseFloat(customAmount) < 1) {
       toast.error("Minimum amount is $1.00");
       return;
    }
    setAmount(parseFloat(customAmount).toFixed(2));
    setStep('pay');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Add Funds</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' ? (
            <div className="space-y-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount</label>
                 <div className="grid grid-cols-3 gap-3">
                     {['5.00', '10.00', '20.00', '50.00', '100.00', '200.00', '500.00'].map((val) => {
                       const isSelected = amount === val;
                       return (
                         <button
                           key={val}
                           onClick={() => handleSelectAmount(val)}
                           className={`py-3 px-4 border rounded-xl font-medium transition-all ${
                             isSelected 
                               ? 'border-purple-500 bg-purple-50 text-purple-700'
                               : 'bg-white border-gray-200 text-gray-900 hover:border-purple-200 hover:bg-purple-50/50 hover:text-purple-600'
                           }`}
                         >
                           ${val}
                         </button>
                       );
                     })}
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Or Enter Custom Amount</label>
                 <form onSubmit={handleCustomSubmit} className="flex gap-2">
                   <div className="relative flex-1">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                     <input 
                       type="number" 
                       min="1" 
                       step="0.01"
                       value={customAmount}
                       onChange={(e) => setCustomAmount(e.target.value)}
                       className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                       placeholder="0.00"
                     />
                   </div>
                   <button 
                     type="submit"
                     disabled={!customAmount}
                     className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50"
                   >
                     Continue
                   </button>
                 </form>
               </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                 <span className="text-gray-600 font-medium">Total to Pay</span>
                 <span className="text-2xl font-bold text-gray-900">${amount}</span>
              </div>
              
              <SquarePaymentForm 
                amount={amount}
                userId={user?.uid || ''}
                // We pass 'recharge' params
                tierId="wallet_recharge" 
                type="recharge"
                creatorId="system"
                creatorName="NuttyFans Wallet"
                onSuccess={() => {
                   toast.success("Wallet recharged successfully! 🚀");
                   onSuccess?.();
                   onClose();
                }}
              />
              
              <button 
                onClick={() => setStep('select')}
                className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Back to amount selection
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
