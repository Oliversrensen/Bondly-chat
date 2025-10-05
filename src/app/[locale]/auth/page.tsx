"use client";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/lib/i18n";

function AuthForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { t } = useTranslations();

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center py-12 px-4">
      <div className="card card-elevated w-full max-w-md space-y-8 animate-scale-in">
        {/* Logo */}
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <img 
              src="/logo.svg" 
              alt="Bondly logo" 
              className="h-16 w-16 mx-auto animate-bounce-gentle" 
            />
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse-glow"></div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              {t('auth.welcome') || 'Join Bondly'}
            </span>
          </h1>
          <p className="text-dark-300">
            {t('auth.subtitle') || 'Start chatting with amazing people in seconds'}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{t('auth.freeMessage') || '100% Free • No Credit Card Required'}</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="btn btn-primary w-full py-4 text-lg font-semibold group relative overflow-hidden"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              Signing in...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </div>
          )}
        </button>

        {/* Info */}
        <div className="text-center text-sm text-dark-400 space-y-2">
          <p>Quick and secure sign-in with your Google account</p>
          <p>No additional passwords needed!</p>
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Your data is safe and private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-dark-300">Loading...</p>
        </div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
