import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bondly Pro - Premium Anonymous Chat Features | Upgrade Now",
  description: "Unlock premium features with Bondly Pro: custom display names, gender filtering, priority matching, and enhanced security. Upgrade your anonymous chat experience today!",
  keywords: [
    "bondly pro",
    "premium chat features",
    "anonymous chat upgrade",
    "custom display names",
    "gender filtering chat",
    "priority matching",
    "premium chat app",
    "bondly subscription",
    "chat app premium",
    "enhanced chat features"
  ],
  openGraph: {
    title: "Bondly Pro - Premium Anonymous Chat Features | Upgrade Now",
    description: "Unlock premium features with Bondly Pro: custom display names, gender filtering, priority matching, and enhanced security.",
    url: "https://bondly.chat/pro",
    type: "website",
  },
  twitter: {
    title: "Bondly Pro - Premium Anonymous Chat Features | Upgrade Now",
    description: "Unlock premium features with Bondly Pro: custom display names, gender filtering, priority matching, and enhanced security.",
  },
  alternates: {
    canonical: "/pro",
  },
};

export default function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}