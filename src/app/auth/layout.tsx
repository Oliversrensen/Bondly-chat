import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sign In to Bondly - Start Anonymous Chatting | Login",
  description: "Sign in to Bondly and start anonymous chatting with strangers. Quick and secure Google sign-in. Join thousands of users making meaningful connections.",
  keywords: [
    "bondly login",
    "sign in bondly",
    "anonymous chat login",
    "bondly account",
    "google sign in",
    "chat app login",
    "bondly authentication",
    "anonymous chat sign up",
    "bondly registration"
  ],
  openGraph: {
    title: "Sign In to Bondly - Start Anonymous Chatting | Login",
    description: "Sign in to Bondly and start anonymous chatting with strangers. Quick and secure Google sign-in.",
    url: "https://bondly.chat/auth",
    type: "website",
  },
  twitter: {
    title: "Sign In to Bondly - Start Anonymous Chatting | Login",
    description: "Sign in to Bondly and start anonymous chatting with strangers. Quick and secure Google sign-in.",
  },
  alternates: {
    canonical: "https://bondly.chat/auth",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
