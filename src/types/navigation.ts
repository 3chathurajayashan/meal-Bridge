import { FoodItem } from './food';
import { FoodRequest } from './request';

export type RootTabParamList = {
  HomeTab: undefined;
  FindFoodTab: { category?: string } | undefined;
  MyRequestsTab: { filterStatus?: string } | undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: { screen?: keyof RootTabParamList; params?: any } | undefined;
  FoodDetails: { foodId: string; item?: FoodItem };
  RequestFood: { foodItem: FoodItem };
  RequestTracking: { requestId: string; request?: FoodRequest };
  EditProfile: undefined;
  HelpSupport: undefined;
  Login: undefined;
  Register: undefined;
};
