'use client';

import { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  Calendar,
  Zap
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Coupon } from '@/lib/db';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Coupon Form State
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    expiryDate: '',
    usageLimit: 0,
  });

  useEffect(() => {
    const q = query(collection(db, 'coupons'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
      setCoupons(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'coupons'), {
        ...newCoupon,
        usageCount: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        expiryDate: Timestamp.fromDate(new Date(newCoupon.expiryDate))
      });
      setIsModalOpen(false);
      setNewCoupon({ code: '', discountType: 'percentage', discountValue: 0, expiryDate: '', usageLimit: 0 });
    } catch (error) {
      console.error("Error creating coupon:", error);
      alert("Failed to create coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      await deleteDoc(doc(db, 'coupons', id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon System</h1>
          <p className="text-gray-500">Create and manage sitewide discount codes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Coupon
        </button>
      </div>

      {/* Coupon List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by code..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
             <span>Active: {coupons.filter(c => c.status === 'active').length}</span>
             <span className="w-px h-4 bg-gray-200"></span>
             <span>Total: {coupons.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 text-left">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Coupon Code</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Ticket className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-bold text-gray-900">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`} OFF
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700">{coupon.usageCount} / {coupon.usageLimit}</span>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {new Date(coupon.expiryDate.toDate()).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {coupon.status === 'active' ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        INACTIVE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => coupon.id && handleDelete(coupon.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    No coupons created yet. Click above to create your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 fill-white" />
                New Coupon Details
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Coupon Code</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. SUMMER50"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900"
                    value={newCoupon.discountType}
                    onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value as any})}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Value</label>
                  <input 
                    required
                    type="number" 
                    value={newCoupon.discountValue}
                    placeholder="0"
                    onChange={e => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required
                    type="date" 
                    value={newCoupon.expiryDate}
                    onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Total Usage Limit</label>
                <input 
                  required
                  type="number" 
                  value={newCoupon.usageLimit}
                  placeholder="0"
                  onChange={e => setNewCoupon({...newCoupon, usageLimit: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all mt-4"
              >
                Launch Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
