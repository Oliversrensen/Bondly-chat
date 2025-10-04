// Avatar generator for free users - creates random silly faces
export interface AvatarConfig {
  eyes: string[];
  mouths: string[];
  colors: string[];
}

export const AVATAR_CONFIG: AvatarConfig = {
  eyes: ['👀', '😊', '😎', '🤪', '😍', '🥺', '😏', '🤔', '😴', '😮'],
  mouths: ['😋', '😜', '🤤', '😬', '😑', '😤', '😯', '😵', '🤯', '😱'],
  colors: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ]
};

export function generateRandomAvatar(): {
  emoji: string;
  backgroundColor: string;
  id: string;
} {
  const randomEyes = AVATAR_CONFIG.eyes[Math.floor(Math.random() * AVATAR_CONFIG.eyes.length)];
  const randomMouth = AVATAR_CONFIG.mouths[Math.floor(Math.random() * AVATAR_CONFIG.mouths.length)];
  const randomColor = AVATAR_CONFIG.colors[Math.floor(Math.random() * AVATAR_CONFIG.colors.length)];
  
  // Create a unique ID for this avatar combination
  const id = `${randomEyes}-${randomMouth}-${randomColor.slice(1)}`;
  
  return {
    emoji: `${randomEyes}${randomMouth}`,
    backgroundColor: randomColor,
    id
  };
}

export function getAvatarForUser(user: {
  profilePicture?: string | null;
  profilePictureType?: string | null;
  generatedAvatar?: string | null;
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
  
  // If user has a generated avatar stored
  if (user.generatedAvatar) {
    try {
      const avatarData = JSON.parse(user.generatedAvatar);
      return {
        type: 'generated',
        src: `data:image/svg+xml;base64,${avatarData.svg}`,
        alt: 'Generated avatar'
      };
    } catch {
      // Fallback to generating new one
    }
  }
  
  // Generate new avatar for free users or if no avatar exists
  const avatar = generateRandomAvatar();
  const svg = createAvatarSVG(avatar.emoji, avatar.backgroundColor);
  
  return {
    type: 'generated',
    src: `data:image/svg+xml;base64,${btoa(svg)}`,
    alt: 'Generated avatar'
  };
}

function createAvatarSVG(emoji: string, backgroundColor: string): string {
  return `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="${backgroundColor}"/>
      <text x="32" y="40" text-anchor="middle" font-size="24" font-family="Arial, sans-serif">${emoji}</text>
    </svg>
  `.trim();
}

export function generateAvatarData(): string {
  const avatar = generateRandomAvatar();
  const svg = createAvatarSVG(avatar.emoji, avatar.backgroundColor);
  return JSON.stringify({
    emoji: avatar.emoji,
    backgroundColor: avatar.backgroundColor,
    svg: btoa(svg),
    id: avatar.id
  });
}
