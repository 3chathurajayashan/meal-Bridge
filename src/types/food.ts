export type FoodCategory =
  | 'All'
  | 'Rice & Meals'
  | 'Bakery'
  | 'Fruits'
  | 'Vegetables'
  | 'Groceries'
  | 'Beverages';

export type DonorType = 'Restaurant' | 'Hotel' | 'Bakery' | 'Supermarket' | 'Household' | 'Catering';

export interface DonorInfo {
  id: string;
  name: string;
  type: DonorType;
  rating: number;
  reviewsCount: number;
  phone: string;
  address: string;
  verified: boolean;
  avatarUrl?: string;
}

export interface FoodItem {
  id: string;
  title: string;
  category: FoodCategory;
  description: string;
  imageUrl: string;
  images?: string[];
  donor: DonorInfo;
  availableQuantity: number;
  unit: string;
  location: string;
  distanceKm: number;
  distanceText: string;
  postedAt: string;
  expiresAt: string;
  expiresInHours: number;
  pickupStartTime: string;
  pickupEndTime: string;
  pickupAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  pickupType: 'Pickup' | 'Delivery' | 'Both';
  dietaryTags: string[];
  allergens: string[];
  storageInstructions: string;
  safetyCertified: boolean;
  hygieneRating: string;
  status: 'Available' | 'Low Stock' | 'Reserved' | 'Expired';
}

export interface FoodFilters {
  searchQuery: string;
  category: FoodCategory;
  maxDistanceKm: number;
  availability: 'all' | 'available' | 'lowStock';
  expiryWindow: 'all' | 'under3h' | 'today' | 'tomorrow';
  fulfillmentType: 'all' | 'Pickup' | 'Delivery';
}
