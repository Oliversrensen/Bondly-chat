'use client';

import { useState } from 'react';
import { AVATAR_PRESETS, AvatarPreset } from '@/lib/avatarGenerator';

interface AvatarSelectorProps {
  selectedAvatarId?: string | null;
  onSelect: (avatarId: string) => void;
  className?: string;
}

export default function AvatarSelector({ 
  selectedAvatarId, 
  onSelect, 
  className = '' 
}: AvatarSelectorProps) {
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  const createAvatarSVG = (preset: AvatarPreset, size: number = 64) => {
    const scale = size / 64;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="32" fill="${preset.color}"/>
        ${preset.svg}
      </svg>
    `.trim();
  };

  return (
    <div className={`grid grid-cols-5 gap-4 ${className}`}>
      {AVATAR_PRESETS.map((preset) => {
        const isSelected = selectedAvatarId === preset.id;
        const isHovered = hoveredAvatar === preset.id;
        
        return (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            onMouseEnter={() => setHoveredAvatar(preset.id)}
            onMouseLeave={() => setHoveredAvatar(null)}
            className={`
              relative w-16 h-16 rounded-2xl border-2 transition-all duration-300 hover:scale-110
              ${isSelected 
                ? 'border-blue-500 bg-blue-500/20 shadow-lg' 
                : 'border-white/20 hover:border-white/40'
              }
              ${isHovered ? 'shadow-xl' : ''}
            `}
            title={preset.name}
          >
            <div 
              className="w-full h-full rounded-xl overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: createAvatarSVG(preset, 64)
              }}
            />
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
