// ============================================================
// Volunteer module TypeScript types
// Reflects the backend API response shapes for all volunteer
// endpoints. Fields are optional where the backend may omit them.
// ============================================================

// ============================================================
// Shared primitives
// ============================================================

export type Coordinates = {
    latitude: number;
    longitude: number;
};

export type ContactInfo = {
    name: string;
    phone: string;
    email?: string;
};

// ============================================================
// Delivery status
// Maps to the backend status progression:
// ACCEPTED → PICKED_UP → IN_TRANSIT → DELIVERED
// Also includes AVAILABLE (unclaimed) and CANCELLED.
// ============================================================

export type DeliveryStatus =
    | "AVAILABLE"
    | "ACCEPTED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CANCELLED";

// ============================================================
// Food / donation details embedded in a delivery
// ============================================================

export type FoodDonation = {
    id: string;
    foodName: string;
    quantity: string;           // e.g. "10 portions" — string from backend
    description?: string;
    imageUrl?: string;
    expiresAt?: string;         // ISO date string
    category?: string;
};

// ============================================================
// Pickup / drop-off address block
// ============================================================

export type AddressInfo = {
    street: string;
    city?: string;
    state?: string;
    postalCode?: string;
    fullAddress?: string;       // pre-formatted string from backend
    coordinates?: Coordinates;
};

// ============================================================
// Delivery object returned by the API
// ============================================================

export type Delivery = {
    id: string;
    status: DeliveryStatus;

    // Food/donation info
    donation: FoodDonation;

    // Locations
    pickupAddress: AddressInfo;
    dropOffAddress: AddressInfo;

    // Contacts
    donor: ContactInfo;
    recipient: ContactInfo;

    // Logistics
    distanceKm?: number;        // distance in kilometres
    etaMinutes?: number;        // estimated travel time in minutes
    availableFrom?: string;     // ISO date string — window start
    availableUntil?: string;    // ISO date string — window end

    // Timestamps
    claimedAt?: string;
    pickedUpAt?: string;
    inTransitAt?: string;
    deliveredAt?: string;
    createdAt?: string;
    updatedAt?: string;

    // Rating / review (on completed deliveries)
    rating?: number;            // 1-5
    review?: string;
};

// ============================================================
// Activity list item — lighter shape used in history list
// ============================================================

export type ActivityItem = {
    id: string;
    status: DeliveryStatus;
    donation: Pick<FoodDonation, "id" | "foodName" | "quantity" | "imageUrl">;
    pickupAddress: Pick<AddressInfo, "fullAddress" | "street" | "city">;
    dropOffAddress: Pick<AddressInfo, "fullAddress" | "street" | "city">;
    distanceKm?: number;
    deliveredAt?: string;
    createdAt?: string;
    rating?: number;
    review?: string;
};

// ============================================================
// Dashboard summary returned by GET /api/volunteer/summary
// ============================================================

export type VolunteerSummary = {
    availableDeliveries: number;
    activeDelivery: Delivery | null;   // the single in-progress delivery, if any
    completedDeliveries: number;
    totalDeliveries: number;
    averageRating?: number;            // may be absent if no ratings yet
};

// ============================================================
// API response wrappers
// The backend may wrap lists in { data: [...] } or return arrays
// directly. Using a union so consumers can handle both shapes.
// ============================================================

export type ApiListResponse<T> = T[] | { data: T[] };

export function extractList<T>(response: ApiListResponse<T>): T[] {
    if (Array.isArray(response)) return response;
    return response.data ?? [];
}
