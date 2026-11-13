import React from 'react';
import '../../styles/iconButton.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'ghost' | 'solid' | 'outline';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'ghost',
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`ui-icon-btn ui-icon-btn-${variant} ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
};
