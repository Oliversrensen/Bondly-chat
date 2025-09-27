"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { track } from '@vercel/analytics';

export default function ProfilePage() {
  const [gender, setGender] = useState("Undisclosed");
  const [selected, setSelected] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [sillyName, setSillyName] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load profile
  useEffect(() => {
    (async () => {
      const me = await fetch("/api/me").then((r) => r.json());
      if (me?.gender) setGender(me.gender);
      if (Array.isArray(me?.interests)) setSelected(me.interests);
      if (me?.sillyName) setSillyName(me.sillyName);
      if (me?.isPro) setIsPro(true);
    })();
  }, []);

  function normalizeTag(raw: string): string | null {
    const tag = raw.trim().toLowerCase();
    if (tag.length < 2 || tag.length > 32) return null;
    return tag.replace(/\s+/g, " ").replace(/[^a-z0-9 -]/g, "");
  }

  function addTag(tag: string) {
    const norm = normalizeTag(tag);
    if (!norm) return;
    if (selected.includes(norm)) return;
    setSelected((prev) => [...prev, norm]);
    setNewTag("");
  }

  function removeTag(tag: string) {
    setSelected((prev) => prev.filter((t) => t !== tag));
  }

  async function save() {
    setSaving(true);
    const body: any = { gender, interests: selected };
    if (isPro) body.sillyName = sillyName;

    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      alert(`Save failed (${res.status}): ${txt}`);
      setSaving(false);
      return;
    }
    
    // Show success animation
    const successBtn = document.querySelector('.save-btn');
    if (successBtn) {
      successBtn.classList.add('animate-scale-in');
      setTimeout(() => successBtn.classList.remove('animate-scale-in'), 200);
    }
    
    // Track profile update
    track('profile_updated', { 
      gender, 
      interestCount: selected.length, 
      hasSillyName: !!sillyName,
      isPro 
    });
    
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Your Profile
            </span>
          </h1>
          <p className="text-dark-300 text-lg">
            Manage your profile settings and preferences to enhance your chat experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Display Name Card */}
            <div className="card card-elevated">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-400">Display Name</h3>
                  <p className="text-sm text-dark-400">How others will see you in chat</p>
                </div>
              </div>
              
              <div className="input-group">
                <input
                  className="input w-full"
                  value={sillyName}
                  onChange={(e) => setSillyName(e.target.value)}
                  disabled={!isPro}
                  placeholder="Enter your display name..."
                />
                {!isPro && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-secondary-500/10 to-secondary-600/10 border border-secondary-500/20 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-secondary-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>Upgrade to Pro to customize your display name!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gender Selection Card */}
            <div className="card card-elevated">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">⚧</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-400">Gender</h3>
                  <p className="text-sm text-dark-400">Help us match you with compatible people</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "Male", icon: "♂", color: "from-blue-500 to-blue-600" },
                  { value: "Female", icon: "♀", color: "from-pink-500 to-pink-600" },
                  { value: "Undisclosed", icon: "?", color: "from-gray-500 to-gray-600" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setGender(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      gender === option.value
                        ? `border-primary-500 bg-primary-500/10 text-primary-400`
                        : `border-dark-600 bg-dark-800/50 text-dark-300 hover:border-primary-500/50 hover:bg-primary-500/5`
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center text-white text-xl font-bold`}>
                      {option.icon}
                    </div>
                    <div className="text-sm font-medium">{option.value}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interests Card */}
            <div className="card card-elevated">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-accent-400">Interests</h3>
                  <p className="text-sm text-dark-400">Add topics you're passionate about</p>
                </div>
              </div>
              
              <div className="input-group">
                <input
                  className="input w-full"
                  placeholder="Type an interest and press Enter..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(newTag);
                    }
                  }}
                />
                <p className="text-xs text-dark-500 mt-2">
                  Press Enter or comma to add interests
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {selected.map((tag) => (
                  <span
                    key={tag}
                    className="interest-tag"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="interest-tag-remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pro Status Card */}
            <div className="card card-glow">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isPro ? "Pro Member" : "Free Account"}
                </h3>
                <p className="text-sm text-dark-400 mb-4">
                  {isPro 
                    ? "You have access to all Pro features" 
                    : "Upgrade to unlock Pro features"
                  }
                </p>
                {!isPro && (
                  <a href="/pro" className="btn btn-primary w-full">
                    Upgrade to Pro
                  </a>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="card">
              <button 
                className="btn btn-success w-full save-btn" 
                onClick={save}
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Profile
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
