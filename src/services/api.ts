// ============================================================
// Centralized API client
// Base URL mirrors the existing login call in signIn.tsx
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
// Volunteer API helpers
// ============================================================

export const volunteerApi = {
    /** GET /api/volunteer/deliveries/available */
    getAvailableDeliveries: (token: string) =>
        apiRequest("/api/volunteer/deliveries/available", {}, token),

    /** PUT /api/volunteer/deliveries/:id/claim */
    claimDelivery: (id: string, token: string) =>
        apiRequest(
            `/api/volunteer/deliveries/${id}/claim`,
            { method: "PUT" },
            token
        ),

    /** GET /api/volunteer/deliveries/:id */
    getDelivery: (id: string, token: string) =>
        apiRequest(`/api/volunteer/deliveries/${id}`, {}, token),

    /** PUT /api/volunteer/deliveries/:id/pickup */
    confirmPickup: (id: string, token: string) =>
        apiRequest(
            `/api/volunteer/deliveries/${id}/pickup`,
            { method: "PUT" },
            token
        ),

    /** PUT /api/volunteer/deliveries/:id/transit */
    startTransit: (id: string, token: string) =>
        apiRequest(
            `/api/volunteer/deliveries/${id}/transit`,
            { method: "PUT" },
            token
        ),

    /** PUT /api/volunteer/deliveries/:id/delivered */
    confirmDelivered: (id: string, token: string) =>
        apiRequest(
            `/api/volunteer/deliveries/${id}/delivered`,
            { method: "PUT" },
            token
        ),

    /** GET /api/volunteer/deliveries/history */
    getDeliveryHistory: (token: string) =>
        apiRequest("/api/volunteer/deliveries/history", {}, token),

    /** GET /api/volunteer/summary */
    getSummary: (token: string) =>
        apiRequest("/api/volunteer/summary", {}, token),
};
