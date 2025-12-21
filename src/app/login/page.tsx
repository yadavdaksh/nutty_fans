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
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 w-full h-full">
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="1"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(72 45 -72 45 720 450)"><stop stop-color="rgba(168,85,247,0.1)" offset="0"/><stop stop-color="rgba(0,0,0,0)" offset="0.5"/></radialGradient></defs></svg>'), url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="1"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(72 45 -72 45 720 450)"><stop stop-color="rgba(236,72,153,0.1)" offset="0"/><stop stop-color="rgba(0,0,0,0)" offset="0.5"/></radialGradient></defs></svg>')`,
            }}
          >
            {/* Left side image placeholder */}
            <div className="hidden lg:block absolute left-0 top-0 w-[649px] h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <div className="absolute left-[70px] top-[89px]">
                <h1 className="text-5xl font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent leading-[72px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Connect. Create. Earn
                </h1>
              </div>
            </div>
          </div>
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
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-[14px] p-6 shadow-lg">
            <div className="mb-6">
              <h3 className="text-[21px] font-normal text-[#101828] mb-2 leading-[16px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Sign in with Email
              </h3>
              <p className="text-[16px] font-normal text-[#4a5565] leading-[24px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                We&apos;ll send you a verification code to your email
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
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
                    className="w-full pl-10 pr-4 py-3 border border-[#d1d5dc] rounded-lg bg-white text-[14.2px] font-normal text-neutral-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    style={{ fontFamily: 'Inter, sans-serif' }}
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
                    className="text-sm text-[#9810fa] hover:underline"
                    style={{ fontFamily: 'Inter, sans-serif' }}
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
                    className="w-full pl-10 pr-4 py-3 border border-[#d1d5dc] rounded-lg bg-white text-[14.2px] font-normal text-neutral-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    style={{ fontFamily: 'Inter, sans-serif' }}
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
                className="w-full bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white py-3 rounded-lg font-medium text-[20px] leading-[20px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
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
                  className="text-[#9810fa] hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-[#9810fa] hover:underline"
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
