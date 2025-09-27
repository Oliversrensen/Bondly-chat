import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Bondly Terms of Service - Rules and guidelines for using our anonymous chat platform.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card card-elevated">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
            <p className="text-sm text-dark-400 mb-8 text-center">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="prose prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">1. Acceptance of Terms</h2>
                <p className="text-dark-300 leading-relaxed">
                  By accessing and using Bondly, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">2. Description of Service</h2>
                <p className="text-dark-300 leading-relaxed">
                  Bondly is an anonymous chat platform that connects users for conversations based on shared interests. 
                  Our service facilitates anonymous communication between users in a safe, moderated environment.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">3. User Conduct</h2>
                <p className="text-dark-300 leading-relaxed mb-4">
                  You agree to use Bondly responsibly and in accordance with these terms. Prohibited activities include:
                </p>
                <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                  <li>Harassment, bullying, or threatening behavior</li>
                  <li>Sharing inappropriate, offensive, or illegal content</li>
                  <li>Impersonating others or providing false information</li>
                  <li>Attempting to circumvent our safety measures</li>
                  <li>Spamming or sending unsolicited messages</li>
                  <li>Sharing personal contact information</li>
                  <li>Engaging in commercial activities or solicitation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">4. Safety and Moderation</h2>
                <p className="text-dark-300 leading-relaxed">
                  We actively moderate conversations to maintain a safe environment. We reserve the right to:
                </p>
                <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                  <li>Monitor and review chat content</li>
                  <li>Remove inappropriate messages or users</li>
                  <li>Suspend or terminate accounts for violations</li>
                  <li>Report illegal activity to authorities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">5. Privacy and Anonymity</h2>
                <p className="text-dark-300 leading-relaxed">
                  While we strive to maintain your anonymity, remember that:
                </p>
                <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                  <li>Never share personal information with strangers</li>
                  <li>Be cautious about revealing your identity</li>
                  <li>Report users who ask for personal information</li>
                  <li>Use our reporting system for safety concerns</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">6. Prohibited Content</h2>
                <p className="text-dark-300 leading-relaxed">
                  The following content is strictly prohibited:
                </p>
                <ul className="list-disc list-inside text-dark-300 space-y-2 ml-4">
                  <li>Explicit sexual content or nudity</li>
                  <li>Violence, gore, or disturbing imagery</li>
                  <li>Hate speech or discrimination</li>
                  <li>Illegal activities or substances</li>
                  <li>Spam, scams, or phishing attempts</li>
                  <li>Copyrighted material without permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">7. Account Termination</h2>
                <p className="text-dark-300 leading-relaxed">
                  We may suspend or terminate your account at any time for violations of these terms. 
                  You may also delete your account at any time through your profile settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">8. Limitation of Liability</h2>
                <p className="text-dark-300 leading-relaxed">
                  Bondly is provided "as is" without warranties. We are not liable for any damages arising from 
                  your use of the service, including but not limited to conversations with other users.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">9. Changes to Terms</h2>
                <p className="text-dark-300 leading-relaxed">
                  We reserve the right to modify these terms at any time. Continued use of the service after 
                  changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary-400">10. Contact Information</h2>
                <p className="text-dark-300 leading-relaxed">
                  For questions about these Terms of Service, please contact us at:
                </p>
                <p className="text-dark-300 leading-relaxed mt-2">
                  Email: legal@bondly.chat
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
