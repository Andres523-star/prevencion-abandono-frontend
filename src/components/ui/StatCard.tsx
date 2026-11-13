import React from 'react';
import '../../styles/statCard.css';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon
}) => {
  return (
    <div className="ui-stat-card">
      <div className="ui-stat-header">
        <span className="ui-stat-title">{title}</span>
        {icon && <div className="ui-stat-icon">{icon}</div>}
      </div>
      <div className="ui-stat-value">{value}</div>
      <div className="ui-stat-footer">
        {trend && (
          <span className={`ui-stat-trend ${trend.isPositive ? 'trend-up' : 'trend-down'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
        {subtitle && <span className="ui-stat-sub">{subtitle}</span>}
      </div>
    </div>
  );
};
