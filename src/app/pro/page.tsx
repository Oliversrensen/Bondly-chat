"use client";

import { useState } from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bondly Pro - Premium Anonymous Chat Features | Upgrade Now",
  description: "Unlock premium features with Bondly Pro: custom display names, gender filtering, priority matching, and enhanced security. Upgrade your anonymous chat experience today!",
  keywords: [
    "bondly pro",
    "premium chat features",
    "anonymous chat upgrade",
    "custom display names",
    "gender filtering chat",
    "priority matching",
    "premium chat app",
    "bondly subscription",
    "chat app premium",
    "enhanced chat features"
  ],
  openGraph: {
    title: "Bondly Pro - Premium Anonymous Chat Features | Upgrade Now",
    description: "Unlock premium features with Bondly Pro: custom display names, gender filtering, priority matching, and enhanced security.",
    url: "https://bondly.chat/pro",
    type: "website",
  },
  twitter: {
    title: "Bondly Pro - Premium Anonymous Chat Features | Upgrade Now",
    description: "Unlock premium features with Bondly Pro: custom display names, gender filtering, priority matching, and enhanced security.",
  },
  alternates: {
    canonical: "/pro",
  },
};

export default function ProPage() {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        alert("Could not start checkout");
      }
    } catch (e) {
      alert("Something went wrong starting checkout");
    } finally {
      setLoading(false);
    }
  }

  const features = [
    {
      icon: "🎭",
      title: "Custom Display Names",
      description: "Set your own unique display name instead of 'Anonymous'",
      pro: true
    },
    {
      icon: "👥",
      title: "Gender Filtering",
      description: "Filter matches by gender preference for better compatibility",
      pro: true
    },
    {
      icon: "⭐",
      title: "Priority Matching",
      description: "Get matched faster with our priority queue system",
      pro: true
    },
    {
      icon: "🎨",
      title: "Custom Themes",
      description: "Personalize your chat experience with exclusive themes",
      pro: true
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "See your connection stats and chat insights",
      pro: true
    },
    {
      icon: "🛡️",
      title: "Enhanced Security",
      description: "Advanced moderation and safety features",
      pro: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Go Pro
            </span>
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Unlock premium features and enhance your anonymous chat experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Pricing Card */}
          <div className="card card-glow animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold mb-2">Pro Membership</h2>
              <div className="mb-6">
                <span className="text-5xl font-bold text-primary-400">$9.99</span>
                <span className="text-dark-400 text-lg">/month</span>
              </div>
              
              <p className="text-dark-300 mb-8">
                Get unlimited access to all premium features and enhance your chat experience
              </p>

              <button
                className="btn btn-primary px-8 py-4 text-lg font-semibold w-full group"
                onClick={upgrade}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Upgrade to Pro
                  </div>
                )}
              </button>

              <p className="text-xs text-dark-500 mt-4">
                Powered by Stripe • Cancel anytime • 30-day money-back guarantee
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
                Pro Features
              </span>
            </h3>
            
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="card card-elevated group hover:card-glow transition-all duration-300 animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-primary-400 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-dark-300 text-sm">
                        {feature.description}
                      </p>
                    </div>
                    <div className="w-6 h-6 bg-accent-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">Pro</span>?
            </h2>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto">
              Join thousands of satisfied users who have enhanced their chat experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card card-elevated text-center group hover:card-glow transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-accent-400">Instant Access</h3>
              <p className="text-dark-300">
                Get immediate access to all Pro features as soon as you upgrade
              </p>
            </div>

            <div className="card card-elevated text-center group hover:card-glow transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary-400">Risk-Free</h3>
              <p className="text-dark-300">
                30-day money-back guarantee. Cancel anytime with no questions asked
              </p>
            </div>

            <div className="card card-elevated text-center group hover:card-glow transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-secondary-400">Better Connections</h3>
              <p className="text-dark-300">
                Find more meaningful connections with advanced matching and filtering
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
