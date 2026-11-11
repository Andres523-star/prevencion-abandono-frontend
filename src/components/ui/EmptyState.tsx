import React from 'react';
import '../../styles/emptyState.css';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction
}) => {
  return (
    <div className="ui-empty-state" role="status">
      {icon && <div className="ui-empty-state-icon">{icon}</div>}
      <h3 className="ui-empty-state-title">{title}</h3>
      {description && <p className="ui-empty-state-desc">{description}</p>}
      {actionText && onAction && (
        <button type="button" className="ui-empty-state-btn" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
