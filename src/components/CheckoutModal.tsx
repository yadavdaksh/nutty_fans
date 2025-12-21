'use client';

import { useState } from 'react';
import { X, Ticket, Check, Loader2, Sparkles, CreditCard } from 'lucide-react';
import { validateCoupon } from '@/lib/db';
import { Coupon } from '@/lib/db';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: {
    name: string;
    price: string;
    description?: string;
    benefits: string[];
  };
  onConfirm: (finalPrice: string, couponCode?: string) => Promise<void>;
  creatorName: string;
}

export default function CheckoutModal({ isOpen, onClose, tier, onConfirm, creatorName }: CheckoutModalProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const originalPrice = parseFloat(tier.price);
  let finalPrice = originalPrice;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      finalPrice = originalPrice * (1 - appliedCoupon.discountValue / 100);
    } else {
      finalPrice = Math.max(0, originalPrice - appliedCoupon.discountValue);
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidating(true);
    setError('');
    try {
      const coupon = await validateCoupon(couponCode);
      if (coupon) {
        setAppliedCoupon(coupon);
        setCouponCode('');
        setError('');
      } else {
        setError('Invalid or expired coupon code.');
        setAppliedCoupon(null);
      }
    } catch {
      setError('Error validating coupon. Try again.');
      setAppliedCoupon(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(finalPrice.toFixed(2), appliedCoupon?.code);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to process subscription.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="relative h-28 bg-gradient-to-br from-[#9810fa] to-[#e60076] flex items-center justify-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-md border border-white/20">
               <Sparkles className="w-3 h-3 fill-current" />
               SECURE CHECKOUT
             </div>
             <h2 className="text-2xl font-bold text-white tracking-tight">Complete Subscription</h2>
          </div>
        </div>

        <div className="p-6">
          {/* Creator & Tier Info */}
          <div className="flex items-center gap-4 mb-6">
             <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-purple-600 shadow-inner">
               {creatorName[0]?.toUpperCase()}
             </div>
             <div>
               <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Subscribing to</p>
               <h3 className="text-xl font-bold text-gray-900">{creatorName}</h3>
               <p className="text-indigo-600 font-semibold text-sm">{tier.name} Tier Access</p>
             </div>
          </div>

          {/* Benefits Summary */}
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 mb-6">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Included Benefits</p>
             <ul className="space-y-2">
               {tier.benefits.slice(0, 3).map((benefit, i) => (
                 <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                   <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                     <Check className="w-2.5 h-2.5 text-green-600" />
                   </div>
                   {benefit}
                 </li>
               ))}
             </ul>
          </div>

          {/* Coupon Input */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Have a coupon?</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold tracking-wider text-gray-900 placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
              <button 
                onClick={handleApplyCoupon}
                disabled={isValidating || !couponCode}
                className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              >
                {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2 font-medium px-1 flex items-center gap-1">⚠️ {error}</p>}
            {appliedCoupon && (
              <p className="text-green-600 text-xs mt-2 font-bold px-1 flex items-center gap-1 animate-in slide-in-from-top-1">
                <Check className="w-3 h-3" />
                Coupon Applied: {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `$${appliedCoupon.discountValue}`} OFF
              </p>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 border-t border-gray-100 pt-5 mb-6">
            <div className="flex justify-between items-center text-sm font-medium text-gray-500">
              <span>Original Price</span>
              <span>${tier.price}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between items-center text-sm font-bold text-green-600">
                <span>Discount Applied</span>
                <span>-{appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `$${appliedCoupon.discountValue}`}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-gray-900">Total Due Today</span>
              <div className="text-right">
                <div className="text-2xl font-black text-gray-900 tracking-tight">${finalPrice.toFixed(2)}</div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Recurring Monthly</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-[#9810fa] to-[#e60076] hover:from-[#8109d6] hover:to-[#cd0069] text-white rounded-2xl font-bold shadow-xl shadow-purple-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Subscribe Now
              </>
            )}
          </button>
          
          <p className="text-[11px] text-gray-400 text-center mt-4 px-4 leading-relaxed font-medium">
            By subscribing, you agree to our <span className="underline cursor-pointer">Terms of Service</span>. Payments are non-refundable and will renew automatically until cancelled.
          </p>
        </div>
      </div>
    </div>
  );
}
