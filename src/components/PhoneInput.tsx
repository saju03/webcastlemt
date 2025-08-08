"use client";

import React from "react";
import {
  COUNTRY_CODE_PATTERN,
  MIN_LOCAL_DIGITS,
} from "@/lib/phone";

type PhoneInputProps = {
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
  localPhone: string;
  onLocalPhoneChange: (value: string) => void;
  disabled?: boolean;
};

export default function PhoneInput({
  countryCode,
  onCountryCodeChange,
  localPhone,
  onLocalPhoneChange,
  disabled = false,
}: PhoneInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 mb-2">
          Country Code
        </label>
        <input
          id="countryCode"
          type="text"
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          placeholder="+91"
          pattern={COUNTRY_CODE_PATTERN}
          maxLength={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={disabled}
          required
        />
        <p className="mt-1 text-sm text-gray-500">Examples: +1, +44, +91</p>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number (without country code)
        </label>
        <input
          id="phone"
          type="tel"
          value={localPhone}
          onChange={(e) => onLocalPhoneChange(e.target.value)}
          placeholder={"9".repeat(MIN_LOCAL_DIGITS)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={disabled}
          required
        />
        <p className="mt-1 text-sm text-gray-500">We&apos;ll use this number to call you with event reminders.</p>
      </div>
    </div>
  );
}


