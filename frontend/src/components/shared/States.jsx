import React from 'react';
import { AlertCircle, Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/primitives';

export function EmptyState({
  title = 'No records found',
  description = 'There are no items matching your criteria at this time.',
  icon: Icon = AlertCircle,
  actionText,
  onAction,
  className = ''
}) {
  return (
    <div className={`ui-empty-state ${className}`}>
      <div className="empty-state-icon-box">
        <Icon size={28} />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-description">{description}</p>
      {actionText && onAction && (
        <Button variant="default" size="sm" onClick={onAction} className="empty-state-action-btn">
          <Plus size={14} />
          <span>{actionText}</span>
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ type = 'table', rows = 4, className = '' }) {
  if (type === 'cards') {
    return (
      <div className={`loading-cards-grid ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="ui-card p-4 flex flex-col gap-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className={`loading-detail-view ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className={`loading-table-view ${className}`}>
      <div className="flex gap-3 mb-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
