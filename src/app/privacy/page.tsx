import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Bondly Privacy Policy - How we protect your data and privacy in our anonymous chat platform.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card card-elevated">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
            <p className="text-sm text-dark-400 mb-8 text-center">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="prose prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">1. Information We Collect</h2>
                <p className="text-dark-300 leading-relaxed">
                  Bondly is designed to be anonymous. We collect minimal information necessary to provide our service:
                </p>
                <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                  <li>Google account information (name, email) for authentication only</li>
                  <li>Profile information you choose to share (interests, display name)</li>
                  <li>Chat messages for moderation and safety purposes</li>
                  <li>Basic usage analytics to improve our service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">2. How We Use Your Information</h2>
                <p className="text-dark-300 leading-relaxed">
                  We use your information solely to:
                </p>
                <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                  <li>Provide and maintain our chat service</li>
                  <li>Match you with compatible users based on interests</li>
                  <li>Moderate content and ensure safety</li>
                  <li>Improve our platform and user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">3. Data Protection</h2>
                <p className="text-dark-300 leading-relaxed">
                  Your privacy is our priority. We implement industry-standard security measures:
                </p>
                <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                  <li>End-to-end encryption for all messages</li>
                  <li>Secure data storage with encryption at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal data by authorized personnel only</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">4. Data Sharing</h2>
                <p className="text-dark-300 leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. We may share data only:
                </p>
                <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements</li>
                  <li>To protect our rights and prevent harm</li>
                  <li>With trusted service providers under strict confidentiality agreements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">5. Your Rights</h2>
                <p className="text-dark-300 leading-relaxed">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                  <li>Opt out of certain data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">6. Contact Us</h2>
                <p className="text-dark-300 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-dark-300 leading-relaxed mt-2">
                  Email: privacy@bondly.chat
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
