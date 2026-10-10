import React from 'react';

export function PageHeader({
  title,
  description,
  badge,
  actions,
  children
}) {
  return (
    <div className="page-header-container">
      <div className="page-header-left">
        <div className="page-title-row">
          <h1 className="page-main-title">{title}</h1>
          {badge && <div className="page-title-badge">{badge}</div>}
        </div>
        {description && <p className="page-main-description">{description}</p>}
      </div>

      {actions && (
        <div className="page-header-actions">
          {actions}
        </div>
      )}

      {children}
    </div>
  );
}
