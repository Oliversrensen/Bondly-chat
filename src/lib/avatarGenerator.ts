// Avatar generator with preset vector faces
export interface AvatarPreset {
  id: string;
  name: string;
  svg: string;
  color: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'happy',
    name: 'Happy',
    svg: `<circle cx="24" cy="24" r="2" fill="#2D3748"/><circle cx="40" cy="24" r="2" fill="#2D3748"/><path d="M20 36 Q32 44 44 36" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    color: '#FF6B6B'
  },
  {
    id: 'wink',
    name: 'Wink',
    svg: `<circle cx="24" cy="24" r="2" fill="#2D3748"/><path d="M38 24 Q42 24 42 28 Q42 32 38 32" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 36 Q32 44 44 36" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    color: '#4ECDC4'
  },
  {
    id: 'cool',
    name: 'Cool',
    svg: `<circle cx="24" cy="24" r="2" fill="#2D3748"/><circle cx="40" cy="24" r="2" fill="#2D3748"/><path d="M20 32 Q32 40 44 32" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    color: '#45B7D1'
  },
  {
    id: 'surprised',
    name: 'Surprised',
    svg: `<circle cx="24" cy="24" r="3" fill="#2D3748"/><circle cx="40" cy="24" r="3" fill="#2D3748"/><circle cx="32" cy="40" r="2" fill="#2D3748"/>`,
    color: '#96CEB4'
  },
  {
    id: 'sleepy',
    name: 'Sleepy',
    svg: `<path d="M22 24 Q24 26 26 24" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M38 24 Q40 26 42 24" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 36 Q32 42 44 36" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    color: '#FFEAA7'
  },
  {
    id: 'laughing',
    name: 'Laughing',
    svg: `<circle cx="24" cy="24" r="2" fill="#2D3748"/><circle cx="40" cy="24" r="2" fill="#2D3748"/><path d="M20 36 Q32 48 44 36" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    color: '#DDA0DD'
  },
  {
    id: 'thinking',
    name: 'Thinking',
    svg: `<circle cx="24" cy="24" r="2" fill="#2D3748"/><circle cx="40" cy="24" r="2" fill="#2D3748"/><path d="M20 36 Q32 42 44 36" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="46" cy="46" r="1.5" fill="#2D3748"/>`,
    color: '#98D8C8'
  },
  {
    id: 'excited',
    name: 'Excited',
    svg: `<circle cx="24" cy="24" r="2" fill="#2D3748"/><circle cx="40" cy="24" r="2" fill="#2D3748"/><path d="M20 36 Q32 44 44 36" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M18 20 Q32 16 46 20" stroke="#2D3748" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    color: '#F7DC6F'
  },
  {
    id: 'neutral',
    name: 'Neutral',
    svg: `<circle cx="24" cy="24" r="2" fill="#2D3748"/><circle cx="40" cy="24" r="2" fill="#2D3748"/><path d="M20 36 Q32 40 44 36" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    color: '#BB8FCE'
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    svg: `<circle cx="24" cy="24" r="2" fill="#2D3748"/><circle cx="40" cy="24" r="2" fill="#2D3748"/><path d="M20 36 Q32 44 44 36" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M18 20 Q32 18 46 20" stroke="#2D3748" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    color: '#85C1E9'
  }
];

export function generateRandomAvatar(): {
  preset: AvatarPreset;
  id: string;
} {
  const randomPreset = AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
  
  return {
    preset: randomPreset,
    id: randomPreset.id
  };
}

export function getAvatarPresetById(id: string): AvatarPreset | null {
  return AVATAR_PRESETS.find(preset => preset.id === id) || null;
}

export function getAvatarForUser(user: {
  profilePicture?: string | null;
  profilePictureType?: string | null;
  generatedAvatar?: string | null;
  selectedAvatarId?: string | null;
  isPro?: boolean;
  sillyName?: string | null;
  name?: string | null;
}): {
  type: 'uploaded' | 'generated';
  src: string;
  alt: string;
} {
  // If user has uploaded a profile picture and is pro
  if (user.isPro && user.profilePicture && user.profilePictureType === 'uploaded') {
    return {
      type: 'uploaded',
      src: user.profilePicture,
      alt: 'Profile picture'
    };
  }
  
  // If user has a selected avatar preset
  if (user.selectedAvatarId) {
    const preset = getAvatarPresetById(user.selectedAvatarId);
    if (preset) {
      const svg = createAvatarSVG(preset);
      return {
        type: 'generated',
        src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        alt: `${preset.name} avatar`
      };
    }
  }
  
  // If user has a generated avatar stored (legacy)
  if (user.generatedAvatar) {
    try {
      const avatarData = JSON.parse(user.generatedAvatar);
      return {
        type: 'generated',
        src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarData.svg)}`,
        alt: 'Generated avatar'
      };
    } catch {
      // Fallback to generating new one
    }
  }
  
  // Generate new random avatar for free users or if no avatar exists
  const avatar = generateRandomAvatar();
  const svg = createAvatarSVG(avatar.preset);
  
  return {
    type: 'generated',
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    alt: `${avatar.preset.name} avatar`
  };
}


function createAvatarSVG(preset: AvatarPreset): string {
  return `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="${preset.color}"/>
      ${preset.svg}
    </svg>
  `.trim();
}

export function generateAvatarData(): string {
  const avatar = generateRandomAvatar();
  const svg = createAvatarSVG(avatar.preset);
  return JSON.stringify({
    presetId: avatar.preset.id,
    presetName: avatar.preset.name,
    color: avatar.preset.color,
    svg: svg,
    id: avatar.id
  });
}
