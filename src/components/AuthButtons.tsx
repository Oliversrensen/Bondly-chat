"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <span className="px-3 py-1.5 rounded-lg text-sm text-gray-400 border border-gray-800">
        Loading…
      </span>
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("google", { callbackUrl: "/chat" })}
        className="btn-ghost px-3 py-1.5 rounded-lg text-sm hover:border-pastelBlue hover:text-pastelBlue transition"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 hidden sm:inline">
        {session.user?.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="btn-ghost px-3 py-1.5 rounded-lg text-sm hover:border-pastelPink hover:text-pastelPink transition"
      >
        Sign out
      </button>
    </div>
  );
}
