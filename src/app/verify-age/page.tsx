'use client';

import { useState } from 'react';
import { ArrowRight, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createUserProfile } from '@/lib/db';
import { useEffect } from 'react';

export default function VerifyAgePage() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/signup');
    }
  }, [user, router]);

  const calculateAge = (day: string, month: string, year: string): number | null => {
    if (!day || !month || !year) return null;
    
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!day || !month || !year) {
      setError('Please enter your complete date of birth');
      return;
    }

    const age = calculateAge(day, month, year);
    
    if (age === null) {
      setError('Please enter a valid date of birth');
      return;
    }

    if (age < 18) {
      setError('You must be at least 18 years old to use this platform');
      return;
    }

    if (age > 120) {
      setError('Please enter a valid date of birth');
      return;
    }

    setIsSubmitting(true);

    try {
      if (user) {
        await createUserProfile(user.uid, {
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          isAgeVerified: true,
        });
        
        // Refresh the profile in context so the app knows we are verified
        await refreshProfile();
      }
      
      // Redirect to dashboard after successful profile creation
      // Redirect to onboarding after successful verification
      router.push('/onboarding');
    } catch (err: unknown) {
      console.error('Age verification error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify age. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
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

      {/* Age Verification Form Card */}
      <div className="relative min-h-[calc(100vh-128px)] flex items-center justify-center lg:justify-end px-4 lg:pr-[175px] py-12">
        <div className="w-full max-w-[448px] relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-[33.6px] font-normal text-[#101828] mb-2 leading-[36px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Age Verification
            </h2>
            <p className="text-[23.5px] font-normal text-[#4a5565] leading-[28px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Confirm your date of birth
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
              <div className="flex items-center justify-center gap-2 mb-4">
                <Calendar 
                  className="w-5 h-5"
                  style={{ color: '#9810FA' }}
                />
              </div>
              <h3 className="text-[21px] font-normal text-[#101828] mb-2 leading-[16px] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                Verify Your Age
              </h3>
              <p className="text-[16px] font-normal text-[#4a5565] leading-[24px] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                You must be at least 18 years old to use this platform
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date of Birth Fields */}
              <div className="space-y-2">
                <label
                  htmlFor="dob"
                  className="text-[14px] font-medium text-[#364153] leading-[14px]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Date of Birth
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Day */}
                  <div>
                    <label className="text-xs font-medium text-[#364153] mb-1 block" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Day
                    </label>
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="w-full px-3 py-3 border border-[#d1d5dc] rounded-lg bg-white text-[14.2px] font-normal text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="">Day</option>
                      {days.map((d) => (
                        <option key={d} value={d.toString().padStart(2, '0')}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month */}
                  <div>
                    <label className="text-xs font-medium text-[#364153] mb-1 block" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Month
                    </label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full px-3 py-3 border border-[#d1d5dc] rounded-lg bg-white text-[14.2px] font-normal text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="">Month</option>
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="text-xs font-medium text-[#364153] mb-1 block" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-3 border border-[#d1d5dc] rounded-lg bg-white text-[14.2px] font-normal text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y} value={y.toString()}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !day || !month || !year}
                className="w-full py-3 rounded-lg font-medium text-[20px] leading-[20px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                {isSubmitting ? (
                  'Verifying...'
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
              🔒 Your information is secure and will only be used for{' '}
              <span className="font-medium">age verification</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


