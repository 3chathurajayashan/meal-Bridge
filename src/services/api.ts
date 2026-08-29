/**
 * API Client Configuration
 * Pre-configured for seamless REST API integration with base URL and auth headers
 */

const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.mealbridge.org/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const headers: Record<string, string> = { ...API_CONFIG.headers };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      // In development or when offline, callers will fallback to local mock data
      throw error;
    }
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    const headers: Record<string, string> = { ...API_CONFIG.headers };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  },
};

export default apiClient;
