import React from 'react';
import '../../styles/badge.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = ''
}) => {
  return (
    <span className={`ui-badge ui-badge-${variant} ui-badge-${size} ${className}`}>
      {children}
    </span>
  );
};
