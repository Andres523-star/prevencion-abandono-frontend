import React from 'react';
import '../../styles/tableSkeleton.css';

export interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="ui-table-skeleton" aria-hidden="true">
      <div className="ui-table-skeleton-header">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="ui-table-skeleton-cell skeleton-pulse" />
        ))}
      </div>
      <div className="ui-table-skeleton-body">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="ui-table-skeleton-row">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="ui-table-skeleton-cell skeleton-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
