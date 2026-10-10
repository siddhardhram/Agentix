import React, { createContext, useContext, useState } from 'react';
import { MOCK_NOTIFICATIONS } from '../services/mockData';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAsRead: (id) => {},
  markAllAsRead: () => {},
  clearAll: () => {}
});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
