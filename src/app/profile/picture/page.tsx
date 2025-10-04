'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import ProfilePicture from '@/components/ProfilePicture';
import { ArrowLeft, Upload, Trash2, Star } from 'lucide-react';

export default function ProfilePicturePage() {
  const { data: session, update } = useSession();
  const { addToast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Please sign in</div>
      </div>
    );
  }

  const user = session.user as any; // Type assertion for now

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user.isPro) {
      addToast({
        type: 'error',
        title: 'Pro Feature',
        message: 'Profile picture upload is only available for pro users'
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Profile picture updated successfully!'
        });
        // Refresh session to get updated user data
        await update();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Error',
          message: error.error || 'Failed to upload profile picture'
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload profile picture'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!user.isPro) return;

    try {
      const response = await fetch('/api/profile/picture', {
        method: 'DELETE'
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Profile picture removed successfully!'
        });
        await update();
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to remove profile picture'
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove profile picture'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-300 group"
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <h1 className="text-white font-bold text-2xl">Profile Picture</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* Current Profile Picture */}
          <div className="text-center mb-8">
            <ProfilePicture 
              user={user} 
              size="xl" 
              showProBadge={user.isPro}
              className="mx-auto mb-4"
            />
            <h2 className="text-white text-xl font-semibold mb-2">
              {user.sillyName || user.name || 'Anonymous'}
            </h2>
            {user.isPro ? (
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Pro Member</span>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                Free Member - Random avatar
              </div>
            )}
          </div>

          {/* Upload Section */}
          {user.isPro ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-white text-lg font-semibold mb-4">
                  Upload New Profile Picture
                </h3>
                <p className="text-gray-300 text-sm mb-6">
                  Upload a custom profile picture (max 5MB, JPG/PNG/GIF)
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </button>
                  
                  {user.profilePicture && user.profilePictureType === 'uploaded' && (
                    <button
                      onClick={handleRemovePicture}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Remove Picture
                    </button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">
                  Upgrade to Pro
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Upload custom profile pictures and unlock more features
                </p>
                <button
                  onClick={() => router.push('/pro')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
