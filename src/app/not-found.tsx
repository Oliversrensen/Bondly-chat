import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Page Not Found - Bondly Anonymous Chat App",
  description: "The page you're looking for doesn't exist. Return to Bondly's anonymous chat platform to start chatting with strangers safely.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <img 
            src="/logo.svg" 
            alt="Bondly - Anonymous Chat App Logo" 
            className="h-24 w-24 mx-auto mb-6" 
            width="96"
            height="96"
          />
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <h2 className="text-2xl font-semibold text-primary-400 mb-4">
            Page Not Found
          </h2>
          <p className="text-dark-300 text-lg mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist. Don't worry, you can still start 
            anonymous chatting with strangers on Bondly.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="btn btn-primary px-8 py-4 text-lg font-semibold"
          >
            Go to Homepage
          </Link>
          <Link 
            href="/chat" 
            className="btn btn-secondary px-8 py-4 text-lg font-semibold"
          >
            Start Anonymous Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
