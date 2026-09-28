// ============================================================
// Centralized API client
// ============================================================

const BASE_URL = "http://localhost:5002";

// ============================================================
// Core fetch wrapper
// Attaches Content-Type and optional Bearer token header.
// Throws a typed error with the backend message when !res.ok.
// ============================================================

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
    token?: string | null
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "An unexpected error occurred.");
    }

    return data as T;
}

// ============================================================
// Response adapter
//
// The backend returns a different shape than what the frontend
// Delivery type expects. This function normalises a raw backend
// delivery document into the frontend Delivery type so no
// screen or component needs to know about the backend shape.
//
// Backend shape (relevant fields):
//   _id, status,
//   donation: { _id, foodName, quantity, quantityUnit,
//               foodImage: { url }, pickupAddress, pickupLocation,
//               donor }
//   recipient: { _id, fullName, phoneNumber, address, location }
//   pickupAddress, pickupLocation: { latitude, longitude }
//   deliveryAddress, deliveryLocation: { latitude, longitude }
//   acceptedAt, pickedUpAt, deliveredAt, createdAt, updatedAt
// ============================================================

import type { Delivery, ActivityItem } from "../types/volunteer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptDelivery(raw: any): Delivery {
    const don = raw.donation ?? {};
    const rec = raw.recipient ?? {};

    return {
        id: raw._id ?? raw.id,
        status: raw.status,

        donation: {
            id:          don._id ?? don.id ?? "",
            foodName:    don.foodName ?? "Unknown",
            quantity:    don.quantity != null
                             ? `${don.quantity} ${don.quantityUnit ?? ""}`.trim()
                             : "—",
            description: don.description,
            imageUrl:    don.foodImage?.url ?? undefined,
            category:    don.category,
            expiresAt:   don.availableUntil,
        },

        pickupAddress: {
            street:      don.pickupAddress ?? raw.pickupAddress ?? "",
            fullAddress: don.pickupAddress ?? raw.pickupAddress ?? "",
            coordinates: raw.pickupLocation
                ? { latitude: raw.pickupLocation.latitude, longitude: raw.pickupLocation.longitude }
                : undefined,
        },

        dropOffAddress: {
            street:      rec.address ?? raw.deliveryAddress ?? "",
            fullAddress: rec.address ?? raw.deliveryAddress ?? "",
            coordinates: raw.deliveryLocation
                ? { latitude: raw.deliveryLocation.latitude, longitude: raw.deliveryLocation.longitude }
                : (rec.location
                    ? { latitude: rec.location.latitude, longitude: rec.location.longitude }
                    : undefined),
        },

        donor: {
            name:  don.donor?.fullName  ?? "",
            phone: don.donor?.phoneNumber ?? "",
            email: don.donor?.email,
        },

        recipient: {
            name:  rec.fullName    ?? "",
            phone: rec.phoneNumber ?? "",
        },

        // These are not supplied by the backend — leave undefined
        distanceKm:  undefined,
        etaMinutes:  undefined,

        availableFrom:  don.availableFrom,
        availableUntil: don.availableUntil,

        claimedAt:   raw.acceptedAt,
        pickedUpAt:  raw.pickedUpAt,
        inTransitAt: undefined,
        deliveredAt: raw.deliveredAt,
        createdAt:   raw.createdAt,
        updatedAt:   raw.updatedAt,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptActivityItem(raw: any): ActivityItem {
    const d = adaptDelivery(raw);
    return {
        id:            d.id,
        status:        d.status,
        donation: {
            id:        d.donation.id,
            foodName:  d.donation.foodName,
            quantity:  d.donation.quantity,
            imageUrl:  d.donation.imageUrl,
        },
        pickupAddress: {
            fullAddress: d.pickupAddress.fullAddress,
            street:      d.pickupAddress.street,
            city:        d.pickupAddress.city,
        },
        dropOffAddress: {
            fullAddress: d.dropOffAddress.fullAddress,
            street:      d.dropOffAddress.street,
            city:        d.dropOffAddress.city,
        },
        distanceKm:  d.distanceKm,
        deliveredAt: d.deliveredAt,
        createdAt:   d.createdAt,
        rating:      d.rating,
        review:      d.review,
    };
}

// ============================================================
// Volunteer API helpers
// Routes aligned to the actual backend (app.js mounts at /api/volunteers
// for profile and /api/delivery for delivery actions).
// ============================================================

export const volunteerApi = {
    // ── Available deliveries ───────────────────────────────
    // GET /api/delivery/available
    getAvailableDeliveries: async (token: string): Promise<Delivery[]> => {
        const res = await apiRequest<{ deliveries: unknown[] }>(
            "/api/delivery/available",
            {},
            token
        );
        return (res.deliveries ?? []).map(adaptDelivery);
    },

    // ── Accept (claim) a delivery ──────────────────────────
    // PUT /api/delivery/:id/accept
    claimDelivery: async (id: string, token: string): Promise<Delivery> => {
        const res = await apiRequest<{ delivery: unknown }>(
            `/api/delivery/${id}/accept`,
            { method: "PUT" },
            token
        );
        return adaptDelivery(res.delivery);
    },

    // ── Single delivery ────────────────────────────────────
    // GET /api/delivery/:id
    getDelivery: async (id: string, token: string): Promise<Delivery> => {
        const res = await apiRequest<{ delivery: unknown }>(
            `/api/delivery/${id}`,
            {},
            token
        );
        return adaptDelivery(res.delivery);
    },

    // ── Pickup ─────────────────────────────────────────────
    // PUT /api/delivery/:id/pickup
    confirmPickup: async (id: string, token: string): Promise<Delivery> => {
        const res = await apiRequest<{ delivery: unknown }>(
            `/api/delivery/${id}/pickup`,
            { method: "PUT" },
            token
        );
        return adaptDelivery(res.delivery);
    },

    // ── Transit ────────────────────────────────────────────
    // PUT /api/delivery/:id/transit
    startTransit: async (id: string, token: string): Promise<Delivery> => {
        const res = await apiRequest<{ delivery: unknown }>(
            `/api/delivery/${id}/transit`,
            { method: "PUT" },
            token
        );
        return adaptDelivery(res.delivery);
    },

    // ── Delivered ──────────────────────────────────────────
    // PUT /api/delivery/:id/delivered
    confirmDelivered: async (id: string, token: string): Promise<Delivery> => {
        const res = await apiRequest<{ delivery: unknown }>(
            `/api/delivery/${id}/delivered`,
            { method: "PUT" },
            token
        );
        return adaptDelivery(res.delivery);
    },

    // ── History ────────────────────────────────────────────
    // GET /api/volunteers/history
    getDeliveryHistory: async (token: string): Promise<ActivityItem[]> => {
        const res = await apiRequest<{ deliveries: unknown[] }>(
            "/api/volunteers/history",
            {},
            token
        );
        return (res.deliveries ?? []).map(adaptActivityItem);
    },

    // ── Summary ────────────────────────────────────────────
    // GET /api/volunteers/summary
    getSummary: async (token: string) => {
        const res = await apiRequest<{
            availableDeliveries: number;
            activeDelivery: unknown | null;
            completedDeliveries: number;
            totalDeliveries: number;
            averageRating?: number;
        }>("/api/volunteers/summary", {}, token);

        return {
            availableDeliveries:  res.availableDeliveries,
            completedDeliveries:  res.completedDeliveries,
            totalDeliveries:      res.totalDeliveries,
            averageRating:        res.averageRating,
            activeDelivery: res.activeDelivery
                ? adaptDelivery(res.activeDelivery)
                : null,
        };
    },
};
