'use client';

import { useForm } from 'react-hook-form';
import { Mail, ArrowRight, Lock, AlertCircle, User, Check, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import TermsModal from '@/components/modals/TermsModal';

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, {
        displayName: data.fullName,
      });

      router.push('/onboarding');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError('Failed to create account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="min-h-[calc(100vh-128px)] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(250, 245, 255, 1) 0%, rgba(253, 242, 248, 1) 50%, rgba(255, 247, 237, 1) 100%)',
        }}
      >
        {/* Background gradient overlays */}
        <div 
          className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, rgba(0, 0, 0, 0) 50%)',
            filter: 'blur(100px)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, rgba(0, 0, 0, 0) 50%)',
            filter: 'blur(100px)',
          }}
        />
        
        {/* Left side image placeholder */}
        <div className="hidden lg:block absolute left-0 top-0 w-[649px] h-full">
          <div className="absolute left-[70px] top-[89px]">
            <h1 
              className="text-5xl font-semibold leading-[72px]"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                background: 'linear-gradient(90deg, rgba(173, 70, 255, 1) 0%, rgba(227, 132, 255, 1) 50%, rgba(134, 93, 255, 1) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Join the Community.
            </h1>
          </div>
        </div>

        {/* Signup Form Card */}
        <div className="relative min-h-[calc(100vh-128px)] flex items-center justify-center lg:justify-end px-4 lg:pr-[175px] py-12">
          <div className="w-full max-w-[448px] relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-[33.6px] font-normal text-[#101828] mb-2 leading-[36px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Create your account
              </h2>
              <p className="text-[23.5px] font-normal text-[#4a5565] leading-[28px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Start your journey today
              </p>
            </div>

            {/* Form Card */}
            <div 
              className="rounded-[14px] p-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
              }}
            >
              
              {authError && (
                <div 
                  className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#FB2C36',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <AlertCircle className="w-4 h-4" />
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Full Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="fullName"
                    className="text-[14px] font-medium text-[#364153] leading-[14px]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        border: '1px solid #D1D5DC',
                        backgroundColor: '#FFFFFF',
                        color: '#101828',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#9810FA';
                        e.currentTarget.style.boxShadow = '0px 0px 0px 2px rgba(152, 16, 250, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DC';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      {...register('fullName', {
                        required: 'Full name is required',
                      })}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-[14px] font-medium text-[#364153] leading-[14px]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        border: '1px solid #D1D5DC',
                        backgroundColor: '#FFFFFF',
                        color: '#101828',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#9810FA';
                        e.currentTarget.style.boxShadow = '0px 0px 0px 2px rgba(152, 16, 250, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DC';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-[14px] font-medium text-[#364153] leading-[14px]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        border: '1px solid #D1D5DC',
                        backgroundColor: '#FFFFFF',
                        color: '#101828',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#9810FA';
                        e.currentTarget.style.boxShadow = '0px 0px 0px 2px rgba(152, 16, 250, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DC';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-[14px] font-medium text-[#364153] leading-[14px]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        border: '1px solid #D1D5DC',
                        backgroundColor: '#FFFFFF',
                        color: '#101828',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#9810FA';
                        e.currentTarget.style.boxShadow = '0px 0px 0px 2px rgba(152, 16, 250, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DC';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      {...register('confirmPassword', {
                        validate: (val) => {
                          if (watch('password') != val) {
                            return 'Your passwords do no match';
                          }
                        },
                      })}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="space-y-3">
                  <div 
                    className="flex items-start gap-3 p-4 rounded-xl transition-colors"
                    style={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E9D4FF'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  >
                    <div className="relative flex items-center h-5">
                      <input
                        id="agreeTerms"
                        type="checkbox"
                        className="w-5 h-5 rounded cursor-pointer"
                        style={{
                          borderColor: '#D1D5DC',
                          accentColor: '#9810FA',
                        }}
                        {...register('agreeTerms', {
                          required: 'You must agree to the Terms & Conditions',
                        })}
                      />
                    </div>
                    <div className="text-sm leading-5">
                      <label htmlFor="agreeTerms" className="text-gray-600 font-medium cursor-pointer">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setIsTermsOpen(true)}
                          className="font-bold hover:underline transition-colors"
                          style={{
                            color: '#9810FA',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#8200DB'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#9810FA'}
                        >
                          Terms & Conditions
                        </button>
                        {' '}and I am 18+ years of age.
                      </label>
                      <div className="flex items-center gap-1.5 mt-1.5 text-pink-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">Legal Requirement</span>
                      </div>
                    </div>
                  </div>
                  {errors.agreeTerms && (
                    <p className="text-xs text-red-500 ml-1">{errors.agreeTerms.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) e.currentTarget.style.opacity = '1';
                  }}
                >
                  {isSubmitting ? (
                    'Creating Account...'
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Terms and Privacy */}
              <div className="mt-8 text-center">
                <p className="text-[16px] font-normal text-[#4a5565] leading-[24px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="hover:underline transition-colors"
                    style={{ color: '#9810FA' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#8200DB'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9810FA'}
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TermsModal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
        onAccept={() => {
          setIsTermsOpen(false);
        }}
        showAcceptButton={false}
      />
    </>
  );
}
