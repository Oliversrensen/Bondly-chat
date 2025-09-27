import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support & Help Center',
  description: 'Get help with Bondly - Find answers to common questions, safety tips, and contact support.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Support & Help Center</h1>
          <p className="text-xl text-dark-300">Get help with Bondly and stay safe while chatting</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div className="card card-elevated">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6 text-primary-400">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-dark-200">How do I start chatting?</h3>
                  <p className="text-dark-300 text-sm">
                    Click "Start Chatting" and choose between random or interest-based matching. 
                    We'll connect you with someone compatible!
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-dark-200">Is my identity protected?</h3>
                  <p className="text-dark-300 text-sm">
                    Yes! We only use your Google account for authentication. Your real identity 
                    is never shared with other users.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-dark-200">How do I report someone?</h3>
                  <p className="text-dark-300 text-sm">
                    Click the flag icon in the chat interface to report inappropriate behavior. 
                    We review all reports quickly.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-dark-200">Can I block someone?</h3>
                  <p className="text-dark-300 text-sm">
                    Yes, you can end the chat anytime by clicking "Next Chat" or closing the tab. 
                    You won't be matched with them again.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="card card-elevated">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6 text-secondary-400">Safety Tips</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-200">Keep it anonymous</h3>
                    <p className="text-dark-300 text-sm">Never share personal information like your real name, address, or phone number.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-200">Trust your instincts</h3>
                    <p className="text-dark-300 text-sm">If something feels off, end the chat and report the user.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-200">Be respectful</h3>
                    <p className="text-dark-300 text-sm">Treat others with kindness and respect, just like you'd want to be treated.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-200">Report problems</h3>
                    <p className="text-dark-300 text-sm">Help us keep Bondly safe by reporting inappropriate behavior immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="card card-elevated mt-8">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-accent-400">Still Need Help?</h2>
            <p className="text-dark-300 mb-6">
              Can't find what you're looking for? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@bondly.chat" 
                className="btn btn-primary px-6 py-3"
              >
                Email Support
              </a>
              <a 
                href="mailto:feedback@bondly.chat" 
                className="btn btn-ghost px-6 py-3"
              >
                Send Feedback
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
