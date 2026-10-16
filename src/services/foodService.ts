import { FoodItem, FoodFilters } from '../types/food';
import { FoodRequest, CreateRequestPayload } from '../types/request';
import { AppNotification } from '../types/notification';
import { RecipientProfile } from '../types/user';
import { MOCK_FOODS, MOCK_REQUESTS, MOCK_NOTIFICATIONS, INITIAL_USER_PROFILE } from '../data/mockFoodData';

// In-memory persistent state during session
let foodsState: FoodItem[] = [...MOCK_FOODS];
let requestsState: FoodRequest[] = [...MOCK_REQUESTS];
let notificationsState: AppNotification[] = [...MOCK_NOTIFICATIONS];
let userProfileState: RecipientProfile = { ...INITIAL_USER_PROFILE };

export const foodService = {
  /**
   * Fetch all available food items with filtering
   */
  async getFoods(filters?: Partial<FoodFilters>): Promise<FoodItem[]> {
    // Simulated network latency for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 250));

    let results = [...foodsState];

    if (!filters) return results;

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      results = results.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.donor.name.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'All') {
      results = results.filter((f) => f.category === filters.category);
    }

    if (filters.maxDistanceKm && filters.maxDistanceKm > 0) {
      results = results.filter((f) => f.distanceKm <= filters.maxDistanceKm!);
    }

    if (filters.availability && filters.availability !== 'all') {
      if (filters.availability === 'available') {
        results = results.filter((f) => f.status === 'Available');
      } else if (filters.availability === 'lowStock') {
        results = results.filter((f) => f.availableQuantity <= 3);
      }
    }

    if (filters.expiryWindow && filters.expiryWindow !== 'all') {
      if (filters.expiryWindow === 'under3h') {
        results = results.filter((f) => f.expiresInHours <= 3);
      } else if (filters.expiryWindow === 'today') {
        results = results.filter((f) => f.expiresInHours <= 12);
      }
    }

    if (filters.fulfillmentType && filters.fulfillmentType !== 'all') {
      results = results.filter(
        (f) => f.pickupType === 'Both' || f.pickupType === filters.fulfillmentType
      );
    }

    return results;
  },

  /**
   * Fetch food by ID
   */
  async getFoodById(id: string): Promise<FoodItem | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return foodsState.find((f) => f.id === id);
  },

  /**
   * Fetch all recipient requests
   */
  async getRequests(statusFilter?: string): Promise<FoodRequest[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!statusFilter || statusFilter === 'All') {
      return [...requestsState];
    }

    if (statusFilter === 'Pending') {
      return requestsState.filter((r) => r.status === 'Pending');
    }

    if (statusFilter === 'Accepted') {
      return requestsState.filter(
        (r) => r.status === 'Accepted' || r.status === 'Reserved' || r.status === 'In Transit'
      );
    }

    if (statusFilter === 'Completed') {
      return requestsState.filter((r) => r.status === 'Delivered' || r.status === 'Collected');
    }

    return requestsState.filter((r) => r.status === statusFilter);
  },

  /**
   * Fetch single request for tracking
   */
  async getRequestById(id: string): Promise<FoodRequest | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return requestsState.find((r) => r.id === id);
  },

  /**
   * Create a new food request
   */
  async createRequest(payload: CreateRequestPayload): Promise<FoodRequest> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newRequestId = `req_${Date.now()}`;
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const requestCode = `REQ-${codeNumber}`;

    const newRequest: FoodRequest = {
      id: newRequestId,
      requestCode,
      foodId: payload.foodItem.id,
      foodTitle: payload.foodItem.title,
      foodImageUrl: payload.foodItem.imageUrl,
      category: payload.foodItem.category,
      requestedQuantity: payload.quantity,
      unit: payload.foodItem.unit,
      donor: payload.foodItem.donor,
      fulfillmentType: payload.fulfillmentType,
      preferredTime: payload.preferredTime || 'ASAP',
      deliveryAddress: payload.deliveryAddress || userProfileState.address,
      recipientNotes: payload.recipientNotes,
      status: 'Pending',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      qrVerificationCode: `MB-${codeNumber}-CODE`,
      timeline: [
        {
          step: 'Requested',
          label: 'Request Submitted',
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `You requested ${payload.quantity} ${payload.foodItem.unit} from ${payload.foodItem.donor.name}.`,
          isCurrent: true,
          isCompleted: true,
        },
        {
          step: 'Accepted',
          label: 'Donor Confirmation',
          description: 'Awaiting confirmation from donor kitchen.',
          isCurrent: false,
          isCompleted: false,
        },
        {
          step: 'Reserved',
          label: 'Reserved & Packaged',
          description: 'Food prepared and packed for pickup/delivery.',
          isCurrent: false,
          isCompleted: false,
        },
        {
          step: 'In Transit',
          label: 'Out for Pickup / Delivery',
          description: payload.fulfillmentType === 'Delivery' ? 'Volunteer assigned for transport.' : 'Ready for your collection.',
          isCurrent: false,
          isCompleted: false,
        },
        {
          step: 'Delivered',
          label: 'Handover & Completed',
          description: 'Verified with security PIN.',
          isCurrent: false,
          isCompleted: false,
        },
      ],
    };

    // Prepend to requests
    requestsState = [newRequest, ...requestsState];

    // Decrement food quantity locally
    foodsState = foodsState.map((food) => {
      if (food.id === payload.foodItem.id) {
        const remaining = Math.max(0, food.availableQuantity - payload.quantity);
        return {
          ...food,
          availableQuantity: remaining,
          status: remaining === 0 ? 'Reserved' : food.status,
        };
      }
      return food;
    });

    // Add a notification
    const newNotification: AppNotification = {
      id: `notif_${Date.now()}`,
      type: 'request_accepted',
      title: 'Food Request Placed 📦',
      message: `Your request ${requestCode} for ${payload.foodItem.title} has been submitted to ${payload.foodItem.donor.name}.`,
      timestamp: 'Just now',
      isRead: false,
      relatedRequestId: newRequestId,
      iconName: 'time',
    };
    notificationsState = [newNotification, ...notificationsState];

    return newRequest;
  },

  /**
   * Cancel an existing request
   */
  async cancelRequest(requestId: string, reason: string = 'Recipient requested cancellation'): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    requestsState = requestsState.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'Cancelled',
          cancellationReason: reason,
          updatedAt: 'Just now',
        };
      }
      return r;
    });
    return true;
  },

  /**
   * Fetch all notifications
   */
  async getNotifications(): Promise<AppNotification[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...notificationsState];
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    notificationsState = notificationsState.map((n) => ({ ...n, isRead: true }));
  },

  /**
   * Mark single notification as read
   */
  async markNotificationAsRead(id: string): Promise<void> {
    notificationsState = notificationsState.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  },

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<RecipientProfile> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { ...userProfileState };
  },

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<RecipientProfile>): Promise<RecipientProfile> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    userProfileState = { ...userProfileState, ...updates };
    return { ...userProfileState };
  },
};

export default foodService;
