import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile Setup - Customize Your Chat Experience',
  description: 'Set up your profile to personalize your anonymous chat experience. Choose your interests, gender preferences, and display name.',
  keywords: [
    'profile setup',
    'chat profile',
    'user preferences',
    'chat customization',
    'anonymous profile',
    'chat settings',
    'user interests',
    'chat preferences'
  ],
  openGraph: {
    title: 'Profile Setup - Customize Your Chat Experience',
    description: 'Set up your profile to personalize your anonymous chat experience. Choose your interests, gender preferences, and display name.',
    type: 'website',
    url: 'https://bondly.chat/profile',
  },
  twitter: {
    title: 'Profile Setup - Customize Your Chat Experience',
    description: 'Set up your profile to personalize your anonymous chat experience. Choose your interests, gender preferences, and display name.',
  },
  robots: {
    index: false, // Don't index profile pages as they're user-specific
    follow: true,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
