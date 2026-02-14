'use client';

import { X, Video, Loader2, Wallet } from 'lucide-react';
import { Stream, getWalletBalance, purchaseStreamAccess } from '@/lib/db';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import RechargeModal from '../RechargeModal'; // Assuming correct path, check folder structure
import Link from 'next/link';

interface StreamPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamData: Stream;
  onSuccess: () => void;
  creatorName: string;
}

export default function StreamPurchaseModal({ isOpen, onClose, streamData, onSuccess, creatorName }: StreamPurchaseModalProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && user) {
        fetchBalance();
    }
  }, [isOpen, user]);

  const fetchBalance = async () => {
     if (!user) return;
     setLoading(true);
     try {
       const bal = await getWalletBalance(user.uid);
       setBalance(bal);
     } catch (e) {
       console.error("Failed to fetch balance", e);
     } finally {
       setLoading(false);
     }
  };

  const handlePurchase = async () => {
    if (!user || !streamData.price) return;
    
    setBuying(true);
    try {
        await purchaseStreamAccess(
            user.uid,
            streamData.creatorId,
            streamData.id,
            streamData.price
        );
        toast.success("Ticket purchased! Enjoy the show! 🎟️");
        onSuccess();
    } catch (e) {
        console.error("Purchase failed", e);
        toast.error((e as Error).message || "Purchase failed");
    } finally {
        setBuying(false);
    }
  };

  if (!isOpen) return null;

  const price = streamData.price || 0;
  const priceCents = Math.round(price * 100);
  const hasFunds = balance !== null && balance >= priceCents;

  return (
    <>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative h-28 bg-gray-900 flex flex-col items-center justify-center text-center p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-500/20">
             <Video className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Unlock Stream</h2>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
             <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Price</p>
                <p className="text-2xl font-bold text-gray-900">${price.toFixed(2)}</p>
             </div>
             <div className="text-right">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Creator</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{creatorName}</p>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                   <Wallet className="w-4 h-4" />
                   <span>Your Wallet</span>
                </div>
                <div className="font-bold text-gray-900">
                   {loading ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                   ) : (
                     `$${((balance || 0) / 100).toFixed(2)}`
                   )}
                </div>
             </div>

             {!loading && !hasFunds && (
                 <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                    <span>⚠️ Insufficient funds.</span>
                    <button 
                      onClick={() => setShowRechargeModal(true)}
                      className="font-bold hover:underline"
                    >
                        Recharge
                    </button>
                 </div>
             )}

             <button
                onClick={handlePurchase}
                disabled={loading || !hasFunds || buying}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
             >
                {buying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                ) : (
                    "Confirm Purchase"
                )}
             </button>
          </div>
        </div>
      </div>
    </div>

    <RechargeModal 
        isOpen={showRechargeModal}
        onClose={() => {
            setShowRechargeModal(false);
            fetchBalance(); // Refresh balance after potential recharge
        }}
    />
    </>
  );
}
