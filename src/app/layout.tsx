import "./../styles/globals.css";
import Link from "next/link";
import React from "react";
import Providers from "./providers";
import dynamic from "next/dynamic";
import { Analytics } from '@vercel/analytics/react';
import StructuredData from '@/components/StructuredData';

const AuthButtons = dynamic(() => import("@/components/AuthButtons"), {
  ssr: false,
});

const MobileMenu = dynamic(() => import("@/components/MobileMenu"), {
  ssr: false,
});

export const metadata = {
  title: {
    default: "Bondly - Anonymous Chat with Strangers",
    template: "%s | Bondly"
  },
  description: "Connect with strangers through anonymous chat. Make new friends, have meaningful conversations, and build connections in a safe, anonymous environment.",
  keywords: [
    "anonymous chat",
    "chat with strangers",
    "online chat",
    "random chat",
    "meet new people",
    "anonymous messaging",
    "stranger chat app",
    "online friends",
    "chat room",
    "social connection"
  ],
  authors: [{ name: "Bondly Team" }],
  creator: "Bondly",
  publisher: "Bondly",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bondly.chat'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bondly.chat',
    siteName: 'Bondly',
    title: 'Bondly - Anonymous Chat with Strangers',
    description: 'Connect with strangers through anonymous chat. Make new friends, have meaningful conversations, and build connections in a safe, anonymous environment.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bondly - Anonymous Chat with Strangers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bondly - Anonymous Chat with Strangers',
    description: 'Connect with strangers through anonymous chat. Make new friends, have meaningful conversations, and build connections in a safe, anonymous environment.',
    images: ['/og-image.png'],
    creator: '@bondly_chat',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-950 text-dark-50 font-sans">
        <Providers>
          {/* Modern Header */}
          <header className="sticky top-0 z-50 border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link
                  href="/"
                  className="flex items-center gap-3 group"
                >
                  <div className="relative">
                    <img 
                      src="/logo.svg" 
                      alt="Bondly logo" 
                      className="h-10 w-10 group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-lg group-hover:bg-primary-500/30 transition-colors duration-300"></div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                    Bondly
                  </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link
                    href="/chat"
                    className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm font-medium group flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-dark-800/50 flex items-center justify-center group-hover:bg-primary-500/10 transition-colors duration-200">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span>Chat</span>
                  </Link>
                  
                      <Link
                        href="/profile"
                        className="text-dark-300 hover:text-secondary-400 transition-colors duration-200 text-sm font-medium group flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-lg bg-dark-800/50 flex items-center justify-center group-hover:bg-secondary-500/10 transition-colors duration-200">
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span>Profile</span>
                      </Link>
                  
                  <Link
                    href="/pro"
                    className="text-dark-300 hover:text-accent-400 transition-colors duration-200 text-sm font-medium group flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-dark-800/50 flex items-center justify-center group-hover:bg-accent-500/10 transition-colors duration-200">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <span>Pro</span>
                  </Link>
                  
                  <div className="ml-2 pl-4 border-l border-dark-700">
                    <AuthButtons />
                  </div>
                </nav>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                      <MobileMenu />
                    </div>
              </div>
            </div>

          </header>

          {/* Main Content */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* Modern Footer */}
          <footer className="border-t border-dark-700/50 bg-dark-900/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.svg" alt="Bondly logo" className="h-8 w-8" />
                  <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                    Bondly
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-dark-400">
                  <span>Built with</span>
                  <span className="text-secondary-400 animate-pulse">💜</span>
                  <span>for meaningful connections</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-dark-400">
                  <a href="/privacy" className="hover:text-primary-400 transition-colors duration-200">
                    Privacy
                  </a>
                  <a href="/terms" className="hover:text-primary-400 transition-colors duration-200">
                    Terms
                  </a>
                  <a href="/support" className="hover:text-primary-400 transition-colors duration-200">
                    Support
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
        <StructuredData />
        <Analytics />
      </body>
    </html>
  );
}
