"use client";

import { useState, useEffect } from "react";

export default function ProPage() {
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if user is already Pro
  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setIsPro(data.isPro || false);
      } catch (error) {
        console.error("Error checking Pro status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkProStatus();
  }, []);

  async function upgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/gumroad/checkout", { method: "POST" });
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
      description: "Set your own unique display name to stand out in conversations",
      pro: true
    },
    {
      icon: "👥",
      title: "Gender Filtering",
      description: "Filter matches by gender preference (Male/Female/Any) for better compatibility",
      pro: true
    },
    {
      icon: "⭐",
      title: "Priority Matching",
      description: "Get matched faster with priority placement in the matching queue",
      pro: true
    }
  ];

  // Loading state
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center">
        <div className="card card-elevated text-center max-w-md">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-dark-300 mt-4">Checking your Pro status...</p>
        </div>
      </div>
    );
  }

  // Pro user experience
  if (isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Pro User Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Welcome to Pro!
              </span>
            </h1>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              You're all set! Enjoy your premium features and enhanced chat experience.
            </p>
          </div>

          {/* Pro Features Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card card-glow group hover:card-elevated transition-all duration-300 animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-green-400 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-dark-300 text-sm mb-2">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card card-elevated">
              <h3 className="text-xl font-semibold mb-4 text-primary-400">Your Pro Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-dark-300">Custom display names</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-dark-300">Gender filtering preferences</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-dark-300">Priority matching queue</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-dark-300">Enhanced chat experience</span>
                </li>
              </ul>
            </div>

            <div className="card card-elevated">
              <h3 className="text-xl font-semibold mb-4 text-secondary-400">Quick Actions</h3>
              <div className="space-y-3">
                <a 
                  href="/chat" 
                  className="btn btn-primary w-full flex items-center gap-2 justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Start Chatting
                </a>
                <a 
                  href="/profile" 
                  className="btn btn-secondary w-full flex items-center gap-2 justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Update Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Free vs Pro Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="card card-elevated">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-secondary-400">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-secondary-400">$0</span>
                <span className="text-dark-400">/month</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-dark-300">Anonymous chat with strangers</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-dark-300">Random matching</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-dark-300">Interest-based matching</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-dark-300">Basic safety features</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-dark-400">Custom display name</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-dark-400">No gender filtering</span>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="card card-glow animate-scale-in relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary-400">$5.99</span>
                <span className="text-dark-400">/month</span>
              </div>

              <button
                className="btn btn-primary px-8 py-4 text-lg font-semibold w-full group mb-4"
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

              <p className="text-xs text-dark-500">
                Cancel anytime • 30-day money-back guarantee
              </p>
              <p className="text-xs text-dark-400 mt-2">
                After payment, you'll be redirected back to Bondly automatically
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-dark-300">Everything in Free</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-dark-300">Custom display names</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-dark-300">Gender filtering</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-dark-300">Priority matching</span>
              </div>

            </div>
          </div>
        </div>

        {/* Feature Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
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
              </div>
            </div>
          ))}
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
