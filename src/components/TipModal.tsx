'use client';

import { useState,useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getWalletBalance, processTransaction } from '@/lib/db';
import InsufficientFundsModal from './modals/InsufficientFundsModal';
import RechargeModal from './RechargeModal';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  userId: string;
}

export default function TipModal({ isOpen, onClose, creatorId, creatorName, userId }: TipModalProps) {
  const [amount, setAmount] = useState('5.00');
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setAmount('5.00');
      setCustomAmount('');
      setBalance(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const checkBalance = async () => {
     setLoading(true);
     const bal = await getWalletBalance(userId);
     setBalance(bal);
     setLoading(false);
     setStep('confirm');
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleSelectAmount = (val: string) => {
    setAmount(val);
    setCustomAmount('');
    checkBalance();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAmount || parseFloat(customAmount) < 1) {
       toast.error("Minimum tip is $1.00");
       return;
    }
    setAmount(parseFloat(customAmount).toFixed(2));
    checkBalance();
  };

  const handleConfirmTip = async () => {
    const tipAmountCents = Math.round(parseFloat(amount) * 100);
    if (!balance || balance < tipAmountCents) {
       setShowInsufficientModal(true);
       return;
    }

    setLoading(true);
    try {
      await processTransaction(
         userId,
         tipAmountCents,
         `Tip to ${creatorName}`,
         { creatorId, contentType: 'tip', category: 'tip' }
      );
      toast.success(`Successfully tipped $${amount} to ${creatorName}! 🚀`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to process tip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Send a Tip</h3>
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
                  <p className="text-sm text-gray-500 mb-4">Support <strong>{creatorName}</strong> with a tip! 100% goes to the creator (minus fees).</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['1.00', '5.00', '10.00', '20.00', '50.00', '100.00'].map((val) => (
                      <button
                        key={val}
                        onClick={() => handleSelectAmount(val)}
                        className="py-3 px-2 border border-gray-200 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 hover:text-yellow-700 font-medium transition-all text-sm"
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <form onSubmit={handleCustomSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input 
                        type="number" 
                        min="1" 
                        step="0.01"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                        placeholder="Custom amount"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!customAmount}
                      className="px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 text-sm"
                    >
                      Next
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Tipping</p>
                    <p className="text-4xl font-bold text-gray-900 mt-1">${amount}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Your Wallet Balance</span>
                      <span className="font-semibold text-gray-900">
                          {balance !== null ? `$${(balance/100).toFixed(2)}` : <Loader2 className="w-4 h-4 animate-spin" />}
                      </span>
                    </div>
                    {balance !== null && balance < Math.round(parseFloat(amount) * 100) && (
                        <div className="text-red-500 text-xs font-semibold mt-2 flex items-center gap-1">
                          ⚠️ Insufficient funds. 
                          <button 
                            onClick={() => setShowInsufficientModal(true)}
                            className="underline hover:text-red-600"
                          >
                            Recharge now
                          </button>
                        </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmTip}
                      disabled={loading || (balance !== null && balance < Math.round(parseFloat(amount) * 100))}
                      className="flex-[2] py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Tip'}
                    </button>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <InsufficientFundsModal 
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        onRecharge={() => setShowRechargeModal(true)}
        requiredAmount={amount}
        currentBalance={balance !== null ? (balance / 100).toFixed(2) : undefined}
      />

      <RechargeModal 
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />
    </>
  );
}
