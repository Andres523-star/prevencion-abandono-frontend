import React from 'react';
import '../../styles/tag.css';

export interface TagProps {
  label: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({ label, color = 'blue', onRemove }) => {
  return (
    <span className={`ui-tag ui-tag-${color}`}>
      <span>{label}</span>
      {onRemove && (
        <button type="button" className="ui-tag-close" onClick={onRemove} aria-label={`Remover ${label}`}>
          &times;
        </button>
      )}
    </span>
  );
};
