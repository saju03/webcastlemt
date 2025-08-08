/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "@/components/PhoneInput";
import { buildE164, normalizeLocalNumber, validateCountryCode, validateE164, validateLocalNumber } from "@/lib/phone";
import { fetchSetupStatus, saveUserPhone } from "@/services/userService";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function SetupPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { status } = useAuthGuard();
  const [countryCode, setCountryCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const checkSetupStatus = useCallback(async () => {
    try {
      const { hasPhone } = await fetchSetupStatus();
      if (hasPhone) {
        setIsSetupComplete(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking setup status:", error);
    }
  }, [router]);

  // Check if user has already completed setup
  useEffect(() => {
    if (session?.user?.email) {
      checkSetupStatus();
    }
  }, [session, checkSetupStatus]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!countryCode.trim()) return setError("Please enter your country code (e.g., +91)");
    if (!phone.trim()) return setError("Please enter your phone number (without country code)");

    if (!validateCountryCode(countryCode)) return setError("Please enter a valid country code (e.g., +91)");

    const digitsOnlyLocal = normalizeLocalNumber(phone);
    if (!validateLocalNumber(digitsOnlyLocal)) return setError("Please enter a valid phone number without the country code");

    const fullPhone = buildE164(countryCode, digitsOnlyLocal);
    if (!validateE164(fullPhone)) return setError("Please enter a valid full phone number");

    setLoading(true);
    setError(null);

    try {
      await saveUserPhone(fullPhone);
      setIsSetupComplete(true);
      
      // Redirect to home after successful setup
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      console.error("Setup error:", error);
      setError(error.response?.data?.error || "Failed to save phone number");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isSetupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
            <p className="text-gray-600">Your phone number has been saved successfully.</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to home page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Setup</h2>
          <p className="text-gray-600 mb-8">
            Welcome, {session?.user?.name}! Please provide your phone number to receive event reminders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PhoneInput
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            localPhone={phone}
            onLocalPhoneChange={setPhone}
            disabled={loading}
          />

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              "Save Phone Number"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>You can update this later in your settings.</p>
        </div>
      </div>
    </div>
  );
} 