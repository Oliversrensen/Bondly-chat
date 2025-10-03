"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please try again later.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'Default':
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center px-4">
      <div className="card card-elevated max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-dark-100 mb-4">
          Authentication Error
        </h1>
        
        <p className="text-dark-300 mb-6">
          {getErrorMessage(error)}
        </p>
        
        <div className="space-y-3">
          <Link
            href="/auth"
            className="btn btn-primary w-full"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="btn btn-ghost w-full"
          >
            Go Home
          </Link>
        </div>
        
        {error && (
          <div className="mt-6 p-3 bg-dark-800/50 rounded-lg">
            <p className="text-xs text-dark-400">
              Error code: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
