import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy - Bondly Anonymous Chat App",
  description: "Read Bondly's privacy policy. Learn how we protect your anonymity and data when you chat with strangers on our secure anonymous chat platform.",
  keywords: [
    "bondly privacy policy",
    "anonymous chat privacy",
    "chat app privacy",
    "stranger chat privacy",
    "bondly data protection",
    "anonymous messaging privacy",
    "chat platform privacy",
    "bondly security"
  ],
  openGraph: {
    title: "Privacy Policy - Bondly Anonymous Chat App",
    description: "Read Bondly's privacy policy. Learn how we protect your anonymity and data when you chat with strangers.",
    url: "https://bondly.chat/privacy",
    type: "website",
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Privacy Policy
                </span>
              </h1>
              <p className="text-dark-300">
                Your privacy and anonymity are our top priorities at Bondly
              </p>
            </div>

            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-semibold text-primary-400 mb-4">Information We Collect</h2>
              <p className="text-dark-300 mb-4">
                At Bondly, we are committed to protecting your privacy and maintaining your anonymity. 
                We collect minimal information necessary to provide our anonymous chat services.
              </p>

              <h2 className="text-2xl font-semibold text-primary-400 mb-4">How We Use Your Information</h2>
              <p className="text-dark-300 mb-4">
                We use your information solely to provide and improve our anonymous chat platform. 
                Your conversations are not stored permanently, and we do not share your personal data.
              </p>

              <h2 className="text-2xl font-semibold text-primary-400 mb-4">Data Security</h2>
              <p className="text-dark-300 mb-4">
                We implement industry-standard security measures to protect your data and ensure 
                your anonymous chat experience remains secure and private.
              </p>

              <h2 className="text-2xl font-semibold text-primary-400 mb-4">Contact Us</h2>
              <p className="text-dark-300">
                If you have any questions about this privacy policy, please contact us through our 
                support page or email us at privacy@bondly.chat
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}