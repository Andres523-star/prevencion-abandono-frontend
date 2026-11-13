import React from 'react';
import '../../styles/alertBanner.css';

export interface AlertBannerProps {
  type: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  message: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, title, message }) => {
  return (
    <div className={`ui-alert-banner ui-alert-banner-${type}`} role="alert">
      {title && <strong className="ui-alert-title">{title}: </strong>}
      <span>{message}</span>
    </div>
  );
};
