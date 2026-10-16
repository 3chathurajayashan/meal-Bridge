export type NotificationType =
  | 'request_accepted'
  | 'ready_for_pickup'
  | 'volunteer_assigned'
  | 'delivery_started'
  | 'food_delivered'
  | 'request_cancelled'
  | 'food_expired'
  | 'new_donation_nearby';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedRequestId?: string;
  relatedFoodId?: string;
  iconName?: string;
}
