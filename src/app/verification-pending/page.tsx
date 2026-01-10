'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Clock, LogOut, Mail, ShieldCheck } from 'lucide-react';

export default function VerificationPendingPage() {
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();

  // If approved, redirect to dashboard or home
  useEffect(() => {
    if (userProfile?.role === 'creator' && userProfile?.verificationStatus === 'approved') {
       router.push('/dashboard');
    }
    // If not a creator or somehow on this page as an approved user/admin
    if (userProfile && (userProfile.role !== 'creator' || userProfile.verificationStatus === 'approved')) {
       router.push('/');
    }
  }, [userProfile, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#fdfbfd] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden p-12 text-center border border-gray-100">
        
        <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-500/10">
          <Clock className="w-12 h-12 text-indigo-600 animate-pulse" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-inter">Account Verification Pending</h1>
        
        <p className="text-lg text-gray-500 mb-10 font-inter leading-relaxed max-w-md mx-auto">
          Thanks for joining NuttyFans! Your creator profile is currently being reviewed by our team to ensure a safe and premium experience for everyone.
        </p>

        <div className="grid gap-6 mb-12">
            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Mail className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 font-inter">Keep an eye on your inbox</h3>
                   <p className="text-sm text-gray-500 font-inter">We will send an email to <span className="font-semibold text-gray-800">{user?.email}</span> once your profile is approved.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 font-inter">Profile Safety Check</h3>
                   <p className="text-sm text-gray-500 font-inter">This usually takes less than 24 hours. Once verified, you can start sharing content and earning.</p>
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
               onClick={() => window.location.reload()}
               className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
                Check Status
            </button>
            <button 
               onClick={handleLogout}
               className="px-8 py-4 bg-white text-gray-600 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <LogOut className="w-5 h-5" />
                Sign Out
            </button>
        </div>

        <p className="mt-12 text-sm text-gray-400 font-inter">
            Need help? Contact us at <span className="text-indigo-500 cursor-pointer">support@nuttyfans.com</span>
        </p>
      </div>
    </div>
  );
}
