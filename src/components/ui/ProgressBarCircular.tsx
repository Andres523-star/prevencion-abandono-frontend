import React from 'react';
import '../../styles/progressBarCircular.css';

export interface ProgressBarCircularProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const ProgressBarCircular: React.FC<ProgressBarCircularProps> = ({
  percentage,
  size = 64,
  strokeWidth = 6,
  color = '#2563eb'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="ui-circle-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="ui-circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="ui-circle-val"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ui-circle-label">{percentage}%</span>
    </div>
  );
};
