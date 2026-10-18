import { FoodItem, DonorInfo } from './food';

export type RequestStatus =
  | 'Pending'
  | 'Accepted'
  | 'Reserved'
  | 'In Transit'
  | 'Collected'
  | 'Delivered'
  | 'Cancelled'
  | 'Expired';

export type TrackingStep = 'Requested' | 'Accepted' | 'Reserved' | 'In Transit' | 'Delivered';

export interface VolunteerInfo {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  rating: number;
  tripsCompleted: number;
  avatarUrl: string;
  currentLocation?: string;
  estimatedArrivalMinutes?: number;
}

export interface FoodRequest {
  id: string;
  requestCode: string;
  foodId: string;
  foodTitle: string;
  foodImageUrl: string;
  category: string;
  requestedQuantity: number;
  unit: string;
  donor: DonorInfo;
  fulfillmentType: 'Pickup' | 'Delivery';
  preferredTime: string;
  deliveryAddress?: string;
  recipientNotes?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  estimatedPickupTime?: string;
  volunteer?: VolunteerInfo;
  timeline: {
    step: TrackingStep;
    label: string;
    completedAt?: string;
    description: string;
    isCurrent: boolean;
    isCompleted: boolean;
  }[];
  qrVerificationCode?: string;
  cancellationReason?: string;
}

export interface CreateRequestPayload {
  foodItem: FoodItem;
  quantity: number;
  fulfillmentType: 'Pickup' | 'Delivery';
  preferredTime: string;
  deliveryAddress?: string;
  recipientNotes?: string;
}
