'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, AlertCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  // useEffect(() => {
  //   // Redirect if not logged in - Handled by ProtectedRoute
  //   if (!user) {
  //     router.push('/signup');
  //   }
  // }, [user, router]);


  useEffect(() => {
    // Timer for resend OTP
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, ''); // Only allow digits
    setOtp(newOtp);
    setError(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Implement actual OTP verification with Firebase or your backend
      // For now, simulate verification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Redirect to age verification page
      router.push('/verify-age');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code. Please try again.';
      setError(errorMessage);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    setError(null);
    
    try {
      // TODO: Implement actual OTP resend logic
      // For now, just reset the timer
    } catch {
      setError('Failed to resend code. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
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

      {/* OTP Form Card */}
      <div className="relative min-h-[calc(100vh-128px)] flex items-center justify-center lg:justify-end px-4 lg:pr-[175px] py-12">
        <div className="w-full max-w-[448px] relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-[33.6px] font-normal text-[#101828] mb-2 leading-[36px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Verify Your Email
            </h2>
            <p className="text-[23.5px] font-normal text-[#4a5565] leading-[28px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Enter the code sent to your email
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-[14px] p-6 shadow-lg">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-[#9810fa]" />
                <p className="text-[16px] font-normal text-[#4a5565] leading-[24px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {user?.email || 'your email'}
                </p>
              </div>
              <p className="text-[16px] font-normal text-[#4a5565] leading-[24px] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                We&apos;ve sent a 6-digit verification code to your email address
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input Fields */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-semibold border border-[#d1d5dc] rounded-lg bg-white text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white py-3 rounded-lg font-medium text-[20px] leading-[20px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isSubmitting ? (
                  'Verifying...'
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Resend Code */}
            <div className="mt-6 text-center">
              <p className="text-[16px] font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Didn&apos;t receive the code?{' '}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-[#9810fa] font-medium hover:underline"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="text-[#4a5565]">
                    Resend in {resendTimer}s
                  </span>
                )}
              </p>
            </div>

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
    </ProtectedRoute>
  );
}


