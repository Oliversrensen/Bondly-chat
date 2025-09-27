import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bondly Pro - Premium Chat Features',
  description: 'Upgrade to Bondly Pro for premium features including priority matching, advanced filters, and enhanced chat experience.',
  keywords: [
    'bondly pro',
    'premium chat',
    'chat upgrade',
    'priority matching',
    'advanced filters',
    'premium features',
    'chat subscription',
    'pro membership'
  ],
  openGraph: {
    title: 'Bondly Pro - Premium Chat Features',
    description: 'Upgrade to Bondly Pro for premium features including priority matching, advanced filters, and enhanced chat experience.',
    type: 'website',
    url: 'https://bondly.chat/pro',
  },
  twitter: {
    title: 'Bondly Pro - Premium Chat Features',
    description: 'Upgrade to Bondly Pro for premium features including priority matching, advanced filters, and enhanced chat experience.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
