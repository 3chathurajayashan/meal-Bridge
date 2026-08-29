export type SupportedLanguage = 'en' | 'si' | 'ta';

export interface RecipientProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  householdMembersCount: number;
  dietaryPreferences: string[];
  preferredLanguage: SupportedLanguage;
  avatarUrl: string;
  isVerified: boolean;
  totalMealsReceived: number;
  totalKilogramsSaved: number;
  joinDate: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: RecipientProfile | null;
  token?: string;
}
