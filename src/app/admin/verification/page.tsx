'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  User as UserIcon,
  Mail,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import AlertModal from '@/components/modals/AlertModal';

import { CreatorProfile } from '@/lib/db';

interface PendingCreator {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  verificationStatus: string;
  creatorDetails?: CreatorProfile | null;
}

export default function VerificationQueue() {
  const { user: adminUser } = useAuth();
  const [pendingCreators, setPendingCreators] = useState<PendingCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });


  const fetchPendingCreators = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'creator'),
        where('verificationStatus', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      const creators: PendingCreator[] = [];

      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data();
        
        // Fetch specific creator details from 'creators' collection
        const creatorSnap = await getDoc(doc(db, 'creators', userDoc.id));
        
        creators.push({
          uid: userDoc.id,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          bio: userData.bio,
          verificationStatus: userData.verificationStatus,
          creatorDetails: creatorSnap.exists() ? (creatorSnap.data() as CreatorProfile) : null
        });
      }

      setPendingCreators(creators);
    } catch (error) {
      console.error('Error fetching pending creators:', error);
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCreators();
  }, []);

  const handleAction = async (uid: string, action: 'approve' | 'reject') => {
    if (!adminUser) return;
    
    const confirmMessage = action === 'approve' 
        ? 'Are you sure you want to approve this creator? They will be notified via email.'
        : 'Are you sure you want to reject this creator? This will delete their account and all data.';
    
    setAlertConfig({
      isOpen: true,
      title: action === 'approve' ? 'Approve Creator' : 'Reject Creator',
      message: confirmMessage,
      type: action === 'approve' ? 'success' : 'error',
      onConfirm: async () => {
        setProcessingId(uid);
        try {
          const token = await adminUser.getIdToken();
          const res = await fetch('/api/admin/verify-creator', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              uid,
              action,
              adminUid: adminUser.uid
            }),
          });

          const data = await res.json();

          if (!res.ok) throw new Error(data.error || 'Failed to process request');

          toast.success(data.message);
          // Refresh list
          setPendingCreators(prev => prev.filter(c => c.uid !== uid));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to process request';
          toast.error(message);
        } finally {
          setProcessingId(null);
        }
      }
    });
  };


  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="font-medium animate-pulse">Loading verification queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-gray-500">Review and approve or reject pending creator profiles.</p>
      </div>

      {pendingCreators.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
           <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Queue is Empty!</h2>
           <p className="text-gray-500 max-w-sm mx-auto">No creators are currently waiting for verification. Good job keeping up!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingCreators.map((creator) => (
            <div key={creator.uid} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
              {/* Profile Bar */}
              <div className="p-8 md:w-80 bg-gray-50/50 border-r border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-sm mb-4 relative">
                   <div className="w-full h-full rounded-2xl bg-gray-200 overflow-hidden relative">
                      {creator.photoURL ? (
                        <Image 
                          src={creator.photoURL} 
                          alt={creator.displayName} 
                          fill
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <UserIcon className="w-10 h-10" />
                        </div>
                      )}
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-lg shadow-md">
                      <Clock className="w-4 h-4" />
                   </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{creator.displayName}</h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
                   <Mail className="w-4 h-4" />
                   {creator.email}
                </div>
                
                <div className="w-full h-px bg-gray-200 mb-6" />
                
                <div className="flex gap-3 justify-center">
                   {creator.creatorDetails?.socialLinks?.instagram && (
                      <a href={creator.creatorDetails.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl border border-gray-200 text-pink-500 hover:shadow-md transition-shadow">
                        <Instagram className="w-5 h-5" />
                      </a>
                   )}
                   {creator.creatorDetails?.socialLinks?.twitter && (
                      <a href={creator.creatorDetails.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl border border-gray-200 text-blue-400 hover:shadow-md transition-shadow">
                        <Twitter className="w-5 h-5" />
                      </a>
                   )}
                   {creator.creatorDetails?.socialLinks?.youtube && (
                      <a href={creator.creatorDetails.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl border border-gray-200 text-red-500 hover:shadow-md transition-shadow">
                        <Youtube className="w-5 h-5" />
                      </a>
                   )}
                   {creator.creatorDetails?.socialLinks?.website && (
                      <a href={creator.creatorDetails.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:shadow-md transition-shadow">
                        <Globe className="w-5 h-5" />
                      </a>
                   )}
                </div>
              </div>

              {/* Details Content */}
              <div className="flex-1 p-8 flex flex-col">
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                       <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Creator Bio</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-8 italic">
                      &ldquo;{creator.bio || 'No bio provided'}&rdquo;
                    </p>

                    <div className="grid sm:grid-cols-2 gap-8">
                       <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                             <span className="w-5 h-5 bg-purple-100 rounded-md flex items-center justify-center text-[10px]">C</span>
                             Categories
                          </h4>
                          <div className="flex flex-wrap gap-2">
                             {creator.creatorDetails?.categories?.map((cat: string) => (
                               <span key={cat} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full capitalize">
                                 {cat}
                               </span>
                             )) || <span className="text-gray-400 text-sm">No categories selected</span>}
                          </div>
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                             <span className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center text-[10px]">$</span>
                             Pricing Tiers
                          </h4>
                          <div className="space-y-1.5">
                             {creator.creatorDetails?.subscriptionTiers?.map((tier) => (
                               <div key={tier.name} className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                  <span className="text-sm font-medium text-gray-700">{tier.name}</span>
                                  <span className="text-sm font-bold text-indigo-600">${tier.price}</span>
                               </div>
                             )) || <span className="text-gray-400 text-sm">No tiers configured</span>}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="mt-10 pt-8 border-t border-gray-100 flex gap-4">
                    <button 
                       onClick={() => handleAction(creator.uid, 'approve')}
                       disabled={!!processingId}
                       className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {processingId === creator.uid ? (
                         <Loader2 className="w-5 h-5 animate-spin" />
                       ) : (
                         <CheckCircle className="w-5 h-5" />
                       )}
                       Approve Creator
                    </button>
                    <button 
                       onClick={() => handleAction(creator.uid, 'reject')}
                       disabled={!!processingId}
                       className="py-4 px-8 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       <XCircle className="w-5 h-5" />
                       Reject
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        confirmLabel={alertConfig.title.split(' ')[0]}
        cancelLabel="Cancel"
      />
    </div>
  );
}


function Clock({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
