import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anonymous Chat Room - Start Chatting Now',
  description: 'Join our anonymous chat room and start conversations with strangers. Safe, secure, and completely anonymous chat experience.',
  keywords: [
    'anonymous chat room',
    'live chat',
    'stranger chat',
    'online chat room',
    'random chat',
    'instant messaging',
    'chat with strangers',
    'anonymous messaging'
  ],
  openGraph: {
    title: 'Anonymous Chat Room - Start Chatting Now',
    description: 'Join our anonymous chat room and start conversations with strangers. Safe, secure, and completely anonymous chat experience.',
    type: 'website',
    url: 'https://bondly.chat/chat',
  },
  twitter: {
    title: 'Anonymous Chat Room - Start Chatting Now',
    description: 'Join our anonymous chat room and start conversations with strangers. Safe, secure, and completely anonymous chat experience.',
  },
  robots: {
    index: false, // Don't index chat pages as they're dynamic
    follow: true,
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
