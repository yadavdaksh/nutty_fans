import React from 'react';
import { Calendar, AlertCircle, ArrowRight } from 'lucide-react';


interface AgeVerificationStepProps {
  day: string;
  setDay: (value: string) => void;
  month: string;
  setMonth: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  verifyAge: (e: React.FormEvent) => Promise<void>;
  ageError: string | null;
  loading: boolean;
}

export default function AgeVerificationStep({
  day,
  setDay,
  month,
  setMonth,
  year,
  setYear,
  verifyAge,
  ageError,
  loading
}: AgeVerificationStepProps) {

    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
    const months = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
        { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
        { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' },
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (

    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
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
            <h2 className="text-[33.6px] font-normal text-[#101828] mb-2 leading-[36px]" style={{ fontFamily: 'Inter, sans-serif' }}>Age Verification</h2>
            <p className="text-[23.5px] font-normal text-[#4a5565] leading-[28px]" style={{ fontFamily: 'Inter, sans-serif' }}>Confirm your date of birth</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-[14px] p-6 shadow-lg">
             <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#9810fa]" />
              </div>
              <h3 className="text-[21px] font-normal text-[#101828] mb-2 leading-[16px] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Verify Your Age</h3>
              <p className="text-[16px] font-normal text-[#4a5565] leading-[24px] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>You must be at least 18 years old to use this platform</p>
            </div>

            {ageError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {ageError}
              </div>
            )}

            <form onSubmit={verifyAge} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#364153] leading-[14px]" style={{ fontFamily: 'Inter, sans-serif' }}>Date of Birth</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#364153] mb-1 block">Day</label>
                    <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full px-3 py-3 border border-[#d1d5dc] rounded-lg bg-white text-[14.2px] font-normal text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Day</option>
                      {days.map((d) => <option key={d} value={d.toString().padStart(2, '0')}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#364153] mb-1 block">Month</label>
                    <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3 py-3 border border-[#d1d5dc] rounded-lg bg-white text-[14.2px] font-normal text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Month</option>
                      {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#364153] mb-1 block">Year</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-3 py-3 border border-[#d1d5dc] rounded-lg bg-white text-[14.2px] font-normal text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Year</option>
                      {years.map((y) => <option key={y} value={y.toString()}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
               <button type="submit" disabled={loading || !day || !month || !year} className="w-full bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white py-3 rounded-lg font-medium text-[20px] leading-[20px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? 'Verifying...' : (<>Continue <ArrowRight className="w-5 h-5" /></>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    );
}
