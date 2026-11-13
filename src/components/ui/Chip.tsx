import React from 'react';
import '../../styles/chip.css';

export interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, active = false, onClick }) => {
  return (
    <button
      type="button"
      className={`ui-chip ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
