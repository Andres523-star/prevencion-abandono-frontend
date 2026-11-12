import React from 'react';

export interface StatusDotProps {
  status: 'active' | 'warning' | 'inactive';
  label?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, label }) => {
  const colors = {
    active: '#10b981',
    warning: '#f59e0b',
    inactive: '#9ca3af'
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: colors[status]
        }}
        aria-hidden="true"
      />
      {label && <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>{label}</span>}
    </span>
  );
};
