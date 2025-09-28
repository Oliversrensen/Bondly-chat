"use client";

import { Analytics } from '@vercel/analytics/react';
import { useEffect } from 'react';

export default function SafeAnalytics() {
  useEffect(() => {
    // Suppress Vercel Analytics errors in console
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('_vercel/insights/script.js') || 
          args[0]?.includes?.('Vercel Web Analytics')) {
        // Suppress Vercel Analytics errors
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Only render Analytics in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return <Analytics />;
}
