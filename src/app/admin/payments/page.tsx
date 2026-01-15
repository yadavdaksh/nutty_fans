'use client';

import { useState, useEffect } from 'react';
import { getPayoutRequests, updatePayoutRequestStatus, PayoutRequest } from '@/lib/db';
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Banknote
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function PendingPaymentsPage() {
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getPayoutRequests('pending');
      setRequests(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load payout requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: PayoutRequest['status']) => {
    setProcessingId(id);
    try {
      await updatePayoutRequestStatus(id, status);
      toast.success(`Request ${status} successfully`);
      setRequests(requests.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Operation failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="font-medium animate-pulse">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Banknote className="w-8 h-8 text-green-600" />
            Pending Payments
          </h1>
          <p className="text-gray-500 mt-2">Manage creator payout requests and pending distribution clearing.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-gray-100 rounded-2xl px-6 py-3 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Volume</p>
              <p className="text-xl font-black text-gray-900 mt-1">
                ${(requests.reduce((acc, r) => acc + (r.amount || 0), 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
           </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[32px] p-20 text-center shadow-xl">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-gray-300" />
           </div>
           <h2 className="text-xl font-bold text-gray-900">All Clear!</h2>
           <p className="text-gray-500 mt-2">There are no pending payout requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
               <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  {/* Left: Info */}
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                      <CreditCard className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-black text-gray-900">${(request.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest rounded-full">Pending</span>
                       </div>
                       <p className="text-sm font-bold text-gray-500 mb-1">Creator ID: <span className="text-gray-900 font-black">{request.userId}</span></p>
                       <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Submitted on {format(request.createdAt instanceof Date ? request.createdAt : (request.createdAt as { toDate: () => Date }).toDate(), 'MMM dd, yyyy HH:mm')}</span>
                       </div>
                    </div>
                  </div>

                  {/* Middle: Bank Details */}
                  <div className="bg-gray-50 rounded-2xl p-4 flex-1 lg:max-w-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                       <AlertCircle className="w-4 h-4 text-gray-400" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Details</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{request.bankDetails.accountHolderName}</p>
                    <p className="text-xs text-gray-600 font-medium">
                      {request.bankDetails.bankName} ({request.bankDetails.country})<br/>
                      AC: <span className="font-mono text-purple-600">{request.bankDetails.accountNumber}</span><br/>
                      {request.bankDetails.routingNumber && `Routing: ${request.bankDetails.routingNumber}`}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex gap-3">
                     <button 
                       onClick={() => handleUpdateStatus(request.id, 'approved')}
                       disabled={!!processingId}
                       className="flex-1 lg:flex-none px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                       {processingId === request.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                       Approve & Pay
                     </button>
                     <button 
                       onClick={() => handleUpdateStatus(request.id, 'rejected')}
                       disabled={!!processingId}
                       className="flex-1 lg:flex-none px-6 py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                       {processingId === request.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                       Reject
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-3xl p-8 text-gray-400">
         <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-800 rounded-2xl">
               <ExternalLink className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
               <h4 className="text-white font-bold mb-1">Manual Action Required</h4>
               <p className="text-sm leading-relaxed max-w-2xl opacity-80">
                 Approving a payout request here only marks it as &quot;Approved&quot; and deducts the funds from the system hold. 
                 You must still process the actual bank transfer via your bank or payment processor. Use the details above for the transfer.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
