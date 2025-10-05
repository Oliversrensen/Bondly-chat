import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Anonymous Chat - Start Chatting with Strangers | Bondly",
  description: "Start anonymous conversations with strangers instantly. Join random chat rooms or connect based on shared interests. Safe, secure, and anonymous chat platform.",
  keywords: [
    "anonymous chat room",
    "chat with strangers instantly",
    "random chat app",
    "anonymous messaging",
    "stranger chat platform",
    "instant chat",
    "chat anonymously",
    "bondly chat room",
    "online chat with strangers",
    "anonymous conversation"
  ],
  openGraph: {
    title: "Anonymous Chat - Start Chatting with Strangers | Bondly",
    description: "Start anonymous conversations with strangers instantly. Join random chat rooms or connect based on shared interests.",
    url: "https://bondly.chat/chat",
    type: "website",
  },
  twitter: {
    title: "Anonymous Chat - Start Chatting with Strangers | Bondly",
    description: "Start anonymous conversations with strangers instantly. Join random chat rooms or connect based on shared interests.",
  },
  alternates: {
    canonical: "https://bondly.chat/chat",
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}