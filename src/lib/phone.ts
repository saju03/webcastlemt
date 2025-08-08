// Phone number utilities for validation and formatting (E.164)

export const COUNTRY_CODE_REGEX = /^\+\d{1,3}$/;
export const COUNTRY_CODE_PATTERN = "^\\+\\d{1,3}$";

export const FULL_E164_REGEX = /^\+\d{8,15}$/;
export const FULL_E164_PATTERN = "^\\+\\d{8,15}$";

export const MIN_LOCAL_DIGITS = 7;

export function normalizeLocalNumber(input: string): string {
  return input.replace(/\D/g, "");
}

export function buildE164(countryCode: string, localDigits: string): string {
  return `${countryCode}${localDigits}`;
}

export function validateCountryCode(countryCode: string): boolean {
  return COUNTRY_CODE_REGEX.test(countryCode);
}

export function validateLocalNumber(localDigits: string, minDigits: number = MIN_LOCAL_DIGITS): boolean {
  return localDigits.length >= minDigits && /^\d+$/.test(localDigits);
}

export function validateE164(full: string): boolean {
  return FULL_E164_REGEX.test(full);
}


