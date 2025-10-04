'use client';

import { useState } from 'react';
import { getAvatarForUser } from '@/lib/avatarGenerator';

interface ProfilePictureProps {
  user: {
    profilePicture?: string | null;
    profilePictureType?: string | null;
    generatedAvatar?: string | null;
    selectedAvatarId?: string | null;
    isPro?: boolean;
    sillyName?: string | null;
    name?: string | null;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showProBadge?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl'
};

export default function ProfilePicture({ 
  user, 
  size = 'md', 
  className = '',
  showProBadge = false 
}: ProfilePictureProps) {
  const [imageError, setImageError] = useState(false);
  
  const avatar = getAvatarForUser(user);
  const sizeClass = sizeClasses[size];
  
  return (
    <div className={`relative ${className}`}>
      {avatar.type === 'uploaded' && !imageError ? (
        <img
          src={avatar.src}
          alt={avatar.alt}
          className={`${sizeClass} rounded-full object-cover border-2 border-white/20 shadow-lg`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div 
          className={`${sizeClass} rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg`}
          style={{
            backgroundImage: avatar.type === 'generated' ? `url(${avatar.src})` : undefined,
            backgroundColor: avatar.type === 'generated' ? undefined : '#6366f1'
          }}
        >
          {avatar.type === 'generated' ? (
            <span className="text-white font-bold">
              {user.sillyName?.charAt(0).toUpperCase() || '?'}
            </span>
          ) : (
            <span className="text-white font-bold">
              {user.sillyName?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>
      )}
      
      {showProBadge && user.isPro && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-white text-xs font-bold">★</span>
        </div>
      )}
    </div>
  );
}
