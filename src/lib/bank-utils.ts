/**
 * Bank Account Validation Utilities
 */

/**
 * Validates an IBAN (International Bank Account Number)
 * Uses the MOD-97 checksum algorithm (ISO 7064)
 */
export const validateIBAN = (iban: string): boolean => {
  const cleanIban = iban.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleanIban.length < 14 || cleanIban.length > 34) return false;

  // Move the first 4 characters to the end
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
  
  // Replace letters with digits (A=10, B=11, ..., Z=35)
  const numeric = rearranged.split('').map(char => {
    const code = char.charCodeAt(0);
    return code >= 65 && code <= 90 ? (code - 55).toString() : char;
  }).join('');

  // Perform modulo 97 (using BigInt for large numbers)
  try {
    return BigInt(numeric) % BigInt(97) === BigInt(1);
  } catch {
    return false;
  }
};

/**
 * Validates US Bank Routing Number (ABA)
 * Checked by 9-digit length and checksum
 */
export const validateRoutingNumber = (routing: string): boolean => {
  const cleanRouting = routing.replace(/\D/g, '');
  if (cleanRouting.length !== 9) return false;

  // Checksum calculation:
  // 3 * (d1 + d4 + d7) + 7 * (d2 + d5 + d8) + (d3 + d6 + d9) mod 10 should be 0
  const d = cleanRouting.split('').map(Number);
  const sum = 
    3 * (d[0] + d[3] + d[6]) + 
    7 * (d[1] + d[4] + d[7]) + 
    (d[2] + d[5] + d[8]);
    
  return sum % 10 === 0;
};

/**
 * Validates Indian Financial System Code (IFSC)
 * 11 characters: BBBB 0 CCCCCC
 */
export const validateIFSC = (ifsc: string): boolean => {
  const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return regex.test(ifsc.toUpperCase());
};

/**
 * Validates SWIFT/BIC Code
 * 8 or 11 characters
 */
export const validateSwiftBIC = (swift: string): boolean => {
  const regex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  return regex.test(swift.toUpperCase());
};

/**
 * Get requirement mapping by country
 */
export type BankRequirementType = 'IBAN' | 'ABA' | 'IFSC' | 'GENERIC';

export const getCountryBankRequirement = (countryCode: string): BankRequirementType => {
  const ibanCountries = [
    'AL', 'AD', 'AT', 'AZ', 'BE', 'BH', 'BA', 'BR', 'BG', 'CR', 'HR', 'CY', 'CZ', 'DK', 'DO', 'EE', 'FO', 'FI', 'FR', 'GE', 'DE', 'GI', 'GR', 'GL', 'GT', 'HU', 'IS', 'IE', 'IL', 'IT', 'JO', 'KZ', 'XK', 'KW', 'LV', 'LB', 'LI', 'LT', 'LU', 'MK', 'MT', 'MR', 'MU', 'MD', 'MC', 'ME', 'NL', 'NO', 'PK', 'PS', 'PL', 'PT', 'QA', 'RO', 'LC', 'SM', 'SA', 'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'TL', 'TN', 'TR', 'UA', 'AE', 'GB', 'VG'
  ];

  if (countryCode === 'US') return 'ABA';
  if (countryCode === 'IN') return 'IFSC';
  if (ibanCountries.includes(countryCode)) return 'IBAN';
  return 'GENERIC';
};
