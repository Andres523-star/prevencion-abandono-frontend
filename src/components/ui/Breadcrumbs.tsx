import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Migas de pan" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
      <ol style={{ listStyle: 'none', display: 'flex', gap: '0.5rem', padding: 0, margin: 0 }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {isLast ? (
                <span style={{ color: '#4b5563', fontWeight: 600 }} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <a href={item.href || '#'} style={{ color: '#2563eb', textDecoration: 'none' }}>
                    {item.label}
                  </a>
                  <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
