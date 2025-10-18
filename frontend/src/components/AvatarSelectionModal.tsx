'use client';

import { useState, useEffect } from 'react';
import { getAvatarPreviewUrl, getCategoryEmoji, getCategoryColor, Avatar } from '@/utils/avatar';

interface AvatarSelectionModalProps {
  onSelect: (avatarId: string) => void;
  onClose?: () => void;
  isFirstTime?: boolean;
  accessToken?: string;
}

export default function AvatarSelectionModal({ 
  onSelect, 
  onClose,
  isFirstTime = false,
  accessToken
}: AvatarSelectionModalProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      // No auth needed for list endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/avatars/list`);
      if (!response.ok) {
        throw new Error('Failed to fetch avatars');
      }
      const data = await response.json();
      setAvatars(data.avatars || []);
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
      // Set some default avatars as fallback
      setAvatars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedAvatar) return;
    
    if (!accessToken) {
      console.error('No access token available');
      alert('Authentication error. Please refresh the page and try again.');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ avatar_id: selectedAvatar })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save avatar:', response.status, errorData);
        throw new Error(errorData.detail || 'Failed to save avatar');
      }

      onSelect(selectedAvatar);
    } catch (error) {
      console.error('Failed to save avatar:', error);
      alert('Failed to save avatar. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredAvatars = avatars.filter(avatar => {
    const genderMatch = filterGender === 'all' || avatar.gender === filterGender;
    const categoryMatch = filterCategory === 'all' || avatar.category === filterCategory;
    return genderMatch && categoryMatch;
  });

  const categories = Array.from(new Set(avatars.map(a => a.category)));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {isFirstTime ? 'Welcome! Choose Your Avatar' : 'Select Your Avatar'}
              </h2>
              <p className="text-blue-100">
                {isFirstTime 
                  ? 'Pick an avatar that represents your fitness journey!'
                  : 'Change your avatar anytime you want'
                }
              </p>
            </div>
            {!isFirstTime && onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gray-50 border-b flex-shrink-0">
          <div className="flex flex-wrap gap-4">
            {/* Gender Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterGender('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterGender === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterGender('male')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterGender === 'male'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setFilterGender('female')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterGender === 'female'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Female
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterCategory === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                    filterCategory === category
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {getCategoryEmoji(category)} {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredAvatars.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No avatars found with the selected filters
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredAvatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`
                      relative cursor-pointer rounded-xl border-3 transition-all duration-200
                      hover:scale-105 hover:shadow-lg
                      ${selectedAvatar === avatar.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                  {/* Avatar Image */}
                  <div className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden mb-3">
                      <img
                        src={getAvatarPreviewUrl(avatar.id, 200)}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Avatar Info */}
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 mb-1">{avatar.name}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(avatar.category)}`}>
                        {getCategoryEmoji(avatar.category)} {avatar.category}
                      </span>
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {selectedAvatar === avatar.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">
            {selectedAvatar ? (
              <span className="font-medium text-blue-600">
                ✓ Avatar selected
              </span>
            ) : (
              <span>
                Please select an avatar
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            {!isFirstTime && onClose && (
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={!selectedAvatar || saving}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold 
                         disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200
                         hover:scale-105"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                'Confirm Selection'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
