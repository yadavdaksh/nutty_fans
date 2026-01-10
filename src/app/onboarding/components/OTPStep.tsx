import React from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { User } from 'firebase/auth';

interface OTPStepProps {
  otp: string[];
  otpError: string;
  loading: boolean;
  resendTimer: number;
  isEmailVerified: boolean;
  user: User | null;
  handleOtpChange: (index: number, value: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  sendOtp: () => Promise<void>;
  verifyOtp: (e?: React.FormEvent) => Promise<void>;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}

export default function OTPStep({
  otp,
  otpError,
  loading,
  resendTimer,
  isEmailVerified,
  user,
  handleOtpChange,
  handleKeyDown,
  handlePaste,
  sendOtp,
  verifyOtp,
  inputRefs
}: OTPStepProps) {

  // We rely on the parent (onboarding/page.tsx) to manage sending logic 
  // and resend cooldowns via localStorage to avoid unintended spam.

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="1"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(72 45 -72 45 720 450)"><stop stop-color="rgba(168,85,247,0.1)" offset="0"/><stop stop-color="rgba(0,0,0,0)" offset="0.5"/></radialGradient></defs></svg>'), url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="1"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(72 45 -72 45 720 450)"><stop stop-color="rgba(236,72,153,0.1)" offset="0"/><stop stop-color="rgba(0,0,0,0)" offset="0.5"/></radialGradient></defs></svg>')` }}>
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

      <div className="relative min-h-screen flex items-center justify-center lg:justify-end px-4 lg:pr-[175px] py-12">
        <div className="w-full max-w-[448px] relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-[33.6px] font-normal text-[#101828] mb-2 leading-[36px]" style={{ fontFamily: 'Inter, sans-serif' }}>Check your email</h2>
            <p className="text-[23.5px] font-normal text-[#4a5565] leading-[28px]" style={{ fontFamily: 'Inter, sans-serif' }}>We sent a verification code to</p>
            <p className="text-[23.5px] font-medium text-[#101828] leading-[28px]" style={{ fontFamily: 'Inter, sans-serif' }}>{user?.email}</p>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-[14px] p-6 shadow-xl">
             <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEmailVerified ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-[#9810fa]'}`}>
                  {isEmailVerified ? <Check className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </div>
              </div>
              <h3 className="text-[21px] font-normal text-[#101828] mb-2 leading-[16px] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Verify email</h3>
              <p className="text-[16px] font-normal text-[#4a5565] leading-[24px] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Enter the 6-digit code sent to your email</p>
            </div>

            {otpError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {otpError}
              </div>
            )}

            <form onSubmit={verifyOtp} className="space-y-6">
              <div className="grid grid-cols-6 gap-2">
                {otp.map((digit, index) => (
                  <div key={index} className="relative aspect-square">
                    <input
                      ref={(el) => { if (inputRefs.current) inputRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-full h-full text-center text-2xl font-bold border-2 border-gray-200 text-[#101828] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white shadow-sm"
                      aria-label={`Digit ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

               <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6 || isEmailVerified}
                  className="w-full bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white py-3 rounded-lg font-medium text-[20px] leading-[20px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (otp.every(d => d === '') ? 'Sending code...' : 'Verifying...') : 'Verify email'}
                </button>

                <div className="text-center">
                  <p className="text-[16px] font-normal text-[#4a5565] leading-[20px] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Didn&apos;t receive the email?
                  </p>
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={resendTimer > 0 || loading || isEmailVerified}
                    className="text-[16px] font-medium text-[#6941c6] leading-[20px] hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {resendTimer > 0 ? `Click to resend in ${resendTimer}s` : 'Click to resend'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
