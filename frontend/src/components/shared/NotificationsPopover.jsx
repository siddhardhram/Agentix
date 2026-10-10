import React from 'react';
import { Bell, CheckCheck, Trash2, ExternalLink, ShieldAlert, CheckCircle2, Cpu } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../ui/button';

export function NotificationsPopover({ open, onClose, onNavigate }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  if (!open) return null;

  return (
    <div className="notifications-popover-panel">
      <div className="notifications-header">
        <div className="notifications-header-left">
          <span className="notifications-title">Notifications</span>
          {unreadCount > 0 && (
            <span className="unread-count-pill">{unreadCount} new</span>
          )}
        </div>
        <div className="notifications-header-actions">
          {unreadCount > 0 && (
            <button className="notif-action-link" onClick={markAllAsRead}>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="notif-action-link text-dim" onClick={clearAll}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={24} className="text-dim mb-2" />
            <p className="text-xs text-muted">You have no new notifications.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = n.type === 'warning' ? ShieldAlert :
                         n.type === 'success' ? CheckCircle2 : Cpu;
            const iconColor = n.type === 'warning' ? 'text-amber' :
                              n.type === 'success' ? 'text-emerald' : 'text-cyan';

            return (
              <div
                key={n.id}
                className={`notification-item ${n.unread ? 'is-unread' : ''}`}
                onClick={() => {
                  markAsRead(n.id);
                  if (onNavigate && n.link) onNavigate(n.link);
                  if (onClose) onClose();
                }}
              >
                <div className={`notif-icon-box ${iconColor}`}>
                  <Icon size={16} />
                </div>
                <div className="notif-content">
                  <div className="notif-top-row">
                    <span className="notif-item-title">{n.title}</span>
                    <span className="notif-time">{n.time}</span>
                  </div>
                  <p className="notif-message">{n.message}</p>
                </div>
                {n.unread && <span className="notif-unread-dot" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
