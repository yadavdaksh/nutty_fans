import React, { useState } from 'react';
import { Building2, Landmark, CreditCard, ShieldCheck, Info, AlertCircle, Globe, FlaskConical } from 'lucide-react';
import { BankDetails } from '@/lib/db';
import { 
  validateIBAN, 
  validateRoutingNumber, 
  validateIFSC, 
  validateSwiftBIC,
  getCountryBankRequirement,
  BankRequirementType
} from '@/lib/bank-utils';

interface BankDetailsStepProps {
  bankDetails: BankDetails;
  setBankDetails: (details: BankDetails) => void;
  loading: boolean;
}

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
];

export default function BankDetailsStep({
  bankDetails,
  setBankDetails,
  loading,
}: BankDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Refactor: Calculate requirement directly during render to avoid cascading renders
  const requirement = getCountryBankRequirement(bankDetails.country || '');

  const validateField = (name: string, value: string, currentRequirement: BankRequirementType) => {
    let error = '';
    if (!value && name !== 'routingNumber' && name !== 'swiftCode') {
      error = 'Required field';
    } else if (value) {
      if (name === 'iban' || (name === 'accountNumber' && currentRequirement === 'IBAN')) {
        if (!validateIBAN(value)) error = 'Invalid IBAN format';
      } else if (name === 'routingNumber' && currentRequirement === 'ABA') {
        if (!validateRoutingNumber(value)) error = 'Invalid 9-digit Routing Number';
      } else if (name === 'routingNumber' && currentRequirement === 'IFSC') {
        if (!validateIFSC(value)) error = 'Invalid IFSC format (e.g. ABCD0123456)';
      } else if (name === 'swiftCode') {
        if (!validateSwiftBIC(value)) error = 'Invalid SWIFT/BIC code';
      }
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankDetails({ ...bankDetails, [name]: value });
    
    // Pass latest value and requirement for immediate validation
    const currentReq = name === 'country' ? getCountryBankRequirement(value) : requirement;
    const error = validateField(name, value, currentReq);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const fillTestData = () => {
    // Default to US test data
    const testData: BankDetails = {
      country: 'US',
      accountHolderName: 'Test Creator',
      bankName: 'Test Bank',
      accountNumber: '123456789',
      routingNumber: '111000025', // Valid ABA checksum
      swiftCode: 'TESTUS33XXX',
      addressLine1: '123 Test St',
      city: 'Test City',
      region: 'NY',
      postalCode: '10001'
    };
    setBankDetails(testData);
    setErrors({});
  };

  return (
    <div className="w-full max-w-2xl text-center pb-20">
      <div className="mb-6">
        <h1 className="text-[40px] font-bold text-[#101828] mb-3 font-inter">Payout Details</h1>
        <p className="text-lg text-[#475467] font-inter">Enter your bank information to receive earnings</p>
      </div>

      {/* Test Data Button */}
      <button
        onClick={fillTestData}
        type="button"
        className="mb-8 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-2 mx-auto hover:bg-purple-100 transition-colors"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        Fill Test Data (US)
      </button>

      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-8 flex items-start gap-3 text-left">
        <div className="bg-blue-100 p-2 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-900">Secure Verification</p>
          <p className="text-xs text-blue-700 leading-relaxed font-medium">Your bank details are encrypted and used only for processing payouts. We perform local validation to ensure accuracy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 text-left mb-8">
        {/* Country Selector */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-[#475467] uppercase tracking-widest mb-2 block font-inter flex items-center gap-2">
            Bank Country *
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Select the country where your bank account is registered.
              </div>
            </div>
          </label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              name="country"
              value={bankDetails.country}
              onChange={handleChange}
              disabled={loading}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 text-[#101828] bg-white appearance-none focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter font-semibold"
            >
              <option value="">Select Country</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
              <option value="OTHER">Other Country</option>
            </select>
          </div>
        </div>

        {/* Account Holder Name */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-[#475467] uppercase tracking-widest mb-2 block font-inter">Account Holder Name *</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="accountHolderName"
              placeholder="Full name on bank account"
              value={bankDetails.accountHolderName}
              onChange={handleChange}
              disabled={loading}
              className={`w-full pl-12 pr-5 py-3.5 rounded-2xl border ${errors.accountHolderName ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter font-semibold`}
            />
          </div>
          {errors.accountHolderName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.accountHolderName}</p>}
        </div>

        {/* Account Number / IBAN */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-[#475467] uppercase tracking-widest mb-2 block font-inter">
            {requirement === 'IBAN' ? 'IBAN *' : 'Account Number *'}
          </label>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="accountNumber"
              placeholder={requirement === 'IBAN' ? 'e.g. DE89 3704 0044 ...' : 'Your bank account number'}
              value={bankDetails.accountNumber}
              onChange={handleChange}
              disabled={loading}
              className={`w-full pl-12 pr-5 py-3.5 rounded-2xl border ${errors.accountNumber ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter tracking-wider font-bold`}
            />
          </div>
          {errors.accountNumber && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.accountNumber}</p>}
        </div>

        {/* Conditional Field: Routing / IFSC */}
        {(requirement === 'ABA' || requirement === 'IFSC') && (
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-[#475467] uppercase tracking-widest mb-2 block font-inter">
              {requirement === 'ABA' ? 'Routing Number (ABA) *' : 'IFSC Code *'}
            </label>
            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="routingNumber"
                placeholder={requirement === 'ABA' ? '9-digit routing number' : 'e.g. SBIN0001234'}
                value={bankDetails.routingNumber || ''}
                onChange={handleChange}
                disabled={loading}
                className={`w-full pl-12 pr-5 py-3.5 rounded-2xl border ${errors.routingNumber ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter font-semibold`}
              />
            </div>
            {errors.routingNumber && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.routingNumber}</p>}
          </div>
        )}

        {/* Bank Name */}
        <div>
          <label className="text-xs font-bold text-[#475467] uppercase tracking-widest mb-2 block font-inter">Bank Name *</label>
          <div className="relative">
            <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="bankName"
              placeholder="e.g. Chase, HSBC"
              value={bankDetails.bankName}
              onChange={handleChange}
              disabled={loading}
              className={`w-full pl-12 pr-5 py-3.5 rounded-2xl border ${errors.bankName ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter font-semibold`}
            />
          </div>
          {errors.bankName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.bankName}</p>}
        </div>

        {/* SWIFT / BIC */}
        <div>
          <label className="text-xs font-bold text-[#475467] uppercase tracking-widest mb-2 block font-inter flex items-center gap-2">
            SWIFT / BIC 
            <span className="text-[10px] normal-case text-gray-400 font-normal">
              {requirement === 'IBAN' || requirement === 'GENERIC' ? '(Required for Int.)' : '(Optional)'}
            </span>
          </label>
          <input
            type="text"
            name="swiftCode"
            placeholder="SWIFT code"
            value={bankDetails.swiftCode || ''}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-5 py-3.5 rounded-2xl border ${errors.swiftCode ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter font-semibold`}
          />
          {errors.swiftCode && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.swiftCode}</p>}
        </div>
      </div>
      
      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 text-left mb-8 pt-6 border-t border-gray-100">
        <h3 className="md:col-span-2 text-sm font-bold text-gray-900 mb-2">Billing Address</h3>
        
        {/* Address Line 1 */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-[#475467] uppercase tracking-widest mb-2 block font-inter">Address Line 1 *</label>
          <input
            type="text"
            name="addressLine1"
            placeholder="Street address, P.O. box, c/o"
            value={bankDetails.addressLine1 || ''}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-5 py-3.5 rounded-2xl border ${errors.addressLine1 ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter font-semibold`}
          />
          {errors.addressLine1 && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.addressLine1}</p>}
        </div>

        {/* City */}
        <div>
          <label className="text-xs font-bold text-[#475467] uppercase tracking-widest mb-2 block font-inter">City *</label>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={bankDetails.city || ''}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-5 py-3.5 rounded-2xl border ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter font-semibold`}
          />
          {errors.city && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.city}</p>}
        </div>

        {/* State/Region */}
        <div>
          <label className="text-xs font-bold text-[#475467] uppercase tracking-widest mb-2 block font-inter">State / Province *</label>
          <input
            type="text"
            name="region"
            placeholder="State / Region"
            value={bankDetails.region || ''}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-5 py-3.5 rounded-2xl border ${errors.region ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter font-semibold`}
          />
          {errors.region && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.region}</p>}
        </div>

        {/* Postal Code */}
        <div>
          <label className="text-xs font-bold text-[#475467] uppercase tracking-widest mb-2 block font-inter">Zip / Postal Code *</label>
          <input
            type="text"
            name="postalCode"
            placeholder="Zip Code"
            value={bankDetails.postalCode || ''}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-5 py-3.5 rounded-2xl border ${errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-[#101828] placeholder:text-gray-400 focus:outline-none focus:border-[#9810fa] focus:ring-4 focus:ring-[#9810fa]/10 transition-all font-inter font-semibold`}
          />
          {errors.postalCode && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.postalCode}</p>}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center font-medium leading-relaxed max-w-sm mx-auto">
        By continuing, you confirm that the provided bank information is accurate. Incorrect details may lead to delayed payouts or lost funds.
      </p>
    </div>
  );
}
