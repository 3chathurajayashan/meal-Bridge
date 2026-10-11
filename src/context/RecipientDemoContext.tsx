import {
  initialRequests,
  RecipientRequest,
} from '@/data/recipientDemo';
import React, { createContext, PropsWithChildren, useContext, useState } from 'react';

interface RecipientDemoValue {
  requests: RecipientRequest[];
  unreadCount: number;
  addRequest: (request: RecipientRequest) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  isNotificationRead: (id: string) => boolean;
}

const RecipientDemoContext = createContext<RecipientDemoValue | null>(null);

export function RecipientDemoProvider({ children }: PropsWithChildren) {
  const [requests, setRequests] = useState(initialRequests);
  const [readNotifications, setReadNotifications] = useState<string[]>(['n3']);

  const markNotificationRead = (id: string) => {
    setReadNotifications((current) => current.includes(id) ? current : [...current, id]);
  };

  const value: RecipientDemoValue = {
    requests,
    unreadCount: 3 - readNotifications.filter((id) => ['n1', 'n2', 'n3'].includes(id)).length,
    addRequest: (request) => setRequests((current) => [request, ...current]),
    markNotificationRead,
    markAllNotificationsRead: () => setReadNotifications(['n1', 'n2', 'n3']),
    isNotificationRead: (id) => readNotifications.includes(id),
  };

  return <RecipientDemoContext.Provider value={value}>{children}</RecipientDemoContext.Provider>;
}

export function useRecipientDemo() {
  const context = useContext(RecipientDemoContext);
  if (!context) {
    throw new Error('useRecipientDemo must be used within RecipientDemoProvider');
  }
  return context;
}
