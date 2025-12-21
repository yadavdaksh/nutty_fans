'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile, createCreatorProfile } from '@/lib/db';
import { updateProfile } from 'firebase/auth';
import NextImage from 'next/image';
import { 
  Heart, 
  Crown, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  User, 
  Check, 
  Camera,
  Music,
  Video,
  Gamepad,
  Dumbbell,
  Book,
  Code,
  Mic,
  Plus,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5;
type Role = 'user' | 'creator';

const CATEGORIES = [
  { id: 'art', label: 'Art & Design', icon: <Heart className="w-6 h-6" /> },
  { id: 'music', label: 'Music', icon: <Music className="w-6 h-6" /> },
  { id: 'photography', label: 'Photography', icon: <Camera className="w-6 h-6" /> },
  { id: 'video', label: 'Video Content', icon: <Video className="w-6 h-6" /> },
  { id: 'gaming', label: 'Gaming', icon: <Gamepad className="w-6 h-6" /> },
  { id: 'fitness', label: 'Fitness', icon: <Dumbbell className="w-6 h-6" /> },
  { id: 'lifestyle', label: 'Lifestyle', icon: <Heart className="w-6 h-6" /> },
  { id: 'education', label: 'Education', icon: <Book className="w-6 h-6" /> },
  { id: 'technology', label: 'Technology', icon: <Code className="w-6 h-6" /> },
  { id: 'podcast', label: 'Podcast', icon: <Mic className="w-6 h-6" /> },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<string | null>(null);
  
  // Form States
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: '',
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [tiers, setTiers] = useState([
    { name: 'Basic', price: '', description: '', benefits: [''] },
    { name: 'Premium', price: '', description: '', benefits: [''] },
    { name: 'VIP', price: '', description: '', benefits: [''] },
  ]);

  const [socials, setSocials] = useState({
    instagram: '',
    twitter: '',
    youtube: '',
    website: '',
  });

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
  };

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter(c => c !== id));
    } else {
      if (selectedCategories.length < 5) {
        setSelectedCategories([...selectedCategories, id]);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (type === 'profile') setSelectedImage(imageUrl);
      else setSelectedCoverImage(imageUrl);
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!role) return;
      if (role === 'user') {
        setStep(2);
      } else {
        setStep(2);
      }
    }
    
    // User Flow Steps
    else if (role === 'user') {
      if (step === 2) {
        setLoading(true);
        try {
          if (user) {
            await updateProfile(user, {
              displayName: formData.displayName,
              photoURL: selectedImage || user.photoURL,
            });
            await updateUserProfile(user.uid, {
              displayName: formData.displayName,
              bio: formData.bio,
            });
            await refreshProfile();
          }
          setStep(3);
        } catch (error) {
          console.error('Error updating profile:', error);
        } finally {
          setLoading(false);
        }
      } else if (step === 3) {
        router.push('/');
      }
    } 
    
    // Creator Flow Steps (Simulated transitions mostly)
    else if (role === 'creator') {
      if (step === 2) setStep(3);
      else if (step === 3) setStep(4);
      else if (step === 4) setStep(5);
      else if (step === 5) {
        setLoading(true);
        try {
           if (user) {
            await updateUserProfile(user.uid, {
              bio: formData.bio || `Welcome to my page!`,
              role: 'creator'
            });
            await createCreatorProfile(user.uid, {
              categories: selectedCategories,
              socialLinks: socials,
              subscriptionTiers: tiers,
              bio: formData.bio || `Welcome to my page!`,
            });
            await refreshProfile();
           }
           router.push('/dashboard');
        } catch (error) {
           console.error('Error:', error);
        } finally {
           setLoading(false);
        }
      }
    }
  };

  const handleBack = () => {
    if (step === 1) return;
    setStep((prev) => (prev - 1) as Step);
  };

  const getProgress = () => {
    const totalSteps = role === 'creator' ? 5 : 3;
    const progress = (step / totalSteps) * 100;
    return `${Math.round(progress)}%`;
  };

  const checkStepValidity = () => {
    if (step === 1) return !!role;
    
    if (role === 'user') {
      if (step === 2) {
        return formData.displayName.trim() !== '' && formData.bio.trim().length >= 10;
      }
      return true; // Step 3 is success/view only
    }
    
    if (role === 'creator') {
      if (step === 2) return selectedCategories.length > 0;
      if (step === 3) return tiers[0].price !== ''; // At least Basic tier needs a price
      if (step === 4) return !!selectedCoverImage; // Cover image is important
      if (step === 5) return true; // Socials are optional
    }
    
    return false;
  };

  const isStepValid = checkStepValidity();

  return (
    <div className="min-h-screen bg-[#fdfbfd] flex items-center justify-center p-4">
      <div className="w-full max-w-[1440px] h-[900px] bg-white rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Step Indicator - Cleaner */}
        <div className="w-full max-w-xl mx-auto pt-16 px-6">
          <div className="flex justify-between text-sm font-medium text-gray-500 mb-2 font-inter">
            <span>Step {step} of {role === 'creator' ? 5 : 3}</span>
            <span>{getProgress()}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-500 ease-out"
              style={{ width: getProgress() }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-10 overflow-y-auto">
          
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="w-full max-w-5xl text-center">
              <div className="mb-12">
                 <div className="w-16 h-16 bg-gradient-to-br from-[#9810fa] to-[#e60076] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                   {/* Logo Placeholder */}
                  <span className="text-3xl text-white">✨</span>
                </div>
                <h1 className="text-[48px] font-bold text-[#101828] mb-4 font-inter tracking-tight">
                  Welcome to NuttyFans!
                </h1>
                <p className="text-xl text-[#475467] font-inter">
                  Let&apos;s set up your profile. First, tell us how you&apos;ll be using NuttyFans.
                </p>
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
                      ? 'border-blue-500 bg-white shadow-2xl shadow-blue-100 translate-y-[-4px]' // Using blue for contrast based on image suggestion or stick to purple? Image shows blueish border for Creator
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
          )}

          {/* USER FLOW - Step 2: Profile */}
          {role === 'user' && step === 2 && (
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
          )}

           {/* USER FLOW - Step 3: Success */}
           {role === 'user' && step === 3 && (
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
          )}

           {/* CREATOR FLOW - Step 2: Categories */}
          {role === 'creator' && step === 2 && (
             <div className="w-full max-w-4xl text-center animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-10">
                <h1 className="text-[40px] font-bold text-[#101828] mb-3 font-inter">Choose Your Categories</h1>
                <p className="text-lg text-[#475467] font-inter">Select up to 5 categories that best describe your content</p>
                <p className="text-sm text-purple-600 mt-2 font-inter">{selectedCategories.length}/5 selected</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-6 rounded-[20px] border transition-all text-left flex flex-col gap-3 hover:shadow-md ${
                      selectedCategories.includes(cat.id)
                        ? 'border-[#9810fa] bg-purple-50 text-[#9810fa]'
                        : 'border-gray-200 bg-white text-[#475467] hover:border-purple-200'
                    }`}
                  >
                     <div className="flex justify-between items-start">
                        {cat.icon}
                        {selectedCategories.includes(cat.id) && <Check className="w-4 h-4 bg-purple-600 text-white rounded-full p-0.5" />}
                     </div>
                    <span className="font-medium font-inter">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

             {role === 'creator' && step === 3 && (
            <div className="w-full max-w-5xl text-center">
              <div className="mb-10">
                <h1 className="text-[40px] font-bold text-[#101828] mb-3 font-inter">Set Your Subscription Tiers</h1>
                <p className="text-lg text-[#475467] font-inter">Create pricing options for your fans</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {tiers.map((tier, index) => (
                   <div key={index} className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-lg text-left">
                      <div className="mb-4">
                        <label className="text-sm font-medium text-[#344054] mb-1 block">Tier Name</label>
                        <input 
                          value={tier.name}
                          onChange={(e) => {
                            const newTiers = [...tiers];
                            newTiers[index].name = e.target.value;
                            setTiers(newTiers);
                          }}
                          placeholder={index === 0 ? 'Basic' : index === 1 ? 'Premium' : 'VIP'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9810fa] focus:border-transparent" 
                        />
                      </div>
                      <div className="mb-4">
                         <label className="text-sm font-medium text-[#344054] mb-1 block">Price (USD/month)</label>
                         <div className="relative">
                           <span className="absolute left-3 top-2 text-gray-500">$</span>
                           <input 
                             type="text" 
                             value={tier.price}
                             onChange={(e) => {
                               const newTiers = [...tiers];
                               newTiers[index].price = e.target.value;
                               setTiers(newTiers);
                             }}
                             placeholder="4.99" 
                             className="w-full pl-6 px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9810fa] focus:border-transparent" 
                           />
                         </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#344054] mb-1 block">Benefits</label>
                        <div className="space-y-3">
                           {tier.benefits.map((benefit, bIndex) => (
                             <div key={bIndex} className="flex gap-2 items-center">
                               <input 
                                 value={benefit}
                                 onChange={(e) => {
                                    const newTiers = [...tiers];
                                    newTiers[index].benefits[bIndex] = e.target.value;
                                    setTiers(newTiers);
                                 }}
                                 placeholder={bIndex === 0 ? "Exclusive posts" : "Additional benefit"}
                                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9810fa] focus:border-transparent" 
                               />
                               {tier.benefits.length > 1 && (
                                 <button 
                                   onClick={() => {
                                     const newTiers = [...tiers];
                                     newTiers[index].benefits = newTiers[index].benefits.filter((_, i) => i !== bIndex);
                                     setTiers(newTiers);
                                   }}
                                   className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                               )}
                             </div>
                           ))}
                           <button 
                             onClick={() => {
                               const newTiers = [...tiers];
                               newTiers[index].benefits.push('');
                               setTiers(newTiers);
                             }}
                             className="text-sm text-purple-600 flex items-center gap-1 font-medium hover:text-purple-700 transition-colors"
                           >
                             <Plus className="w-3 h-3" /> Add Benefit
                           </button>
                        </div>
                      </div>
                   </div>
                ))}
              </div>
            </div>
            )}

            {role === 'creator' && step === 4 && (
             <div className="w-full max-w-3xl text-center">
              <div className="mb-10">
                <h1 className="text-[40px] font-bold text-[#101828] mb-3 font-inter">Upload Cover Image</h1>
                <p className="text-lg text-[#475467] font-inter">Make a striking first impression.</p>
              </div>
              <div className="bg-white rounded-[24px] p-8 border border-gray-200 shadow-xl">
                  <div className="border-2 border-dashed border-gray-300 rounded-[24px] aspect-[21/9] flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden">
                     {selectedCoverImage ? (
                       <NextImage 
                        src={selectedCoverImage} 
                        alt="Cover" 
                        fill 
                        className="object-cover" 
                       />
                     ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                           <ImageIcon className="w-8 h-8" />
                        </div>
                        <p className="text-[#344054] font-medium font-inter">Click to upload cover image</p>
                      </>
                    )}
                     <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'cover')} />
                 </div>
              </div>
             </div>
            )}

            {role === 'creator' && step === 5 && (
             <div className="w-full max-w-2xl text-center">
              <div className="mb-10">
                <h1 className="text-[40px] font-bold text-[#101828] mb-3 font-inter">Connect Your Social Media</h1>
                <p className="text-lg text-[#475467] font-inter">Let fans find you elsewhere.</p>
              </div>
               <div className="bg-white rounded-[24px] p-8 border border-gray-200 shadow-xl text-left space-y-6">
                  {['Instagram', 'Twitter / X', 'YouTube', 'Website'].map((platform) => (
                     <div key={platform}>
                        <label className="text-sm font-medium text-[#344054] mb-1.5 flex items-center gap-2">
                           {platform}
                        </label>
                        <input 
                           type="text" 
                           placeholder={`Link to ${platform}`}
                           className="w-full px-4 py-3 rounded-xl border border-gray-300 font-inter text-[#101828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9810fa] focus:border-transparent transition-all"
                           onChange={(e) => setSocials({...socials, [platform.split(' ')[0].toLowerCase()]: e.target.value})}
                        />
                     </div>
                  ))}
               </div>
             </div>
            )}


          {/* Footer Buttons - Floating Action Bar */}
          <div className="w-full max-w-[1440px] fixed bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none">
             <div className="w-full max-w-[1000px] flex justify-between items-center pointer-events-auto">
               <button 
                  onClick={handleBack}
                  className={`bg-white px-8 py-3.5 text-[#344054] font-bold font-inter hover:bg-gray-50 rounded-full border border-gray-200 shadow-sm transition-all flex items-center gap-2 ${step === 1 ? 'invisible' : ''}`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!isStepValid || loading}
                  className={`px-10 py-3.5 bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white font-bold rounded-full font-inter flex items-center gap-2 transition-all shadow-lg shadow-purple-500/30 ${
                    !isStepValid || loading 
                      ? 'opacity-50 cursor-not-allowed grayscale' 
                      : 'hover:opacity-90 hover:scale-105'
                  }`}
                >
                  {loading ? 'Processing...' : (step === 5 || (role === 'user' && step === 3)) ? 'Get Started' : 'Continue'}
                  <ArrowRight className="w-5 h-5" />
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
