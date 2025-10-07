import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
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
    <div className="min-h-screen">
      {/* Error Message */}
      {searchParams.error === 'admin_required' && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 text-center">
          <div className="max-w-4xl mx-auto">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Admin access required. Only administrators can access the admin dashboard.
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 animate-fade-in-up">
            {/* Logo */}
            <div className="relative inline-block">
              <img 
                src="/logo.svg" 
                alt="Bondly - Anonymous Chat App Logo - Chat with Strangers Safely" 
                className="h-24 w-24 mx-auto mb-6 animate-bounce-gentle" 
                width="96"
                height="96"
              />
              <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse-glow"></div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block">Make</span>
                <span className="block bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  New Friends
                </span>
                <span className="block">Build</span>
                <span className="block bg-gradient-to-r from-secondary-400 to-secondary-600 bg-clip-text text-transparent">
                  Real Bonds
                </span>
              </h1>
              
              <p className="text-xl text-dark-300 max-w-3xl mx-auto leading-relaxed">
                Connect with amazing people, start meaningful conversations, 
                and create friendships that last. Safe, simple, and real.
              </p>
            </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                  {session ? (
                    <>
                      <a 
                        href="/chat" 
                        className="btn btn-primary px-8 py-4 text-lg font-semibold group relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Start Chatting
                        </span>
                      </a>
                      
                      {!isPro && (
                        <a 
                          href="/pro" 
                          className="btn btn-ghost px-8 py-4 text-lg font-semibold group"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Go Pro
                          </span>
                        </a>
                      )}
                      
                      {isPro && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/30 rounded-xl">
                          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="text-primary-400 font-semibold">Pro Member</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Guest Mode Button - Primary CTA */}
                      <a 
                        href="/guest-chat" 
                        className="btn btn-primary px-8 py-4 text-lg font-semibold group relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Try Free Now
                        </span>
                      </a>
                      
                      <a 
                        href="/auth" 
                        className="btn btn-ghost px-8 py-4 text-lg font-semibold group"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Sign Up for More
                        </span>
                      </a>
                    </>
                  )}
                </div>

                {/* Guest Mode Benefits */}
                {!session && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>No signup required • Start chatting instantly • 100% anonymous</span>
                    </div>
                  </div>
                )}

            {/* How It Works - Visual Steps */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                    How It Works
                  </span>
                </h3>
                <p className="text-dark-300">Simple, secure, and anonymous in 3 easy steps</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative">
                  <div className="card card-elevated group hover:card-glow transition-all duration-300 h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Sign in with Google</h4>
                      <p className="text-sm text-dark-300">Quick, secure, and completely anonymous</p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="card card-elevated group hover:card-glow transition-all duration-300 h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Get matched instantly</h4>
                      <p className="text-sm text-dark-300">Connect with people who share your interests</p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <div className="card card-elevated group hover:card-glow transition-all duration-300 h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Chat safely & privately</h4>
                      <p className="text-sm text-dark-300">Your conversations are secure and anonymous</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Security badges */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-dark-400">
                <span className="flex items-center gap-2 px-4 py-2 bg-dark-800/30 rounded-full border border-dark-700">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  End-to-end encrypted
                </span>
                <span className="flex items-center gap-2 px-4 py-2 bg-dark-800/30 rounded-full border border-dark-700">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  No data stored
                </span>
                <span className="flex items-center gap-2 px-4 py-2 bg-dark-800/30 rounded-full border border-dark-700">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Truly anonymous
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Try Demo Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary-500/5 to-secondary-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Try It Now
            </span>
          </h2>
          <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
            Experience the magic of anonymous chat. See how easy it is to connect with amazing people.
          </p>
          
          {/* Chat Interface Preview */}
          <div className="card card-glow max-w-lg mx-auto mb-8 overflow-hidden">
            <div className="bg-dark-800/50 p-4 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-400">Connected</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-6 h-6 bg-dark-700 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="w-6 h-6 bg-dark-700 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-3 min-h-[200px]">
              <div className="flex justify-start">
                <div className="max-w-xs">
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl px-3 py-2">
                    <p className="text-white text-sm">Hey! What brings you here today?</p>
                  </div>
                  <p className="text-xs text-dark-500 mt-1 ml-1">Anonymous • 2:34 PM</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="max-w-xs">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl px-3 py-2">
                    <p className="text-white text-sm">Looking to meet interesting people!</p>
                  </div>
                  <p className="text-xs text-dark-500 mt-1 mr-1 text-right">You • 2:35 PM</p>
                </div>
              </div>
              
              <div className="flex justify-start">
                <div className="max-w-xs">
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl px-3 py-2">
                    <p className="text-white text-sm">Same here! What are you passionate about?</p>
                  </div>
                  <p className="text-xs text-dark-500 mt-1 ml-1">Anonymous • 2:36 PM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <span>Anonymous is typing...</span>
              </div>
            </div>
            
            <div className="p-4 border-t border-dark-700">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 bg-dark-800/50 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 placeholder-dark-400"
                  disabled
                />
                <button className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth" 
              className="btn btn-primary px-8 py-4 text-lg font-semibold group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Chatting Now
              </span>
            </a>
            
            <a 
              href="#features" 
              className="btn btn-ghost px-8 py-4 text-lg font-semibold group"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Learn More
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">Bondly</span> Anonymous Chat?
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              The best anonymous chat app for meeting strangers and making friends safely. 
              Experience secure, meaningful conversations with our innovative chat platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card card-elevated group hover:card-glow transition-all duration-300 animate-slide-in-left">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary-400">Anonymous Chat with Strangers</h3>
                <p className="text-dark-300">
                  Start anonymous conversations instantly. Every chat is a chance to meet new people, 
                  make friends, and discover meaningful connections safely.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card card-elevated group hover:card-glow transition-all duration-300 animate-slide-in-up">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-400">Interest-Based Chat Matching</h3>
                <p className="text-dark-300">
                  Connect with strangers who share your interests. Our smart matching algorithm helps you 
                  find people with common passions for better conversations.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card card-elevated group hover:card-glow transition-all duration-300 animate-slide-in-right">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-accent-400">Safe Anonymous Messaging</h3>
                <p className="text-dark-300">
                  Chat anonymously with complete privacy protection. Build genuine relationships 
                  through safe, secure messaging with our advanced moderation system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-16 px-6 bg-dark-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Your <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">Privacy</span> Matters
            </h2>
            <p className="text-lg text-dark-300">Built with security and anonymity at its core</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="card card-elevated text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">End-to-End Encrypted</h3>
              <p className="text-sm text-dark-400">Your messages are protected with military-grade encryption</p>
            </div>
            
            <div className="card card-elevated text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Data Stored</h3>
              <p className="text-sm text-dark-400">Messages are deleted after your chat ends</p>
            </div>
            
            <div className="card card-elevated text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Truly Anonymous</h3>
              <p className="text-sm text-dark-400">No personal information required or collected</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-dark-400">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Google OAuth Only
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No Phone Numbers
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No Email Required
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Messages Auto-Delete
            </span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card card-glow animate-scale-in">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">
                Ready to Start Anonymous Chatting?
              </h2>
              <p className="text-xl text-dark-300">
                Join thousands of users who trust Bondly for safe anonymous chat with strangers. 
                Start making meaningful connections today with our secure chat platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {session ? (
                  <>
                    <a href="/chat" className="btn btn-primary px-8 py-4 text-lg">
                      Start Chatting
                    </a>
                    <a href="/profile" className="btn btn-ghost px-8 py-4 text-lg">
                      Manage Profile
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/auth" className="btn btn-primary px-8 py-4 text-lg">
                      Start Chatting Free
                    </a>
                    <a href="/profile" className="btn btn-ghost px-8 py-4 text-lg">
                      Manage Profile
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
