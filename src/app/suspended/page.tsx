'use client';

import { ShieldAlert, Mail, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SuspendedPage() {
  const { signOut, userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
        {/* Urgent Header */}
        <div className="bg-red-600 p-10 flex flex-col items-center text-center text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <ShieldAlert className="w-32 h-32" />
          </div>
          
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/30">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Account Suspended</h1>
          <p className="mt-2 text-red-100 font-medium opacity-90">Access to your creator profile has been restricted</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
               <p className="text-red-800 text-sm leading-relaxed font-medium">
                Hello <strong>{userProfile?.displayName || 'Creator'}</strong>, your account has been suspended by the administration due to a violation of our platform policies or suspicious activity.
               </p>
            </div>
            
            <p className="text-gray-500 text-sm leading-relaxed">
              While suspended, you cannot access your dashboard, engage with fans, or receive payouts. If you believe this is a mistake, please reach out to our compliance team.
            </p>
          </div>

          <div className="space-y-4">
             <a 
               href="mailto:support@nuttyfans.com?subject=Appeal Suspension: User ID ${userProfile?.uid}"
               className="flex items-center justify-center gap-3 w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
             >
               <Mail className="w-5 h-5" />
               Contact Compliance Team
             </a>

             <button 
               onClick={() => signOut()}
               className="flex items-center justify-center gap-2 w-full py-4 text-gray-400 hover:text-gray-600 font-bold transition-colors"
             >
               <LogOut className="w-5 h-5" />
               Sign Out of Account
             </button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
           <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
             Case ID: {userProfile?.uid?.slice(0, 12).toUpperCase()}
           </p>
        </div>
      </div>
    </div>
  );
}
