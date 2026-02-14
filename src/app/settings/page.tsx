'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Bell, 
  Lock, 
  DollarSign, 
  Package,
  Upload,
  Save,
  Globe,
  Download,
  Trash2,
  Eye,
  Instagram,
  Twitter,
  LogOut,

  Loader2,
  Phone,
  Video
} from 'lucide-react';
import { useEffect } from 'react';
import { getCreatorProfile, updateUserProfile, createCreatorProfile } from '@/lib/db';
import { updateProfile } from 'firebase/auth';
import { useStorage } from '@/hooks/useStorage';
import { useRef } from 'react';

const Toggle = ({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) => (
  <div 
    onClick={() => onChange(!checked)}
    className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors focus:outline-none"
    style={{
      backgroundColor: checked ? '#9810FA' : '#E5E7EB',
      boxShadow: '0 0 0 2px rgba(152, 16, 250, 0.2)',
    }}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </div>
);

import SubscriptionPlansEditor from '@/components/SubscriptionPlansEditor';

export default function SettingsPage() {
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    website: '',
    location: '',
    bio: '',
  });

  const [callSettings, setCallSettings] = useState({
    audioPerMinute: 1,
    videoPerMinute: 1,
    isCallsEnabled: true,
  });

  const [accountSettings, setAccountSettings] = useState({
    twoFactor: false,
    loginAlerts: true,
  });

  const { uploadFile, isUploading: uploadingImage } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    newSubscribers: true,
    newMessages: true,
    newComments: true,
    tips: true,
    monthlyReport: true,
    promotions: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showSubscriberCount: true,
    allowDMs: true,
    allowComments: true,
    showOnlineStatus: true,
    allowDownloads: false,
  });



  useEffect(() => {
    async function fetchDetails() {
      if (!user) return;
      
      try {
        setLoading(true);
        // User profile data
        const initialData = {
          username: userProfile?.username || '',
          displayName: userProfile?.displayName || user?.displayName || '',
          email: userProfile?.email || user?.email || '',
          location: userProfile?.location || '',
          bio: userProfile?.bio || '',
          website: '',
        };

        // Creator profile data if applicable
        if (userProfile?.role === 'creator') {
          const creator = await getCreatorProfile(user.uid);
          if (creator) {
            setCreatorProfile(creator); // Store full profile for plans editor
            initialData.bio = creator.bio || '';
            initialData.website = creator.website || '';
            if (creator.callPrices) {
              setCallSettings({
                audioPerMinute: creator.callPrices.audioPerMinute || 1,
                videoPerMinute: creator.callPrices.videoPerMinute || 1,
                isCallsEnabled: creator.isCallsEnabled !== false,
              });
            } else {
              setCallSettings({
                audioPerMinute: 1,
                videoPerMinute: 1,
                isCallsEnabled: creator.isCallsEnabled !== false,
              });
            }
          }
        }

        setFormData(initialData);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [user, userProfile]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'plans', label: 'Plans', icon: Package },
    ...(userProfile?.role === 'creator' ? [{ id: 'calls', label: 'Call Settings', icon: Phone }] : []),
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    try {
      const path = `users/${user.uid}/profile_${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      
      // Update Firebase Auth Profile
      await updateProfile(user, { photoURL: url });

      // Update Firestore User Profile
      await updateUserProfile(user.uid, { photoURL: url });

      await refreshProfile();
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      // Create a fresh input to allow re-uploading same file if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // 1. Update Firebase Auth Profile (DisplayName)
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: formData.displayName });
      }

      // 2. Update Firestore UserProfile
      await updateUserProfile(user.uid, {
        displayName: formData.displayName,
        username: formData.username,
        location: formData.location,
        bio: formData.bio,
      });

      // 3. Update Firestore CreatorProfile (if creator)
      if (userProfile?.role === 'creator') {
        // Validation
        const audio = Number(callSettings.audioPerMinute);
        const video = Number(callSettings.videoPerMinute);

        if (audio < 1 || audio > 10) {
          throw new Error("Audio call price must be between $1 and $10 per minute.");
        }
        if (video < 1 || video > 20) {
          throw new Error("Video call price must be between $1 and $20 per minute.");
        }

        await createCreatorProfile(user.uid, {
          bio: formData.bio,
          website: formData.website,
          callPrices: {
            audioPerMinute: audio,
            videoPerMinute: video,
          },
          isCallsEnabled: callSettings.isCallsEnabled,
        });
      }

      await refreshProfile();
      alert("Settings saved successfully!");
    } catch (error: unknown) {
      console.error('Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings. Please try again.";
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-65px)] bg-gradient-to-br from-[#faf5ff] via-[#fdf2f8] to-[#eff6ff]">
        <Sidebar />
        <div className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'}`}>
          <div className="px-[200.5px] py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-[36px] leading-[40px] font-normal text-[#101828] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Settings
              </h1>
              <p className="text-[16px] leading-[24px] font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Manage your account settings and preferences
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-2xl p-1 mb-6 shadow-lg">
              <div className="flex gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-[14px] transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#ad46ff] to-[#f6339a] text-white'
                          : 'text-[#0a0a0a] hover:bg-white/50'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-semibold">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-lg min-h-[400px] flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[#475467]">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#9810fa]" />
                  <p className="text-lg font-medium animate-pulse">Loading settings...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'profile' && (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-2xl font-normal text-[#101828] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Profile Information
                  </h2>

                  {/* Profile Picture */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg ring-4 ring-[#9810fa]/50 relative overflow-hidden">
                        {user?.photoURL ? (
                          <Image 
                            src={user.photoURL} 
                            alt={user.displayName || 'User'} 
                            fill
                            className="object-cover" 
                          />
                        ) : (
                          <span className="text-white text-2xl font-bold">
                            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-normal text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          JPG, PNG or GIF. Max size 5MB. Recommended 1080x1080.
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/png, image/jpeg, image/gif"
                          onChange={handleImageUpload}
                        />
                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-[rgba(0,0,0,0.1)] rounded-full text-sm font-semibold text-[#0a0a0a] hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {uploadingImage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploadingImage ? 'Uploading...' : 'Change Photo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-[rgba(0,0,0,0.1)] my-6"></div>

                  {/* Username and Display Name */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-[14px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-[14px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* Email and Website */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-[14px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-[14px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-[14px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={500}
                      className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-[14px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa] resize-none"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <p className="text-sm font-normal text-[#6a7282] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-white border border-[rgba(0,0,0,0.1)] rounded-full text-sm font-semibold text-[#0a0a0a] hover:bg-gray-50 transition-colors cursor-pointer"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ad46ff] to-[#f6339a] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8">
                  {/* Change Password */}
                  <div>
                     <h2 className="text-2xl font-normal text-[#101828] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Change Password
                    </h2>
                    <div className="space-y-4 max-w-2xl">
                       <div>
                        <label className="block text-sm font-semibold text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-[14px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa]"
                            placeholder="••••••••"
                             style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                          <Eye className="w-4 h-4 text-[#98a2b3] absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          New Password
                        </label>
                         <div className="relative">
                          <input
                            type="password"
                            className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-[14px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa]"
                            placeholder="••••••••"
                             style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                           <Eye className="w-4 h-4 text-[#98a2b3] absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#364153] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-[14px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa]"
                          placeholder="••••••••"
                           style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                      </div>
                      <button className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#ad46ff] to-[#f6339a] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"  style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Lock className="w-4 h-4" />
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* 2FA */}
                  <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
                    <h3 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Two-Factor Authentication
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Enable 2FA</p>
                          <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Add an extra layer of security to your account</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                           <Toggle 
                            checked={accountSettings.twoFactor}
                            onChange={(checked) => setAccountSettings(prev => ({ ...prev, twoFactor: checked }))} 
                          />
                        </div>
                      </div>
                      <div className="h-px bg-gray-200"></div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Login Alerts</p>
                          <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Get notified when someone logs into your account</p>
                        </div>
                         <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                           <Toggle 
                            checked={accountSettings.loginAlerts}
                            onChange={(checked) => setAccountSettings(prev => ({ ...prev, loginAlerts: checked }))} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connected Accounts */}
                  <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
                    <h3 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Connected Accounts
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-[#e5e7eb] rounded-xl">
                        <div className="flex items-center gap-3">
                           <Globe className="w-5 h-5 text-[#475467]" />
                          <span className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Google</span>
                        </div>
                        <button className="text-sm font-semibold text-[#475467] hover:text-[#101828] cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>Disconnect</button>
                      </div>
                       <div className="flex items-center justify-between p-4 border border-[#e5e7eb] rounded-xl">
                        <div className="flex items-center gap-3">
                           <Twitter className="w-5 h-5 text-[#475467]" />
                          <span className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Twitter</span>
                        </div>
                        <button className="px-4 py-1.5 bg-[#0a0a0a] text-white text-sm font-semibold rounded-full hover:bg-[#2a2a2a] cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>Connect</button>
                      </div>
                       <div className="flex items-center justify-between p-4 border border-[#e5e7eb] rounded-xl">
                        <div className="flex items-center gap-3">
                           <Instagram className="w-5 h-5 text-[#475467]" />
                          <span className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Instagram</span>
                        </div>
                         <button className="text-sm font-semibold text-[#475467] hover:text-[#101828] cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>Disconnect</button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6">
                    <h3 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Session
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Log Out</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Sign out of your account on this device</p>
                      </div>
                      <button 
                        onClick={() => signOut()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-[#344054] hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-8">
                     <h2 className="text-2xl font-normal text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Notification Preferences
                    </h2>
                  </div>

                  {/* General */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium text-[#475467] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>General</h3>
                    <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Email Notifications</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Receive notifications via email</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={notificationSettings.email}
                            onChange={(checked) => setNotificationSettings(prev => ({ ...prev, email: checked }))} 
                          />
                      </div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                     <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Push Notifications</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Receive push notifications on your device</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={notificationSettings.push}
                            onChange={(checked) => setNotificationSettings(prev => ({ ...prev, push: checked }))} 
                          />
                      </div>
                    </div>
                  </div>

                  {/* Activity */}
                   <div className="space-y-6">
                    <h3 className="text-sm font-medium text-[#475467] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Activity</h3>
                    <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>New Subscribers</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>When someone subscribes to your profile</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={notificationSettings.newSubscribers}
                            onChange={(checked) => setNotificationSettings(prev => ({ ...prev, newSubscribers: checked }))} 
                          />
                      </div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                     <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>New Messages</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>When you receive a new direct message</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={notificationSettings.newMessages}
                            onChange={(checked) => setNotificationSettings(prev => ({ ...prev, newMessages: checked }))} 
                          />
                      </div>
                    </div>
                     <div className="h-px bg-gray-200"></div>
                     <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>New Comments</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>When someone comments on your content</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={notificationSettings.newComments}
                            onChange={(checked) => setNotificationSettings(prev => ({ ...prev, newComments: checked }))} 
                          />
                      </div>
                    </div>
                     <div className="h-px bg-gray-200"></div>
                     <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Tips & Donations</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>When you receive tips from fans</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={notificationSettings.tips}
                            onChange={(checked) => setNotificationSettings(prev => ({ ...prev, tips: checked }))} 
                          />
                      </div>
                    </div>
                  </div>

                  {/* Reports & Updates */}
                   <div className="space-y-6">
                    <h3 className="text-sm font-medium text-[#475467] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Reports & Updates</h3>
                    <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Monthly Report</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Receive monthly performance reports</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={notificationSettings.monthlyReport}
                            onChange={(checked) => setNotificationSettings(prev => ({ ...prev, monthlyReport: checked }))} 
                          />
                      </div>
                    </div>
                  </div>

                   <div className="h-px bg-gray-200"></div>

                    {/* Promotions */}
                    <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Promotions</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Special offers and promotional content</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={notificationSettings.promotions}
                            onChange={(checked) => setNotificationSettings(prev => ({ ...prev, promotions: checked }))} 
                          />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-6">
                      <button className="px-4 py-2 bg-white border border-[#d0d5dd] rounded-full text-sm font-semibold text-[#344054] hover:bg-gray-50 transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Reset to Default
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ad46ff] to-[#f6339a] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Save className="w-4 h-4" />
                        Save Preferences
                      </button>
                    </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-normal text-[#101828] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Privacy Settings
                  </h2>

                  <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6 space-y-6">
                     <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Public Profile</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Make your profile visible to everyone</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={privacySettings.publicProfile}
                            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, publicProfile: checked }))} 
                          />
                      </div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                     <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Show Subscriber Count</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Display the number of subscribers on your profile</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={privacySettings.showSubscriberCount}
                            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, showSubscriberCount: checked }))} 
                          />
                      </div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                     <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Allow Direct Messages</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Let subscribers send you messages</p>
                      </div>
                       <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={privacySettings.allowDMs}
                            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowDMs: checked }))} 
                          />
                      </div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                     <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Allow Comments</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Enable comments on your posts</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={privacySettings.allowComments}
                            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowComments: checked }))} 
                          />
                      </div>
                    </div>
                     <div className="h-px bg-gray-200"></div>
                     <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Show Online Status</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Let others see when you&apos;re online</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={privacySettings.showOnlineStatus}
                            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, showOnlineStatus: checked }))} 
                          />
                      </div>
                    </div>
                     <div className="h-px bg-gray-200"></div>
                     <div className="flex items-center justify-between">
                       <div>
                        <p className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Allow Content Download</p>
                        <p className="text-sm text-[#475467]" style={{ fontFamily: 'Inter, sans-serif' }}>Let subscribers download your content</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                         <Toggle 
                            checked={privacySettings.allowDownloads}
                            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowDownloads: checked }))} 
                          />
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-4">
                       <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ad46ff] to-[#f6339a] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Save className="w-4 h-4" />
                        Save Settings
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xl font-normal text-[#101828] mt-8 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Data & Privacy
                  </h2>
                   <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6 space-y-4">
                     <div className="flex items-center justify-between p-4 border border-[#e5e7eb] rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                           <Download className="w-5 h-5 text-[#475467]" />
                          <span className="text-sm font-medium text-[#344054]" style={{ fontFamily: 'Inter, sans-serif' }}>Download Your Data</span>
                        </div>
                      </div>
                       <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors">
                        <div className="flex items-center gap-3">
                           <Trash2 className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>Delete Account</span>
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-2xl font-normal text-[#101828] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Billing Settings
                  </h2>
                  <p className="text-sm font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Billing settings content will be here
                  </p>
                </div>
              )}

              {activeTab === 'plans' && (
                <div>
                  <h2 className="text-2xl font-normal text-[#101828] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Subscription Plans
                  </h2>
                  <p className="text-sm font-normal text-[#4a5565] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Create and manage your subscription tiers. These will be visible on your profile and Discover page.
                  </p>
                  
                  <SubscriptionPlansEditor 
                    initialTiers={creatorProfile?.subscriptionTiers || []}
                    onSave={async (tiers) => {
                      if (!user) return;
                      setSaving(true);
                      try {
                         // Call API to sync with Square immediately
                         const res = await fetch('/api/creators/plans', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: user.uid, tiers })
                         });

                         if (!res.ok) throw new Error('Failed to sync plans with Square');
                         
                         const data = await res.json();
                         const updatedTiers = data.tiers;

                         // Update local state
                         const updatedProfile = { ...creatorProfile, subscriptionTiers: updatedTiers };
                         setCreatorProfile(current => ({ ...current, ...updatedProfile } as any));
                         await refreshProfile();
                         alert("Subscription plans saved and synced with Square!");
                      } catch (err) {
                        console.error("Error saving plans:", err);
                        alert("Failed to save plans.");
                      } finally {
                        setSaving(false);
                      }
                    }}
                    saving={saving}
                  />
                </div>
              )}

              {activeTab === 'calls' && (
                <div>
                  <h2 className="text-2xl font-normal text-[#101828] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Call Settings
                  </h2>
                  <p className="text-sm font-normal text-[#4a5565] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Set your rates for 1-on-1 calls. You will be paid per minute of the call duration.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                    
                    {/* Enable/Disable Calls Toggle */}
                    <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>Enable Calls</p>
                        <p className="text-xs text-[#667085]">Allow fans to start audio and video calls with you</p>
                      </div>
                      <Toggle 
                        checked={callSettings.isCallsEnabled}
                        onChange={(checked) => setCallSettings(prev => ({ ...prev, isCallsEnabled: checked }))} 
                      />
                    </div>

                    <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-6 space-y-6">
                      
                      {/* Audio Call Price */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div 
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: '#F3E8FF',
                              color: '#9810FA',
                            }}
                          >
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-[#364153]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Audio Call Price (per minute)
                            </label>
                            <p className="text-xs text-[#667085]">Min $1.00 — Max $10.00 per minute</p>
                          </div>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            step="0.01"
                            value={callSettings.audioPerMinute}
                            onChange={(e) => setCallSettings(prev => ({ ...prev, audioPerMinute: parseFloat(e.target.value) || 0 }))}
                            className="w-full pl-8 pr-3 py-2 bg-white border border-[#e5e7eb] rounded-[10px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa]"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                        </div>
                      </div>

                      <div className="h-px bg-gray-100"></div>

                      {/* Video Call Price */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                             <Video className="w-5 h-5" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-[#364153]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Video Call Price (per minute)
                            </label>
                            <p className="text-xs text-[#667085]">Min $1.00 — Max $20.00 per minute</p>
                          </div>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            step="0.01"
                            value={callSettings.videoPerMinute}
                            onChange={(e) => setCallSettings(prev => ({ ...prev, videoPerMinute: parseFloat(e.target.value) || 0 }))}
                            className="w-full pl-8 pr-3 py-2 bg-white border border-[#e5e7eb] rounded-[10px] text-sm font-normal text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#9810fa]"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#ad46ff] to-[#f6339a] text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Call Rates'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

