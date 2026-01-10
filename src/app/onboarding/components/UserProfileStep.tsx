import React from 'react';
import NextImage from 'next/image';
import { User, Upload, Check } from 'lucide-react';
import { Role } from '../onboarding.types';

interface UserProfileStepProps {
  role: Role;
  step: number;
  formData: {
    displayName: string;
    bio: string;
  };
  setFormData: (data: { displayName: string; bio: string }) => void;
  selectedImage: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => void;
  loading: boolean;
}

export default function UserProfileStep({
  step,
  formData,
  setFormData,
  selectedImage,
  handleImageUpload,
}: UserProfileStepProps) {

  // Step 4: Profile Form
  if (step === 4) {
    return (
      <div className="w-full max-w-xl text-center">
        <div className="mb-12">
          <h1 className="text-[40px] font-bold text-[#101828] mb-3 font-inter">Create Your Profile</h1>
          <p className="text-lg text-[#475467] font-inter">Tell us a bit about yourself</p>
        </div>

        {/* Profile Picture Circle */}
        <div className="mb-10 flex flex-col items-center">
          <span className="text-sm font-semibold text-[#344054] mb-6 font-inter uppercase tracking-wide">Profile Picture</span>
          <div className="relative group">
            <div className="w-40 h-40 rounded-full border-[6px] border-[#e0cef7] p-1 flex items-center justify-center mb-4">
              <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden relative">
                {selectedImage ? (
                  <NextImage 
                    src={selectedImage} 
                    alt="Profile" 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors font-medium text-[#344054] text-sm font-inter">
              <Upload className="w-4 h-4" />
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'profile')} />
            </label>
            <p className="text-xs text-[#98a2b3] mt-3 font-inter">JPG, PNG or GIF. Max size 5MB</p>
          </div>
        </div>

        <div className="space-y-6 text-left max-w-lg mx-auto w-full">
          <div>
            <label className="text-sm font-medium text-[#344054] mb-2 block font-inter">Display Name *</label>
            <input
              type="text"
              placeholder="Enter your display name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#344054] mb-2 block font-inter">Bio / About You *</label>
            <textarea
              placeholder="Share a bit about yourself and your interests..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter resize-none"
            />
            <div className="flex justify-between mt-2 text-xs text-[#98a2b3] font-inter">
              <span>Minimum 10 characters</span>
              <span>0/500 characters</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Success
  if (step === 5) {
    return (
      <div className="w-full max-w-xl text-center">
        <div className="mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-[#9810fa] to-[#e60076] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/30 animate-in zoom-in duration-500">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-[48px] font-bold text-[#101828] mb-4 font-inter tracking-tight">You&apos;re All Set!</h1>
          <p className="text-xl text-[#475467] font-inter max-w-md mx-auto leading-relaxed">
            Welcome to NuttyFans! You&apos;re ready to discover amazing creators and exclusive content.
          </p>
        </div>

        {/* Profile Card Preview */}
        <div className="bg-gray-50 rounded-3xl p-6 flex items-center gap-5 max-w-sm mx-auto mb-12 border border-white shadow-sm">
          <div className="w-16 h-16 rounded-full bg-white p-1 shadow-sm">
            <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden relative">
              {selectedImage ? (
                <NextImage 
                  src={selectedImage} 
                  alt="User" 
                  fill 
                  className="object-cover" 
                />
              ) : (
                <User className="w-full h-full p-3 text-gray-400" />
              )}
            </div>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg text-[#101828] font-inter">{formData.displayName}</h3>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
              Fan
            </span>
            <p className="text-sm text-[#667085] mt-1 line-clamp-1">{formData.bio || 'New member'}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-[#667085] bg-yellow-50 py-3 px-4 rounded-xl max-w-sm mx-auto">
          <span className="text-yellow-600">💡</span>
          You can always update your profile later in Settings
        </div>
      </div>
    );
  }

  return null;
}
