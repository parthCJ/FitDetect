/**
 * Avatar utility functions
 * Generates avatar URLs using DiceBear API
 */

export interface Avatar {
  id: string;
  name: string;
  gender: 'male' | 'female';
  category: 'strength' | 'cardio' | 'flexibility' | 'agility' | 'combat' | 'general';
}

/**
 * Get avatar URL from avatar ID
 * Uses DiceBear API for now, can be replaced with local SVGs later
 */
export function getAvatarUrl(avatarId: string | null | undefined): string {
  if (!avatarId) {
    // Default avatar for users without selection
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=default-user`;
  }
  
  // Use DiceBear API with avataaars style
  // Different styles available: avataaars, bottts, personas, pixel-art, etc.
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarId}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

/**
 * Get initials from name for fallback avatar
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

/**
 * Get avatar preview URL with specific size
 */
export function getAvatarPreviewUrl(avatarId: string, size: number = 200): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarId}&size=${size}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

/**
 * Get category emoji for avatar category
 */
export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    strength: '💪',
    cardio: '🏃',
    flexibility: '🧘',
    agility: '🤸',
    combat: '🥊',
    general: '⭐'
  };
  
  return emojiMap[category] || '🏋️';
}

/**
 * Get category color for avatar category
 */
export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    strength: 'bg-red-100 text-red-600',
    cardio: 'bg-blue-100 text-blue-600',
    flexibility: 'bg-purple-100 text-purple-600',
    agility: 'bg-green-100 text-green-600',
    combat: 'bg-orange-100 text-orange-600',
    general: 'bg-gray-100 text-gray-600'
  };
  
  return colorMap[category] || 'bg-gray-100 text-gray-600';
}
