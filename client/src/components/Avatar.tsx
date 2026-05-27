import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AIVA_AVATAR } from '../constants';

interface AvatarProps {
  size?: number;
  dark: boolean;
}

export const Avatar = ({ size = 32, dark }: AvatarProps) => {
  const [imgError, setImgError] = useState(false);
  const radius = Math.round(size * 0.28);

  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius,
        overflow: 'hidden', flexShrink: 0,
        border: `1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}`,
      }}
    >
      {!imgError ? (
        <img
          src={AIVA_AVATAR}
          onError={() => setImgError(true)}
          alt="Aiva"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: dark ? '#1a1a28' : '#f0eede',
        }}>
          <Sparkles size={size * 0.38} style={{ color: '#c9a96e' }} />
        </div>
      )}
    </div>
  );
};