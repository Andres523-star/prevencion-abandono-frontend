import React from 'react';
import '../../styles/progressBar.css';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = true,
  color = '#2563eb'
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className="ui-progress-wrapper">
      {(label || showPercent) && (
        <div className="ui-progress-header">
          {label && <span className="ui-progress-label">{label}</span>}
          {showPercent && <span className="ui-progress-value">{percentage}%</span>}
        </div>
      )}
      <div className="ui-progress-track" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
        <div className="ui-progress-fill" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};
