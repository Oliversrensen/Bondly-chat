import "./../styles/globals.css";
import Link from "next/link";
import React from "react";
import Providers from "./providers";
import dynamic from "next/dynamic";
import StructuredData from '@/components/StructuredData';
import SafeAnalytics from '@/components/Analytics';
import Script from 'next/script';
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AuthButtons = dynamic(() => import("@/components/AuthButtons"), {
  ssr: false,
});

const MobileMenu = dynamic(() => import("@/components/MobileMenu"), {
  ssr: false,
});

export const metadata = {
  title: {
    default: "Bondly - Anonymous Chat App | Chat with Strangers & Make Friends",
    template: "%s | Bondly - Anonymous Chat"
  },
  description: "Join Bondly, the best anonymous chat app to meet new people and make friends. Chat with strangers safely, build meaningful connections, and discover amazing conversations. Start chatting now!",
  keywords: [
    "anonymous chat app",
    "chat with strangers",
    "anonymous messaging",
    "meet new people online",
    "random chat app",
    "stranger chat",
    "online friends",
    "chat room app",
    "social connection app",
    "bondly chat",
    "anonymous chat platform",
    "safe chat app",
    "meaningful conversations",
    "chat anonymously",
    "make friends online",
    "instant messaging",
    "chat app for strangers",
    "anonymous social app",
    "chat platform",
    "online chat community"
  ],
  authors: [{ name: "Bondly Team" }],
  creator: "Bondly",
  publisher: "Bondly",
  applicationName: "Bondly",
  category: "Social Networking",
  classification: "Anonymous Chat Application",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bondly.chat'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bondly.chat',
    siteName: 'Bondly - Anonymous Chat App',
    title: 'Bondly - Anonymous Chat App | Chat with Strangers & Make Friends',
    description: 'Join Bondly, the best anonymous chat app to meet new people and make friends. Chat with strangers safely, build meaningful connections, and discover amazing conversations.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bondly - Anonymous Chat App with Strangers',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bondly_chat',
    creator: '@bondly_chat',
    title: 'Bondly - Anonymous Chat App | Chat with Strangers & Make Friends',
    description: 'Join Bondly, the best anonymous chat app to meet new people and make friends. Chat with strangers safely, build meaningful connections.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '7i9WUwAq9bVsesUoXLSRmBj3mUSfb6W7q5mmhecy_58',
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/logo.svg", sizes: "64x64", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/logo.svg", sizes: "180x180", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    'og:image': '/logo.svg',
    'og:image:width': '64',
    'og:image:height': '64',
    'og:image:type': 'image/svg+xml',
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#FF6B00",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  // Get user's Pro status if logged in
  let isPro = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true }
    });
    isPro = user?.isPro ?? false;
  }

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
                      alt="Bondly - Anonymous Chat App Logo" 
                      className="h-10 w-10 group-hover:scale-110 transition-transform duration-300" 
                      width="40"
                      height="40"
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
                        href="/friends"
                        className="text-dark-300 hover:text-green-400 transition-colors duration-200 text-sm font-medium group flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-lg bg-dark-800/50 flex items-center justify-center group-hover:bg-green-500/10 transition-colors duration-200">
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <span>Friends</span>
                      </Link>
                  
                  {!isPro ? (
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
                  ) : (
                    <div className="text-accent-400 text-sm font-medium flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <span>Pro Member</span>
                    </div>
                  )}
                  
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
          <main className="min-h-screen pb-20 md:pb-0">
            {children}
          </main>

          {/* Sticky Mobile CTA */}
          <div className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-t border-dark-700/50 p-3 md:hidden z-50 safe-area-pb sticky-cta-container">
            <div className="max-w-sm mx-auto">
              <div className="flex gap-2">
                {session ? (
                  <a 
                    href="/chat" 
                    className="flex-1 btn btn-primary text-center py-3 text-sm font-semibold min-h-[48px] flex items-center justify-center"
                  >
                    Start Chatting
                  </a>
                ) : (
                  <a 
                    href="/auth" 
                    className="flex-1 btn btn-primary text-center py-3 text-sm font-semibold min-h-[48px] flex items-center justify-center"
                  >
                    Start Chatting Free
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Modern Footer */}
          <footer className="border-t border-dark-700/50 bg-dark-900/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.svg" alt="Bondly - Anonymous Chat App Logo" className="h-8 w-8" width="32" height="32" />
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
        
        {/* Optimized Analytics - Load after user interaction */}
        <SafeAnalytics />
        
        {/* Combined Google Analytics and Ads - Single script load */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Script
            id="google-analytics-optimized"
            strategy="lazyOnload"
          >
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              // Load GA4
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_title: document.title,
                page_location: window.location.href,
              });
              
              // Load Google Ads
              gtag('config', 'AW-17611634536');
            `}
          </Script>
        )}
        
        {/* Load gtag script only when needed */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}"
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
