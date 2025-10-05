import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Support - Get Help with Bondly Anonymous Chat App",
  description: "Get support for Bondly anonymous chat app. Find help with chat issues, account problems, and learn how to use our anonymous chat platform safely.",
  keywords: [
    "bondly support",
    "anonymous chat help",
    "chat app support",
    "bondly customer service",
    "stranger chat help",
    "anonymous messaging support",
    "chat platform help",
    "bondly troubleshooting"
  ],
  openGraph: {
    title: "Support - Get Help with Bondly Anonymous Chat App",
    description: "Get support for Bondly anonymous chat app. Find help with chat issues and learn how to use our platform safely.",
    url: "https://bondly.chat/support",
    type: "website",
  },
  alternates: {
    canonical: "https://bondly.chat/support",
  },
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Support Center
                </span>
              </h1>
              <p className="text-dark-300">
                Get help with Bondly's anonymous chat platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card card-elevated">
                <h2 className="text-xl font-semibold text-primary-400 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-secondary-400 mb-2">How do I start anonymous chat?</h3>
                    <p className="text-dark-300 text-sm">Simply click "Start Chatting" and you'll be matched with a stranger for anonymous conversation.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-400 mb-2">Is Bondly really anonymous?</h3>
                    <p className="text-dark-300 text-sm">Yes, we protect your privacy and don't store your personal information or chat history.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-400 mb-2">How do I report inappropriate behavior?</h3>
                    <p className="text-dark-300 text-sm">Use the report button during any chat to flag inappropriate content or behavior.</p>
                  </div>
                </div>
              </div>

              <div className="card card-elevated">
                <h2 className="text-xl font-semibold text-primary-400 mb-4">Contact Support</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-secondary-400 mb-2">Email Support</h3>
                    <p className="text-dark-300 text-sm">support@bondly.chat</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-400 mb-2">Response Time</h3>
                    <p className="text-dark-300 text-sm">We typically respond within 24 hours</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-400 mb-2">Common Issues</h3>
                    <p className="text-dark-300 text-sm">Chat not loading, matching problems, account issues</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-elevated">
              <h2 className="text-xl font-semibold text-primary-400 mb-4">Safety Tips for Anonymous Chat</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-secondary-400 mb-2">Stay Anonymous</h3>
                  <p className="text-dark-300 text-sm">Never share personal information like your real name, address, or phone number.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-400 mb-2">Report Issues</h3>
                  <p className="text-dark-300 text-sm">Use the report feature if someone makes you uncomfortable or violates our terms.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-400 mb-2">Trust Your Instincts</h3>
                  <p className="text-dark-300 text-sm">If something feels wrong, end the chat and find someone else to talk to.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-400 mb-2">Have Fun Safely</h3>
                  <p className="text-dark-300 text-sm">Enjoy meeting new people while keeping your safety and privacy as top priorities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}