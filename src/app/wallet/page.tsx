'use client';

import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { db, WalletTransaction } from '@/lib/db';
import { doc, onSnapshot, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import RechargeModal from '@/components/RechargeModal';
import { format } from 'date-fns';

export default function WalletPage() {
  const { user, userProfile } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Real-time balance listener
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
       if (snap.exists()) {
         setBalance(snap.data().walletBalance || 0);
       }
    });

    // Fetch transactions (could be real-time too, but simple fetch for now)
    const fetchTransactions = async () => {
       try {
         const q = query(
           collection(db, 'wallet_transactions'), 
           where('userId', '==', user.uid),
           orderBy('timestamp', 'desc')
         );
         const snap = await getDocs(q);
         const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as WalletTransaction));
         setTransactions(txs);
       } catch (err) {
         console.error("Error fetching transactions:", err);
       } finally {
         setLoading(false);
       }
    };

    fetchTransactions();

    return () => unsubUser();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#f9fafb]">
        <Sidebar />
        <div className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'} p-8`}>
           <div className="max-w-4xl mx-auto space-y-8">
             
             {/* Header */}
             <div>
               <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h1>
               <p className="text-gray-500">Manage your funds and view transaction history</p>
             </div>

             {/* Balance Card */}
             <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[20px] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Wallet className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                   <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-xs">Total Balance</p>
                   <div className="text-5xl font-bold mb-8">
                     ${(balance / 100).toFixed(2)}
                   </div>
                   
                   <div className="flex gap-4">
                     <button 
                       onClick={() => setIsRechargeOpen(true)}
                       className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
                     >
                       <Plus className="w-5 h-5" />
                       Add Funds
                     </button>
                   </div>
                </div>
             </div>

             {/* Transactions */}
             <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction History</h3>
                
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No transactions yet</p>
                    <p className="text-gray-400 text-sm mt-1">Add funds to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                               {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                               <p className="font-semibold text-gray-900">{tx.description}</p>
                               <p className="text-xs text-gray-500">
                                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                 {tx.timestamp ? format((tx.timestamp as any)?.toDate?.() || new Date(), 'MMM d, yyyy h:mm a') : 'Just now'}
                               </p>
                            </div>
                         </div>
                         <div className={`font-bold ${
                           tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'
                         }`}>
                            {tx.type === 'credit' ? '+' : '-'}${ (tx.amount/100).toFixed(2)}
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           </div>
        </div>
        <RechargeModal 
          isOpen={isRechargeOpen} 
          onClose={() => setIsRechargeOpen(false)} 
        />
      </div>
    </ProtectedRoute>
  );
}
