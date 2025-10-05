"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is Pro
    const checkProStatus = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setIsPro(data.isPro);
      } catch (error) {
        console.error("Error checking Pro status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkProStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center">
        <div className="card card-elevated text-center max-w-md">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-dark-300 mt-4">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center">
      <div className="card card-elevated text-center max-w-md">
        {isPro ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-green-400">Welcome to Pro!</h1>
            <p className="text-dark-300 mb-6">Your Pro subscription is now active. Enjoy your premium features!</p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push("/chat")} 
                className="btn btn-primary w-full"
              >
                Start Chatting
              </button>
              <button 
                onClick={() => router.push("/profile")} 
                className="btn btn-secondary w-full"
              >
                Update Profile
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-yellow-400">Processing Payment...</h1>
            <p className="text-dark-300 mb-6">
              Your payment is being processed. This usually takes a few minutes. 
              You'll receive an email confirmation once it's complete.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary w-full"
              >
                Check Status
              </button>
              <button 
                onClick={() => router.push("/pro")} 
                className="btn btn-secondary w-full"
              >
                Back to Pro Page
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
