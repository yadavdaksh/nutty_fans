'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile, createCreatorProfile, createUserProfile } from '@/lib/db';
import { updateProfile } from 'firebase/auth';
import { useStorage } from '@/hooks/useStorage';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Step, Role } from './onboarding.types';

// Components
import OTPStep from './components/OTPStep';
import AgeVerificationStep from './components/AgeVerificationStep';
import RoleSelectionStep from './components/RoleSelectionStep';
import UserProfileStep from './components/UserProfileStep';


export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { uploadFile } = useStorage();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // State Restoration & Initialization
  useEffect(() => {
    const init = async () => {
      if (!loading && user) {
        // Redirect if already completed
        if (userProfile?.onboardingCompleted) {
          if (userProfile.role === 'creator') {
            if (userProfile.verificationStatus === 'approved') {
                router.push('/dashboard');
            } else {
                router.push('/verification-pending');
            }
          } else {
            router.push('/');
          }
          return;
        }

        if (!userProfile) {
          // Create pending profile immediately
          console.log("Creating pending profile...");
          await createUserProfile(user.uid, {
            email: user.email || '',
            displayName: user.displayName || '',
            role: 'user', // Temporary default, will select later
            emailVerified: false,
            onboardingStep: 1,
            onboardingCompleted: false
          });
          await refreshProfile();
          setStep(1);
        } else {
          // Logic: OTP First -> Age Verification -> Role -> Flow
          const dbStep = (userProfile.onboardingStep || 1) as Step;

          if (dbStep === 1) {
            setStep(dbStep);
          } else if (dbStep === 2) {
            setStep(dbStep);
          } else {
            // Has passed Age Verification? Check flag.
            if (!userProfile.isAgeVerified) {
              setStep(2); // Safety net
            } else {
              setStep(dbStep);
            }
            // Ensure role is valid for our local state (exclude admin)
            if (userProfile.role && userProfile.role !== 'admin') {
              setRole(userProfile.role as Role);
            }
          }

          // Sync email verified state
          if (userProfile.emailVerified) {
            setIsEmailVerified(true);
          }
        }
      }
    };
    init();
  }, [user, userProfile, loading, router, refreshProfile]);

  // Age Verification State
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [ageError, setAgeError] = useState<string | null>(null);

  const calculateAge = (d: string, m: string, y: string): number | null => {
    if (!d || !m || !y) return null;
    const birthDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const verifyAge = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgeError(null);
    const age = calculateAge(day, month, year);

    if (age === null) {
      setAgeError('Please enter a valid date of birth');
      return;
    }
    if (age < 18) {
      setAgeError('You must be at least 18 years old to use this platform');
      return;
    }
    if (age > 120) {
      setAgeError('Please enter a valid date of birth');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        await updateUserProfile(user.uid, { isAgeVerified: true, onboardingStep: 3 });
        await refreshProfile();
      }
      setStep(3); // Move to Role Selection
    } catch (err) {
      console.error('Age verification error:', err);
      setAgeError('Failed to verify age. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Form States
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: '',
  });
  


  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Initialize and Sync OTP Timer with LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const lastSent = localStorage.getItem('last_otp_sent_at');
    if (lastSent && user?.uid === localStorage.getItem('last_otp_uid')) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      if (remaining > 0) {
        setResendTimer(remaining);
      }
    }
  }, [user]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // Handle Initial OTP Send
  useEffect(() => {
    if (step === 1 && userProfile && user?.email && !isEmailVerified && !userProfile.emailVerified && !loading) {
       const lastSent = localStorage.getItem('last_otp_sent_at');
       const lastUid = localStorage.getItem('last_otp_uid');
       
       // Only auto-send if never sent for this user or 60s passed
       const shouldAutoSend = !lastSent || lastUid !== user.uid || (Date.now() - parseInt(lastSent) > 60000);
       
       if (shouldAutoSend) {
          console.log("Auto-sending initial OTP...");
          sendOtp();
       }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, user, userProfile, isEmailVerified]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length - 1, 5)]?.focus();
  };

  const sendOtp = async () => {
    if (!user?.email) return;
    setLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, uid: user.uid }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setResendTimer(60);
      if (user) {
        localStorage.setItem('last_otp_sent_at', Date.now().toString());
        localStorage.setItem('last_otp_uid', user.uid);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user?.email) return;
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Please enter a complete 6-digit code');
      return;
    }

    setLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, uid: user.uid, otp: code }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      setIsEmailVerified(true);
      if (user) await updateUserProfile(user.uid, { emailVerified: true, onboardingStep: 2 });
      await refreshProfile();
      setStep(2); // Move to Age Verification Step
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setOtpError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      if (type === 'profile') setSelectedImage(imageUrl);
    }
  };

  const handleContinue = async () => {
    // Step 1 is handled by verifyOtp directly

    // Step 3: Role Selection
    if (step === 3) {
      if (!role) return;
      
      if (role === 'user') {
         // User Flow: Move to Profile
         setStep(4);
         await updateUserProfile(user!.uid, { role: 'user', onboardingStep: 4 });
      } else {
         // Creator Flow: Redirect to Verification Pending IMMEDIATELY
         setLoading(true);
         try {
             // Set them as pending and role=creator. 
             // onboardingCompleted = false means they still need to do the setup on the pending page.
             await updateUserProfile(user!.uid, { 
                 role: 'creator', 
                 verificationStatus: 'pending',
                 onboardingStep: 4,
                 onboardingCompleted: false 
             });
             // Also create the creator profile stub so checking it doesn't fail
             await createCreatorProfile(user!.uid, {
                 subscriberCount: 0,
                 subscriptionTiers: [], 
                 // We don't have these yet, they will be filled in the pending page
             });
             
             await refreshProfile();
             router.push('/verification-pending');
         } catch (error) {
             console.error("Error setting up creator:", error);
         } finally {
             setLoading(false);
         }
      }
    }
    
    // User Flow Steps
    else if (role === 'user') {
      if (step === 4) { // User Profile
        setLoading(true);
        try {
          if (user) {
            let photoURL = user.photoURL;
            
            if (imageFile) {
              const path = `users/${user.uid}/profile_${Date.now()}_${imageFile.name}`;
              photoURL = await uploadFile(imageFile, path);
            }

            await updateProfile(user, {
              displayName: formData.displayName,
              photoURL: photoURL,
            });
            await updateUserProfile(user.uid, {
              displayName: formData.displayName,
              bio: formData.bio,
              photoURL: photoURL || undefined,
              role: 'user',
              onboardingCompleted: true,
              onboardingStep: 5 
            });
            await refreshProfile();
          }
          setStep(5);
        } catch (error) {
          console.error('Error updating profile:', error);
        } finally {
          setLoading(false);
        }
      } else if (step === 5) {
        router.push('/');
      }
    } 
  };

  const handleBack = () => {
    if (step === 1) return; 
    if (step === 2) return; 
    if (step === 3) return; 
    setStep((prev) => (prev - 1) as Step);
  };

  const getProgress = () => {
    // Creator flow ends at step 3 in this file now (redirects)
    const totalSteps = role === 'creator' ? 3 : 5; 
    const currentStep = step - 1; 
    const progress = (currentStep / totalSteps) * 100;
    return `${Math.round(progress)}%`;
  };

  const checkStepValidity = () => {
    if (step === 1) return otp.join('').length === 6;
    if (step === 2) return day !== '' && month !== '' && year !== ''; 
    if (step === 3) return !!role; 
    
    if (role === 'user') {
      if (step === 4) {
        return formData.displayName.trim() !== '' && formData.bio.trim().length >= 10;
      }
      return true; 
    }
    
    // Creator steps are no longer here
    return false;
  };

  const isStepValid = checkStepValidity();

  if (step === 1) {
    return (
      <OTPStep
        otp={otp}
        otpError={otpError}
        loading={loading}
        resendTimer={resendTimer}
        isEmailVerified={isEmailVerified}
        user={user}
        handleOtpChange={handleOtpChange}
        handleKeyDown={handleKeyDown}
        handlePaste={handlePaste}
        sendOtp={sendOtp}
        verifyOtp={verifyOtp}
        inputRefs={inputRefs}
      />
    );
  }

  if (step === 2) {
    return (
      <AgeVerificationStep
        day={day}
        setDay={setDay}
        month={month}
        setMonth={setMonth}
        year={year}
        setYear={setYear}
        verifyAge={verifyAge}
        ageError={ageError}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbfd] flex items-center justify-center p-4">
      <div className="w-full max-w-[1440px] h-[900px] bg-white rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Step Indicator */}
        <div className="w-full max-w-xl mx-auto pt-16 px-6">
          <div className="flex justify-between text-sm font-medium text-gray-500 mb-2 font-inter">
            <span>Step {step} of {role === 'creator' ? 3 : 5}</span>
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
        <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-32 overflow-y-auto">
          
          {step === 3 && (
            <RoleSelectionStep
              role={role}
              handleRoleSelect={handleRoleSelect}
            />
          )}

          {role === 'user' && step >= 4 && (
            <UserProfileStep
              role={role}
              step={step}
              formData={formData}
              setFormData={setFormData}
              selectedImage={selectedImage}
              handleImageUpload={handleImageUpload}
              loading={loading}
            />
          )}

          {/* Footer Buttons - Action Bar */}
          <div className="w-full absolute bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none z-10">
             <div className="w-full max-w-[1000px] flex justify-between items-center pointer-events-auto">
               <button 
                  onClick={handleBack}
                  className={`bg-white px-8 py-3.5 text-[#344054] font-bold font-inter hover:bg-gray-50 rounded-full border border-gray-200 shadow-sm transition-all flex items-center gap-2 ${step <= 2 ? 'invisible' : ''}`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <div className={step <= 2 ? 'hidden' : 'block'}>    
                <button
                  onClick={handleContinue}
                  disabled={!isStepValid || loading}
                  className={`px-10 py-3.5 bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white font-bold rounded-full font-inter flex items-center gap-2 transition-all shadow-lg shadow-purple-500/30 ${
                    !isStepValid || loading 
                      ? 'opacity-50 cursor-not-allowed grayscale' 
                      : 'hover:opacity-90 hover:scale-105'
                  }`}
                >
                  {loading ? 'Processing...' : (step === 3 && role === 'creator' ? 'Continue Setup' : (role === 'user' && step === 5) ? 'Get Started' : 'Continue')}
                  <ArrowRight className="w-5 h-5" />
                </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
