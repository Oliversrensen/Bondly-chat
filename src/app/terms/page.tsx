import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service - Bondly Anonymous Chat App",
  description: "Read Bondly's terms of service. Understand the rules and guidelines for using our anonymous chat platform to chat with strangers safely.",
  keywords: [
    "bondly terms of service",
    "anonymous chat terms",
    "chat app terms",
    "stranger chat rules",
    "bondly user agreement",
    "anonymous messaging terms",
    "chat platform terms",
    "bondly guidelines"
  ],
  openGraph: {
    title: "Terms of Service - Bondly Anonymous Chat App",
    description: "Read Bondly's terms of service. Understand the rules and guidelines for using our anonymous chat platform.",
    url: "https://bondly.chat/terms",
    type: "website",
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Terms of Service
                </span>
              </h1>
              <p className="text-dark-300">
                Please read these terms carefully before using Bondly
              </p>
            </div>

            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-semibold text-primary-400 mb-4">Acceptance of Terms</h2>
              <p className="text-dark-300 mb-4">
                By using Bondly's anonymous chat services, you agree to be bound by these terms of service. 
                If you do not agree to these terms, please do not use our platform.
              </p>

              <h2 className="text-2xl font-semibold text-primary-400 mb-4">Use of Service</h2>
              <p className="text-dark-300 mb-4">
                Bondly provides anonymous chat services for connecting with strangers. Users must be at least 
                18 years old and agree to use the service responsibly and respectfully.
              </p>

              <h2 className="text-2xl font-semibold text-primary-400 mb-4">Prohibited Activities</h2>
              <p className="text-dark-300 mb-4">
                Users may not engage in harassment, spam, illegal activities, or share inappropriate content 
                while using our anonymous chat platform. Violations may result in account suspension.
              </p>

              <h2 className="text-2xl font-semibold text-primary-400 mb-4">Limitation of Liability</h2>
              <p className="text-dark-300 mb-4">
                Bondly provides its anonymous chat services "as is" and is not liable for any damages 
                resulting from the use of our platform or interactions with other users.
              </p>

              <h2 className="text-2xl font-semibold text-primary-400 mb-4">Contact Information</h2>
              <p className="text-dark-300">
                For questions about these terms, please contact us at support@bondly.chat or through 
                our support page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}