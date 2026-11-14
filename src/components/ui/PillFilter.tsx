import React from 'react';
import '../../styles/pillFilter.css';

export interface PillFilterProps {
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (val: string) => void;
}

export const PillFilter: React.FC<PillFilterProps> = ({ options, selectedValue, onSelect }) => {
  return (
    <div className="ui-pill-filter-group" role="group">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`ui-pill-filter-btn ${selectedValue === opt.value ? 'selected' : ''}`}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
