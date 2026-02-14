'use client';

import { Wallet, X, AlertCircle } from 'lucide-react';

interface InsufficientFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecharge: () => void;
  requiredAmount?: string;
  currentBalance?: string;
}

export default function InsufficientFundsModal({
  isOpen,
  onClose,
  onRecharge,
  requiredAmount,
  currentBalance,
}: InsufficientFundsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Header/Icon Area */}
        <div className="relative h-32 bg-gray-50 flex items-center justify-center">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center animate-pulse">
                    <Wallet className="w-10 h-10 text-red-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                   <AlertCircle className="w-6 h-6 text-red-600 fill-white" />
                </div>
            </div>
        </div>

        <div className="p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Funds</h3>
          <p className="text-gray-500 mb-6 leading-relaxed">
            You don&apos;t have enough balance to complete this action. Please top up your wallet to continue.
          </p>
          
          {(requiredAmount || currentBalance) && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-8 space-y-2">
               {currentBalance && (
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Current Balance</span>
                    <span className="font-bold text-gray-900">${currentBalance}</span>
                 </div>
               )}
               {requiredAmount && (
                 <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-500">Required</span>
                    <span className="font-bold text-red-600">${requiredAmount}</span>
                 </div>
               )}
            </div>
          )}
          
          <div className="flex flex-col gap-3">
             <button
               onClick={() => {
                 onRecharge();
                 onClose();
               }}
               className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-lg shadow-gray-200 active:scale-[0.98]"
             >
               Recharge Now
             </button>
             <button
               onClick={onClose}
               className="w-full py-4 bg-white hover:bg-gray-50 text-gray-500 rounded-2xl font-semibold transition-all"
             >
               Maybe Later
             </button>
          </div>
        </div>

        <div className="bg-gray-50 py-3 px-8 text-center border-t border-gray-100">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Secure Wallet Powered by NuttyFans
           </p>
        </div>
      </div>
    </div>
  );
}
