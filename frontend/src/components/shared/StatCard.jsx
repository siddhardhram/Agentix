import React from 'react';
import { Card } from '../ui/card';

export function StatCard({
  title,
  value,
  description,
  trend,
  trendType = 'positive', // positive | warning | neutral | negative
  icon: Icon,
  className = '',
  onClick
}) {
  return (
    <Card 
      className={`stat-card ${onClick ? 'is-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-box">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value-row">
          <span className="stat-card-value">{value}</span>
          {trend && (
            <span className={`stat-card-trend trend-${trendType}`}>
              {trend}
            </span>
          )}
        </div>
        {description && (
          <p className="stat-card-description">{description}</p>
        )}
      </div>
    </Card>
  );
}
