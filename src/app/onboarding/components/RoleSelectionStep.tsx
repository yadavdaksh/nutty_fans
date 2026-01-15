import React, { useState } from 'react';
import { User, Crown, Check, Heart, ShieldCheck } from 'lucide-react';
import { Role } from '../onboarding.types';
import TermsModal from '@/components/modals/TermsModal';

interface RoleSelectionStepProps {
  role: Role | null;
  handleRoleSelect: (role: Role) => void;
}

export default function RoleSelectionStep({
  role,
  handleRoleSelect,
}: RoleSelectionStepProps) {

  return (
    <div className="w-full max-w-5xl text-center">
      <div className="mb-12">
         <div className="w-16 h-16 bg-gradient-to-br from-[#9810fa] to-[#e60076] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
           <User className="w-8 h-8 text-white" />
         </div>
         <h1 className="text-[48px] font-bold text-[#101828] mb-4 font-inter tracking-tight">How do you want to use the platform?</h1>
         <p className="text-xl text-[#475467] font-inter max-w-2xl mx-auto leading-relaxed">Choose your journey. You can always change this later.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
        <button
          onClick={() => handleRoleSelect('user')}
          className={`relative p-10 rounded-[32px] border-[3px] text-left transition-all duration-300 ${
            role === 'user'
              ? 'border-[#9810fa] bg-white shadow-2xl shadow-purple-100 translate-y-[-4px]'
              : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-lg'
          }`}
        >
          {role === 'user' && (
            <div className="absolute top-6 right-6 w-8 h-8 bg-[#9810fa] rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
            role === 'user' ? 'bg-[#9810fa] text-white' : 'bg-pink-50 text-[#e60076]'
          }`}>
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-[#101828] mb-3 font-inter">I&apos;m a Fan</h3>
          <p className="text-[#475467] text-lg leading-relaxed font-inter">
            Discover and support your favorite creators, access exclusive content, and join vibrant communities.
          </p>
        </button>

        <button
          onClick={() => handleRoleSelect('creator')}
          className={`relative p-10 rounded-[32px] border-[3px] text-left transition-all duration-300 ${
            role === 'creator'
              ? 'border-blue-500 bg-white shadow-2xl shadow-blue-100 translate-y-[-4px]'
              : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg'
          }`}
        >
           {role === 'creator' && (
            <div className="absolute top-6 right-6 w-8 h-8 bg-[#9810fa] rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
            role === 'creator' ? 'bg-gray-100 text-[#101828]' : 'bg-gray-50 text-[#475467]'
          }`}>
            <Crown className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-[#101828] mb-3 font-inter">I&apos;m a Creator</h3>
          <p className="text-[#475467] text-lg leading-relaxed font-inter">
            Share your content, build your community, and earn from your passion with powerful creator tools.
          </p>
        </button>
      </div>

    </div>
  );
}
