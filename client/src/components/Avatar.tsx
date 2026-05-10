import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AIVA_AVATAR } from '../constants';

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface AvatarProps {
  size?: number;
  dark: boolean;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export const Avatar = ({ size = 32, dark }: AvatarProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl overflow-hidden flex-shrink-0 ring-1 shadow-sm ${
        dark ? 'ring-white/10' : 'ring-black/8'
      }`}
    >
      {!imgError ? (
        <img
          src={AIVA_AVATAR}
          onError={() => setImgError(true)}
          alt="Aiva"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${
          dark ? 'bg-blue-900/40' : 'bg-blue-50'
        }`}>
          <Sparkles size={size * 0.4} className="text-blue-400" />
        </div>
      )}
    </div>
  );
};