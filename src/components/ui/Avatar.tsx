import React from 'react';
import '../../styles/avatar.css';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  imageUrl?: string;
  roleBadge?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  imageUrl,
  roleBadge
}) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`ui-avatar-container ui-avatar-${size}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="ui-avatar-img" />
      ) : (
        <div className="ui-avatar-initials" aria-label={name}>
          {initials}
        </div>
      )}
      {roleBadge && <span className="ui-avatar-badge" title={roleBadge} />}
    </div>
  );
};
