import React from 'react';

export interface DividerProps {
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({ label }) => {
  if (!label) {
    return <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
      <div style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
      <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
        {label}
      </span>
      <div style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
    </div>
  );
};
