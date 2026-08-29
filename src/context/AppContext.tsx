import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FoodItem, FoodFilters, FoodCategory } from '../types/food';
import { FoodRequest, CreateRequestPayload } from '../types/request';
import { AppNotification } from '../types/notification';
import { RecipientProfile, SupportedLanguage } from '../types/user';
import { foodService } from '../services/foodService';

const DEFAULT_FILTERS: FoodFilters = {
  searchQuery: '',
  category: 'All',
  maxDistanceKm: 15,
  availability: 'all',
  expiryWindow: 'all',
  fulfillmentType: 'all',
};

interface AppContextType {
  // State
  user: RecipientProfile | null;
  isAuthenticated: boolean;
  foods: FoodItem[];
  requests: FoodRequest[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  filters: FoodFilters;
  isLoading: boolean;
  isRefreshing: boolean;
  selectedCategory: FoodCategory;

  // Actions
  refreshData: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setCategory: (category: FoodCategory) => void;
  setFilters: (newFilters: Partial<FoodFilters>) => void;
  resetFilters: () => void;
  createRequest: (payload: CreateRequestPayload) => Promise<FoodRequest>;
  cancelRequest: (requestId: string, reason?: string) => Promise<boolean>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  updateProfile: (updates: Partial<RecipientProfile>) => Promise<void>;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RecipientProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filters, setFiltersState] = useState<FoodFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Initial fetch
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter effect
  useEffect(() => {
    loadFilteredFoods();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [userProfile, foodsList, requestsList, notifsList] = await Promise.all([
        foodService.getUserProfile(),
        foodService.getFoods(filters),
        foodService.getRequests(),
        foodService.getNotifications(),
      ]);

      setUser(userProfile);
      setFoods(foodsList);
      setRequests(requestsList);
      setNotifications(notifsList);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilteredFoods = async () => {
    try {
      const foodsList = await foodService.getFoods(filters);
      setFoods(foodsList);
    } catch (error) {
      console.error('Error filtering foods:', error);
    }
  };

  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      const [userProfile, foodsList, requestsList, notifsList] = await Promise.all([
        foodService.getUserProfile(),
        foodService.getFoods(filters),
        foodService.getRequests(),
        foodService.getNotifications(),
      ]);

      setUser(userProfile);
      setFoods(foodsList);
      setRequests(requestsList);
      setNotifications(notifsList);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const setSearchQuery = (query: string) => {
    setFiltersState((prev) => ({ ...prev, searchQuery: query }));
  };

  const setCategory = (category: FoodCategory) => {
    setFiltersState((prev) => ({ ...prev, category }));
  };

  const setFilters = (newFilters: Partial<FoodFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
  };

  const createRequest = async (payload: CreateRequestPayload): Promise<FoodRequest> => {
    const newReq = await foodService.createRequest(payload);
    await refreshData();
    return newReq;
  };

  const cancelRequest = async (requestId: string, reason?: string): Promise<boolean> => {
    const success = await foodService.cancelRequest(requestId, reason);
    await refreshData();
    return success;
  };

  const markNotificationAsRead = async (id: string) => {
    await foodService.markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = async () => {
    await foodService.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const updateProfile = async (updates: Partial<RecipientProfile>) => {
    const updated = await foodService.updateUserProfile(updates);
    setUser(updated);
  };

  const setLanguage = async (lang: SupportedLanguage) => {
    await updateProfile({ preferredLanguage: lang });
  };

  const login = async (email: string) => {
    setIsAuthenticated(true);
    await refreshData();
  };

  const logout = async () => {
    setIsAuthenticated(false);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        foods,
        requests,
        notifications,
        unreadNotificationsCount,
        filters,
        isLoading,
        isRefreshing,
        selectedCategory: filters.category,
        refreshData,
        setSearchQuery,
        setCategory,
        setFilters,
        resetFilters,
        createRequest,
        cancelRequest,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updateProfile,
        setLanguage,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
