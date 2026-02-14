'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, LogOut, Mail, ShieldCheck, ArrowRight, ArrowLeft, PenLine, CheckCircle } from 'lucide-react';
import { updateUserProfile, createCreatorProfile, BankDetails } from '@/lib/db';
import { useStorage } from '@/hooks/useStorage';
import { toast } from 'react-hot-toast';
// Removed unused updateProfile import

// Reuse components from onboarding
import CreatorSteps from '../onboarding/components/CreatorSteps';
import BankDetailsStep from '../onboarding/components/BankDetailsStep';
import { 
  validateIBAN, 
  validateRoutingNumber, 
  validateIFSC, 
  validateSwiftBIC,
  getCountryBankRequirement 
} from '@/lib/bank-utils';

export default function VerificationPendingPage() {
  const { user, userProfile, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { uploadFile } = useStorage();
  
  // State for setup wizard
  const [step, setStep] = useState(4); // Start at step 4 (Creator categories) assuming 1-3 were done in onboarding
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
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
  const [selectedCoverImage, setSelectedCoverImage] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    country: '',
    routingNumber: '',
    swiftCode: '',
  });

  // If approved, redirect to dashboard
  // If approved AND completed, redirect to dashboard. 
  // If approved but NOT completed, allow them to finish setup here.
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (userProfile?.role === 'creator' && 
        userProfile?.verificationStatus === 'approved' && 
        userProfile?.onboardingCompleted) {
       router.push('/dashboard');
    }
  }, [user, userProfile, router, loading]);


  // Sync state with profile on load if needed
  useEffect(() => {
     // Optional: Load existing data if they come back to edit
  }, [userProfile]);


  const handleLogout = async () => {
    await signOut();
    router.push('/login');
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      if (type === 'cover') setSelectedCoverImage(imageUrl);
    }
  };

  const checkStepValidity = () => {
      // Step 4: Categories
      if (step === 4) return selectedCategories.length > 0;
      // Step 5: Tiers
      if (step === 5) return tiers[0].price !== ''; 
      // Step 6: Cover Image
      if (step === 6) return !!selectedCoverImage; 
      // Step 7: Socials
      if (step === 7) return true; 
      // Step 8: Bank Details
      if (step === 8) {
        const { accountHolderName, accountNumber, bankName, country, routingNumber, swiftCode } = bankDetails;
        if (!accountHolderName || !accountNumber || !bankName || !country) return false;
        
        const req = getCountryBankRequirement(country);
        if (req === 'IBAN' && !validateIBAN(accountNumber)) return false;
        if (req === 'ABA' && (!routingNumber || !validateRoutingNumber(routingNumber))) return false;
        if (req === 'IFSC' && (!routingNumber || !validateIFSC(routingNumber))) return false;
        if (swiftCode && !validateSwiftBIC(swiftCode)) return false;
        
        return true;
      }
      return false;
  };

  const handleContinue = async () => {
       // Step 4: Categories
       if (step === 4) {
         if (user) await updateUserProfile(user.uid, { onboardingStep: 5 });
         setStep(5);
       }
       // Step 5: Tiers
       else if (step === 5) {
         if (user) await updateUserProfile(user.uid, { onboardingStep: 6 });
         setStep(6);
       }
       // Step 6: Cover Image
       else if (step === 6) {
         if (user) await updateUserProfile(user.uid, { onboardingStep: 7 });
         setStep(7);
       }
       // Step 7: Socials -> Bank Details
       else if (step === 7) {
          if (user) await updateUserProfile(user.uid, { onboardingStep: 8 });
          setStep(8);
       }
        // Step 8: Bank Details -> Finish
        else if (step === 8) {
        setLoading(true);
        try {
           if (user) {
            // 1. Sync Plans with Square
            let syncedTiers = tiers;
            try {
                const idToken = await user.getIdToken();
                const res = await fetch('/api/creators/plans', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ userId: user.uid, tiers })
                });
                if (res.ok) {
                    const data = await res.json();
                    syncedTiers = data.tiers;
                }
            } catch (err) {
                console.error("Error syncing plans:", err);
            }

            let coverImageURL: string | undefined = undefined;
            if (imageFile) {
                const path = `creators/${user.uid}/cover_${Date.now()}_${imageFile.name}`;
                coverImageURL = await uploadFile(imageFile, path);
            }

            await updateUserProfile(user.uid, {
              bankDetails,
              onboardingCompleted: true, 
              onboardingStep: 8 
            });
            
            await createCreatorProfile(user.uid, {
              categories: selectedCategories,
              socialLinks: socials,
              subscriptionTiers: syncedTiers,
              coverImageURL: coverImageURL || undefined,
            });
            await refreshProfile();
           }
           setIsWizardOpen(false); // Close wizard
        } catch (error) {
           console.error('Error:', error);
        } finally {
           setLoading(false);
        }
      }
  };

  const handleBack = () => {
    if (step === 4) {
        setIsWizardOpen(false); // Close wizard if back on first step
        return;
    }
    setStep((prev) => prev - 1);
  };

  const isStepValid = checkStepValidity();
  const onboardingCompleted = userProfile?.onboardingCompleted;

  if (isWizardOpen) {
      // SETUP WIZARD VIEW
      return (
        <div className="min-h-screen bg-[#fdfbfd] flex items-center justify-center p-4">
        <div className="w-full max-w-[1440px] h-[900px] bg-white rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col">
          
          <div className="w-full max-w-xl mx-auto pt-16 px-6 text-center">
             <h2 className="text-2xl font-bold mb-2 font-inter">Complete Your Profile</h2>
             <p className="text-gray-500 mb-4">Fill in your details while we verify your account.</p>
             <div className="flex justify-between text-sm font-medium text-gray-500 mb-2 font-inter">
                <span>Step {step} of 8</span>
             </div>
             <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-black transition-all duration-500 ease-out"
                  style={{ width: `${(step / 8) * 100}%` }}
                />
             </div>
          </div>

          <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-32 overflow-y-auto">
             
            {(step >= 4 && step <= 7) && (
                <CreatorSteps
                step={step}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                tiers={tiers}
                setTiers={setTiers}
                selectedCoverImage={selectedCoverImage}
                handleImageUpload={handleImageUpload}
                socials={socials}
                setSocials={setSocials}
                />
            )}

            {step === 8 && (
                <BankDetailsStep
                bankDetails={bankDetails}
                setBankDetails={setBankDetails}
                loading={loading}
                />
            )}

            <div className="w-full absolute bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none z-10">
                <div className="w-full max-w-[1000px] flex justify-between items-center pointer-events-auto">
                <button 
                    onClick={handleBack}
                    className={`bg-white px-8 py-3.5 text-[#344054] font-bold font-inter hover:bg-gray-50 rounded-full border border-gray-200 shadow-sm transition-all flex items-center gap-2`}
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
                    {loading ? 'Processing...' : step === 8 ? 'Finish Setup' : 'Continue'}
                    <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

          </div>
        </div>
        </div>
      );
  }

  // DEFAULT VIEW (WAITING FOR APPROVAL)
  return (
    <div className="min-h-screen bg-[#fdfbfd] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden p-12 text-center border border-gray-100">
        
        <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-500/10">
          <Clock className="w-12 h-12 text-indigo-600 animate-pulse" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-inter">Account Verification Pending</h1>
        
        <p className="text-lg text-gray-500 mb-8 font-inter leading-relaxed max-w-md mx-auto">
          Thanks for joining NuttyFans! Your creator profile is currently being reviewed by our team.
        </p>

        {!onboardingCompleted && userProfile?.verificationStatus !== 'approved' && (
            <div className="mb-10 bg-purple-50 border border-purple-100 rounded-2xl p-6 text-left">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                        <PenLine className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 font-inter mb-1">Complete Your Profile</h3>
                        <p className="text-sm text-gray-600 font-inter mb-4">
                            You still need to set up your niche, subscription tiers, and payout details. Doing this now helps speed up approval.
                        </p>
                        <button 
                            onClick={() => setIsWizardOpen(true)}
                            className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20"
                        >
                            Continue Setup
                        </button>
                    </div>
                </div>
            </div>
        )}

        {onboardingCompleted && (
             <div className="mb-10 bg-green-50 border border-green-100 rounded-2xl p-6 text-left flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                     <ShieldCheck className="w-5 h-5 text-green-600" />
                 </div>
                 <div>
                     <h3 className="font-bold text-gray-900 font-inter">Profile Setup Complete & Approved</h3>
                     <p className="text-sm text-gray-600 font-inter">
                         You are ready to go! Redirecting to dashboard...
                     </p>
                 </div>
             </div>
        )}
        
        {/* Approved but incomplete setup */}
        {userProfile?.verificationStatus === 'approved' && !onboardingCompleted && (
             <div className="mb-10 bg-green-50 border border-green-100 rounded-2xl p-6 text-left">
                 <div className="flex items-start gap-4">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                         <CheckCircle className="w-6 h-6 text-green-600" />
                     </div>
                     <div className="flex-1">
                         <h3 className="font-bold text-gray-900 font-inter mb-1 text-lg">🎉 You are Verified!</h3>
                         <p className="text-sm text-gray-700 font-inter mb-4 leading-relaxed">
                             Congratulations! Your account has been approved. Please finish setting up your banking details and subscription tiers to start earning.
                         </p>
                         <button 
                             onClick={() => setIsWizardOpen(true)}
                             className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                         >
                             Complete Profile Setup
                             <ArrowRight className="w-4 h-4" />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        <div className="grid gap-4 mb-12">
            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Mail className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 font-inter">Check your inbox</h3>
                   <p className="text-sm text-gray-500 font-inter">We&apos;ll email <span className="font-semibold text-gray-800">{user?.email}</span> with updates.</p>
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
               className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all hover:shadow-md"
            >
                Refresh Status
            </button>
            <button 
               onClick={handleLogout}
               className="px-8 py-4 bg-white text-gray-600 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
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

