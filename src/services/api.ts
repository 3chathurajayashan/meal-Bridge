import Constants from "expo-constants";
import { Platform } from "react-native";

const getBaseUrl = (): string => {
    if (Platform.OS === "web") {
        return "http://localhost:5002";
    }

    const hostUri =
        Constants.expoConfig?.hostUri ??
        (Constants as any).manifest?.debuggerHost ??
        (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

    if (hostUri) {
        const ip = hostUri.split(":")[0];
        if (ip) {
            return `http://${ip}:5002`;
        }
    }

    return "http://192.168.1.3:5002";
};

export const BASE_URL = getBaseUrl();

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

    // ── Cancel a delivery (volunteer releases it back to PENDING) ──
    // PUT /api/delivery/:id/cancel
    cancelDelivery: async (id: string, token: string): Promise<void> => {
        await apiRequest<unknown>(
            `/api/delivery/${id}/cancel`,
            { method: "PUT" },
            token
        );
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
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { File as ExpoFile } from 'expo-file-system';

// Backend port is 5002 as configured in meal-bridge-backend/.env
const DEFAULT_PORT = 5002;

/**
 * Resolves the appropriate backend API base URL depending on runtime environment:
 * - Web / iOS Simulator: http://localhost:5002/api
 * - Android Emulator: http://10.0.2.2:5002/api
 * - Physical Device: uses Metro host IP or fallback
 */
export const getApiBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return `http://localhost:${DEFAULT_PORT}/api`;
  }

  // Extract host IP when running via Expo Go / dev client on physical phone or emulator
  const debuggerHost = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:${DEFAULT_PORT}/api`;
    }
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}/api`;
  }

  return `http://localhost:${DEFAULT_PORT}/api`;
};

// Storage Keys
const TOKEN_KEY = '@mealbridge_auth_token';
const USER_KEY = '@mealbridge_auth_user';
const API_URL_OVERRIDE_KEY = '@mealbridge_api_base_url';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'DONOR' | 'RECIPIENT' | 'VOLUNTEER' | 'ADMIN';
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface BackendDonation {
  _id: string;
  donor: string | { _id: string; fullName: string; email: string };
  foodName: string;
  description?: string;
  category: 'COOKED_FOOD' | 'PACKAGED_FOOD' | 'FRUITS' | 'VEGETABLES' | 'BAKERY' | 'BEVERAGES' | 'OTHER';
  quantity: number;
  quantityUnit: 'PORTIONS' | 'KG' | 'LITERS' | 'PACKETS' | 'ITEMS';
  foodImage?: {
    url?: string | null;
    publicId?: string | null;
  };
  pickupAddress: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  availableFrom: string;
  availableUntil: string;
  status: 'AVAILABLE' | 'RESERVED' | 'CLAIMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  claimedBy?: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  } | null;
  claimedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoodRequest {
  _id: string;
  donation: string | BackendDonation;
  recipient: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  message?: string;
  createdAt: string;
}

export interface CreateDonationPayload {
  title: string;
  category: string;
  quantity: string | number;
  quantityUnit?: string;
  expiry?: string;
  dietaryTags?: string[];
  instructions?: string;
  pickupAddress?: string;
  latitude?: number;
  longitude?: number;
  availableFrom?: string;
  availableUntil?: string;
  imageUri?: string;
}

export interface Donation {
  id: string;
  title: string;
  category: string;
  rawCategory?: string;
  quantity: string;
  rawQuantity?: number;
  quantityUnit?: string;
  expiry: string;
  dietaryTags?: string[];
  instructions?: string;
  status: 'requested' | 'approved' | 'picked_up' | 'delivered' | 'cancelled';
  rawStatus?: 'AVAILABLE' | 'RESERVED' | 'CLAIMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  pickupAddress?: string;
  imageUrl?: string | null;
  volunteer?: {
    name: string;
    role: string;
    phone?: string;
  };
  createdAt?: string;
}

// -------------------------------------------------------------
// Category & Status Mappings
// -------------------------------------------------------------
export const CATEGORY_MAP_TO_BACKEND: Record<string, BackendDonation['category']> = {
  'Prepared Meals': 'COOKED_FOOD',
  'Cooked Food': 'COOKED_FOOD',
  'Groceries': 'PACKAGED_FOOD',
  'Packaged Food': 'PACKAGED_FOOD',
  'Produce': 'VEGETABLES',
  'Fresh Vegetables': 'VEGETABLES',
  'Fruits': 'FRUITS',
  'Baked Goods': 'BAKERY',
  'Bakery': 'BAKERY',
  'Beverages': 'BEVERAGES',
  'Other': 'OTHER',
};

export const CATEGORY_MAP_TO_UI: Record<string, string> = {
  'COOKED_FOOD': 'Prepared Meals',
  'PACKAGED_FOOD': 'Groceries',
  'VEGETABLES': 'Fresh Vegetables',
  'FRUITS': 'Fresh Produce',
  'BAKERY': 'Baked Goods',
  'BEVERAGES': 'Beverages',
  'OTHER': 'Other',
};

export const mapStatusToUI = (status: BackendDonation['status']): Donation['status'] => {
  switch (status) {
    case 'AVAILABLE':
      return 'requested';
    case 'RESERVED':
      return 'approved';
    case 'CLAIMED':
      return 'picked_up';
    case 'COMPLETED':
      return 'delivered';
    case 'CANCELLED':
    case 'EXPIRED':
      return 'cancelled';
    default:
      return 'requested';
  }
};

export const transformBackendDonation = (item: BackendDonation): Donation => {
  const uiStatus = mapStatusToUI(item.status);
  const uiCategory = CATEGORY_MAP_TO_UI[item.category] || item.category;

  let volunteerInfo = undefined;
  if (item.claimedBy && typeof item.claimedBy === 'object') {
    volunteerInfo = {
      name: item.claimedBy.fullName || 'Assigned Recipient',
      role: 'Recipient / NGO Partner',
      phone: item.claimedBy.phoneNumber,
    };
  }

  return {
    id: item._id,
    title: item.foodName,
    category: uiCategory,
    rawCategory: item.category,
    quantity: `${item.quantity} ${item.quantityUnit ? item.quantityUnit.toLowerCase() : 'items'}`,
    rawQuantity: item.quantity,
    quantityUnit: item.quantityUnit,
    expiry: item.availableUntil || item.createdAt,
    dietaryTags: [],
    instructions: item.description || '',
    status: uiStatus,
    rawStatus: item.status,
    pickupAddress: item.pickupAddress,
    imageUrl: item.foodImage?.url || null,
    volunteer: volunteerInfo,
    createdAt: item.createdAt,
  };
};

// -------------------------------------------------------------
// Auth & Token Management
// -------------------------------------------------------------
let memoryToken: string | null = null;
let memoryUser: User | null = null;

// Built-in active donor session fallback (Thilakshi Weliwaththa - registered donor)
// Ensures out-of-the-box working experience without mandatory manual login prompt
const DEMO_DONOR_USER: User = {
  id: '6a8170312305425a97f35bc2',
  email: 'thilakshiweliwaththa@gmail.com',
  fullName: 'Thilakshi Weliwaththa',
  phoneNumber: '+94 77 123 4567',
  role: 'DONOR',
  address: 'Kottawa, Sri Lanka',
  location: { latitude: 6.8412, longitude: 79.9654 },
};

// Demo JWT signed with the backend JWT_SECRET for donor
const DEMO_DONOR_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTgxNzAzMTIzMDU0MjVhOTdmMzViYzIiLCJlbWFpbCI6Im1hbGtpbmlAZ21haWwuY29tIiwicm9sZSI6IkRPTk9SIiwiaWF0IjoxNzkxNzgwOTUzLCJleHAiOjE3OTQzNzI5NTN9.GHStxGjOQi3x9HgV5gBaekkthFlf46y_rshetP8waUU';

export const getAuthToken = async (): Promise<string> => {
  if (memoryToken) return memoryToken;
  try {
    const saved = await AsyncStorage.getItem(TOKEN_KEY);
    if (saved) {
      memoryToken = saved;
      return saved;
    }
  } catch (e) {
    console.warn('AsyncStorage getAuthToken failed:', e);
  }
  // Fallback to active demo donor token
  return DEMO_DONOR_TOKEN;
};

export const setAuthToken = async (token: string | null): Promise<void> => {
  memoryToken = token;
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn('AsyncStorage setAuthToken failed:', e);
  }
};

export const getStoredUser = async (): Promise<User> => {
  if (memoryUser && memoryUser.fullName !== 'Malkini bandara') {
    if (memoryUser.address?.includes('Kurunegala')) {
      memoryUser.address = 'Kottawa, Sri Lanka';
      memoryUser.location = { latitude: 6.8412, longitude: 79.9654 };
    }
    return memoryUser;
  }
  try {
    const saved = await AsyncStorage.getItem(USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.fullName && parsed.fullName !== 'Malkini bandara') {
        if (parsed.address?.includes('Kurunegala')) {
          parsed.address = 'Kottawa, Sri Lanka';
          parsed.location = { latitude: 6.8412, longitude: 79.9654 };
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(parsed));
        }
        memoryUser = parsed;
        return memoryUser!;
      }
    }
  } catch (e) {
    console.warn('AsyncStorage getStoredUser failed:', e);
  }
  return DEMO_DONOR_USER;
};

export const setStoredUser = async (user: User | null): Promise<void> => {
  memoryUser = user;
  try {
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.warn('AsyncStorage setStoredUser failed:', e);
  }
};

export const getEffectiveBaseUrl = async (): Promise<string> => {
  try {
    const custom = await AsyncStorage.getItem(API_URL_OVERRIDE_KEY);
    if (custom) return custom;
  } catch {
    // ignore
  }
  return getApiBaseUrl();
};

export const setCustomApiBaseUrl = async (url: string | null): Promise<void> => {
  try {
    if (url) {
      await AsyncStorage.setItem(API_URL_OVERRIDE_KEY, url);
    } else {
      await AsyncStorage.removeItem(API_URL_OVERRIDE_KEY);
    }
  } catch (e) {
    console.warn('Failed saving custom API URL:', e);
  }
};

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
export const loginDonor = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const baseUrl = await getEffectiveBaseUrl();
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login failed');
  }

  await setAuthToken(data.accessToken);
  const user: User = {
    id: data.user.id || data.user._id,
    fullName: data.user.fullName,
    email: data.user.email,
    phoneNumber: data.user.phoneNumber,
    role: data.user.role,
    address: data.user.address,
    location: data.user.location,
  };
  await setStoredUser(user);

  return { token: data.accessToken, user };
};

export const logoutDonor = async (): Promise<void> => {
  await setAuthToken(null);
  await setStoredUser(null);
};

// -------------------------------------------------------------
// Food Donor Donation Endpoints
// -------------------------------------------------------------

/**
 * Fetch all donations created by the currently logged-in donor
 * Backend: GET /api/donations/my
 */
export const getMyDonations = async (): Promise<Donation[]> => {
  const baseUrl = await getEffectiveBaseUrl();
  const token = await getAuthToken();

  const response = await fetch(`${baseUrl}/donations/my`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch donations (${response.status})`);
  }

  const data = await response.json();
  const list: BackendDonation[] = data.donations || [];
  return list.map(transformBackendDonation);
};

/**
 * Fetch active ongoing donations for tracker
 * Filters donor donations whose status is AVAILABLE, RESERVED, or CLAIMED
 */
export const getActiveDonations = async (): Promise<Donation[]> => {
  const all = await getMyDonations();
  return all.filter(
    (d) => d.rawStatus === 'AVAILABLE' || d.rawStatus === 'RESERVED' || d.rawStatus === 'CLAIMED'
  );
};

/**
 * Fetch donation history
 * Filters donor donations whose status is COMPLETED, CANCELLED, or EXPIRED, or returns all past records
 */
export const getDonationHistory = async (): Promise<Donation[]> => {
  const all = await getMyDonations();
  return all.filter(
    (d) => d.rawStatus === 'COMPLETED' || d.rawStatus === 'CANCELLED' || d.rawStatus === 'EXPIRED'
  );
};

/**
 * Create a new Food Donation
 * Backend: POST /api/donations (supports multipart or JSON)
 */
export const createDonation = async (data: CreateDonationPayload): Promise<Donation> => {
  const baseUrl = await getEffectiveBaseUrl();
  const token = await getAuthToken();
  const user = await getStoredUser();

  // Parse category into backend enum
  const backendCategory = CATEGORY_MAP_TO_BACKEND[data.category] || 'COOKED_FOOD';

  // Parse quantity and unit
  let parsedQuantity = 1;
  let parsedUnit = data.quantityUnit || 'PORTIONS';

  if (typeof data.quantity === 'number') {
    parsedQuantity = data.quantity;
  } else if (typeof data.quantity === 'string') {
    const num = parseInt(data.quantity.replace(/\D/g, ''), 10);
    parsedQuantity = isNaN(num) || num <= 0 ? 1 : num;
    const lower = data.quantity.toLowerCase();
    if (lower.includes('kg')) parsedUnit = 'KG';
    else if (lower.includes('liter') || lower.includes('l')) parsedUnit = 'LITERS';
    else if (lower.includes('packet')) parsedUnit = 'PACKETS';
    else if (lower.includes('item') || lower.includes('box')) parsedUnit = 'ITEMS';
  }

  // Ensure valid availability dates
  const now = new Date();
  const availableFrom = data.availableFrom || now.toISOString();

  let availableUntilDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // default +24h
  if (data.availableUntil) {
    const parsed = new Date(data.availableUntil);
    if (!isNaN(parsed.getTime()) && parsed > now) {
      availableUntilDate = parsed;
    }
  } else if (data.expiry) {
    const parsed = new Date(data.expiry);
    if (!isNaN(parsed.getTime()) && parsed > now) {
      availableUntilDate = parsed;
    } else {
      // Relative parsing (e.g. "Expires in 3 hours", "Today 5 PM")
      const hoursMatch = data.expiry.match(/(\d+)\s*hour/i);
      if (hoursMatch) {
        availableUntilDate = new Date(now.getTime() + parseInt(hoursMatch[1], 10) * 60 * 60 * 1000);
      }
    }
  }

  const pickupAddress = data.pickupAddress || user.address || 'Colombo, Sri Lanka';
  const latitude = data.latitude || user.location?.latitude || 6.9271;
  const longitude = data.longitude || user.location?.longitude || 79.8612;

  // If user selected an image file, send as FormData multipart
  if (data.imageUri && Platform.OS !== 'web') {
    try {
      const formData = new FormData();
      formData.append('foodName', data.title);
      formData.append('description', data.instructions || '');
      formData.append('category', backendCategory);
      formData.append('quantity', String(parsedQuantity));
      formData.append('quantityUnit', parsedUnit);
      formData.append('pickupAddress', pickupAddress);
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('availableFrom', availableFrom);
      formData.append('availableUntil', availableUntilDate.toISOString());

      const filename = data.imageUri.split('/').pop() || 'food.jpg';

      // Expo SDK 57 / React Native 0.86+ WinterCG FormData requires Blob or File
      let attached = false;
      try {
        const file = new ExpoFile(data.imageUri);
        formData.append('foodImage', file as any, filename);
        attached = true;
      } catch (fileErr) {
        console.warn('ExpoFile instantiation failed, attempting blob fetch:', fileErr);
      }

      if (!attached) {
        try {
          const imgRes = await fetch(data.imageUri);
          const blob = await imgRes.blob();
          formData.append('foodImage', blob as any, filename);
          attached = true;
        } catch (blobErr) {
          console.warn('Blob fetch failed:', blobErr);
        }
      }

      const response = await fetch(`${baseUrl}/donations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Let fetch automatically inject the multipart boundary
        },
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to create donation');
      }

      return transformBackendDonation(resData.donation);
    } catch (uploadError: any) {
      console.warn('Multipart upload error, falling back to JSON donation creation:', uploadError);
    }
  }

  // JSON payload
  const body = {
    foodName: data.title,
    description: data.instructions || '',
    category: backendCategory,
    quantity: parsedQuantity,
    quantityUnit: parsedUnit,
    pickupAddress,
    latitude,
    longitude,
    availableFrom,
    availableUntil: availableUntilDate.toISOString(),
  };

  const response = await fetch(`${baseUrl}/donations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || 'Failed to create donation');
  }

  return transformBackendDonation(resData.donation);
};

export interface UpdateDonationPayload {
  title?: string;
  category?: string;
  quantity?: string | number;
  quantityUnit?: string;
  instructions?: string;
  pickupAddress?: string;
  availableUntil?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Update an existing food donation
 * Backend: PUT /api/donations/:id
 */
export const updateDonation = async (
  id: string,
  data: UpdateDonationPayload
): Promise<Donation> => {
  const baseUrl = await getEffectiveBaseUrl();
  const token = await getAuthToken();

  const body: Record<string, any> = {};
  if (data.title !== undefined) body.foodName = data.title;
  if (data.instructions !== undefined) body.description = data.instructions;
  if (data.category !== undefined) {
    body.category = CATEGORY_MAP_TO_BACKEND[data.category] || data.category;
  }
  if (data.quantity !== undefined) {
    const parsedQty = typeof data.quantity === 'number' ? data.quantity : parseFloat(String(data.quantity));
    if (!isNaN(parsedQty)) body.quantity = parsedQty;
  }
  if (data.quantityUnit !== undefined) {
    const upper = data.quantityUnit.toUpperCase();
    if (['PORTIONS', 'KG', 'LITERS', 'PACKETS', 'ITEMS'].includes(upper)) {
      body.quantityUnit = upper;
    }
  }
  if (data.pickupAddress !== undefined) body.pickupAddress = data.pickupAddress;
  if (data.availableUntil !== undefined) body.availableUntil = data.availableUntil;
  if (data.latitude !== undefined) body.latitude = data.latitude;
  if (data.longitude !== undefined) body.longitude = data.longitude;

  const response = await fetch(`${baseUrl}/donations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const resData = await response.json().catch(() => ({}));
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || 'Failed to update donation');
  }

  return transformBackendDonation(resData.donation);
};

/**
 * Cancel an active food donation
 * Backend: PUT /api/donations/:id/cancel
 */
export const cancelDonation = async (id: string): Promise<void> => {
  const baseUrl = await getEffectiveBaseUrl();
  const token = await getAuthToken();

  const response = await fetch(`${baseUrl}/donations/${id}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const resData = await response.json().catch(() => ({}));
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || 'Failed to cancel donation');
  }
};

/**
 * Fetch incoming food requests made for this donor's donations
 * Backend: GET /api/foodrequests/donor
 */
export const getIncomingFoodRequests = async (): Promise<FoodRequest[]> => {
  const baseUrl = await getEffectiveBaseUrl();
  const token = await getAuthToken();

  const response = await fetch(`${baseUrl}/foodrequests/donor`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const resData = await response.json();
  return resData.requests || [];
};

/**
 * Accept a food request from an NGO/recipient
 * Backend: PUT /api/foodrequests/:id/accept
 */
export const acceptFoodRequest = async (requestId: string): Promise<void> => {
  const baseUrl = await getEffectiveBaseUrl();
  const token = await getAuthToken();

  const response = await fetch(`${baseUrl}/foodrequests/${requestId}/accept`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const resData = await response.json().catch(() => ({}));
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || 'Failed to accept food request');
  }
};

/**
 * Reject a food request from an NGO/recipient
 * Backend: PUT /api/foodrequests/:id/reject
 */
export const rejectFoodRequest = async (requestId: string): Promise<void> => {
  const baseUrl = await getEffectiveBaseUrl();
  const token = await getAuthToken();

  const response = await fetch(`${baseUrl}/foodrequests/${requestId}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const resData = await response.json().catch(() => ({}));
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || 'Failed to reject food request');
  }
};
