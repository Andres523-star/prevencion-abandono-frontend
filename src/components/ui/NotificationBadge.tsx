import React from 'react';
import '../../styles/notificationBadge.css';

export interface NotificationBadgeProps {
  count?: number;
  dotOnly?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, dotOnly = false }) => {
  if (count !== undefined && count <= 0) return null;

  return (
    <span className={`ui-notif-badge ${dotOnly ? 'dot' : ''}`}>
      {!dotOnly && (count && count > 99 ? '99+' : count)}
    </span>
  );
};
