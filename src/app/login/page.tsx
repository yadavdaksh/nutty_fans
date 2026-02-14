'use client';

import { useForm } from 'react-hook-form';
import { Mail, ArrowRight, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const error = err as { code?: string };
      if (error.code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password.');
      } else if (error.code === 'auth/user-not-found') {
        setAuthError('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setAuthError('Incorrect password.');
      } else {
        setAuthError('Failed to log in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            Connect. Create. Earn
          </h1>
        </div>
      </div>

      {/* Login Form Card */}
      <div className="relative min-h-[calc(100vh-128px)] flex items-center justify-center lg:justify-end px-4 lg:pr-[175px] py-12">
        <div className="w-full max-w-[448px] relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-[33.6px] font-normal text-[#101828] mb-2 leading-[36px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Welcome to NuttyFans
            </h2>
            <p className="text-[23.5px] font-normal text-[#4a5565] leading-[28px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sign in to continue
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
            <div className="mb-6">
              <h3 className="text-[21px] font-normal text-[#101828] mb-2 leading-[16px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Sign in with Email
              </h3>
              <p className="text-[16px] font-normal text-[#4a5565] leading-[24px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                We&apos;ll send you a verification code to your email
              </p>
            </div>

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
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="text-[14px] font-medium text-[#364153] leading-[14px]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm hover:underline transition-colors"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      color: '#9810FA',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#8200DB'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9810FA'}
                  >
                    Forgot password?
                  </Link>
                </div>
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
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
                  'Signing in...'
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Terms and Privacy */}
            <div className="mt-8 text-center">
              <p className="text-[16px] font-normal text-[#4a5565] leading-[24px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                By continuing, you agree to our{' '}
                <Link
                  href="/terms"
                  className="hover:underline transition-colors"
                  style={{ color: '#9810FA' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#8200DB'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9810FA'}
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="hover:underline transition-colors"
                  style={{ color: '#9810FA' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#8200DB'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9810FA'}
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Security Message */}
          <div className="mt-8 text-center">
            <p className="text-[18px] font-normal text-[#4a5565] leading-[20px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              🔒 Your email is secure and will only be used for{' '}
              <span className="font-medium">authentication</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
