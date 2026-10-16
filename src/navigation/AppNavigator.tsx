import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, StatusBar, Platform } from 'react-native';
import COLORS from '../constants/colors';
import { RADIUS, FONTS, SHADOWS, SPACING } from '../constants/theme';
import { FoodItem, FoodCategory } from '../types/food';
import { FoodRequest } from '../types/request';
import SafeIcon from '../components/common/SafeIcon';
import { useApp } from '../context/AppContext';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import FindFoodScreen from '../screens/FindFood/FindFoodScreen';
import FoodDetailsScreen from '../screens/FoodDetails/FoodDetailsScreen';
import RequestFoodScreen from '../screens/RequestFood/RequestFoodScreen';
import MyRequestsScreen from '../screens/MyRequests/MyRequestsScreen';
import RequestTrackingScreen from '../screens/Tracking/RequestTrackingScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

type TabKey = 'home' | 'find_food' | 'my_requests' | 'notifications' | 'profile';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, unreadNotificationsCount } = useApp();

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [activeStack, setActiveStack] = useState<{
    screen: 'tabs' | 'food_details' | 'request_food' | 'tracking' | 'auth_register';
    data?: any;
  }>({ screen: 'tabs' });

  const [requestsTabFilter, setRequestsTabFilter] = useState<string>('All');

  // If not authenticated, show Auth flow
  if (!isAuthenticated) {
    if (activeStack.screen === 'auth_register') {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
          <RegisterScreen
            onNavigateToLogin={() => setActiveStack({ screen: 'tabs' })}
            onRegisterSuccess={() => setActiveStack({ screen: 'tabs' })}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <LoginScreen
          onNavigateToRegister={() => setActiveStack({ screen: 'auth_register' })}
          onLoginSuccess={() => setActiveStack({ screen: 'tabs' })}
        />
      </SafeAreaView>
    );
  }

  // Handle Stack Screen Renders
  if (activeStack.screen === 'food_details' && activeStack.data) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <FoodDetailsScreen
          foodItem={activeStack.data as FoodItem}
          onBack={() => setActiveStack({ screen: 'tabs' })}
          onRequestPress={() =>
            setActiveStack({
              screen: 'request_food',
              data: activeStack.data,
            })
          }
        />
      </SafeAreaView>
    );
  }

  if (activeStack.screen === 'request_food' && activeStack.data) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <RequestFoodScreen
          foodItem={activeStack.data as FoodItem}
          onBack={() =>
            setActiveStack({
              screen: 'food_details',
              data: activeStack.data,
            })
          }
          onViewCreatedRequest={(request: FoodRequest) => {
            setActiveStack({
              screen: 'tracking',
              data: request,
            });
          }}
          onGoHome={() => {
            setActiveTab('home');
            setActiveStack({ screen: 'tabs' });
          }}
        />
      </SafeAreaView>
    );
  }

  if (activeStack.screen === 'tracking' && activeStack.data) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <RequestTrackingScreen
          request={activeStack.data as FoodRequest}
          onBack={() => {
            setActiveTab('my_requests');
            setActiveStack({ screen: 'tabs' });
          }}
        />
      </SafeAreaView>
    );
  }

  // Render Bottom Tab Screen
  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateToFindFood={(cat?: FoodCategory) => {
              setActiveTab('find_food');
            }}
            onNavigateToFoodDetails={(item: FoodItem) => {
              setActiveStack({ screen: 'food_details', data: item });
            }}
            onNavigateToRequestFood={(item: FoodItem) => {
              setActiveStack({ screen: 'request_food', data: item });
            }}
            onNavigateToMyRequests={(statusFilter?: string) => {
              if (statusFilter) setRequestsTabFilter(statusFilter);
              setActiveTab('my_requests');
            }}
            onNavigateToNotifications={() => setActiveTab('notifications')}
            onNavigateToProfile={() => setActiveTab('profile')}
          />
        );

      case 'find_food':
        return (
          <FindFoodScreen
            onNavigateToFoodDetails={(item: FoodItem) => {
              setActiveStack({ screen: 'food_details', data: item });
            }}
            onNavigateToRequestFood={(item: FoodItem) => {
              setActiveStack({ screen: 'request_food', data: item });
            }}
            onNotificationPress={() => setActiveTab('notifications')}
            onProfilePress={() => setActiveTab('profile')}
          />
        );

      case 'my_requests':
        return (
          <MyRequestsScreen
            initialFilter={requestsTabFilter}
            onNavigateToTracking={(req: FoodRequest) => {
              setActiveStack({ screen: 'tracking', data: req });
            }}
            onNavigateToFindFood={() => setActiveTab('find_food')}
            onNotificationPress={() => setActiveTab('notifications')}
            onProfilePress={() => setActiveTab('profile')}
          />
        );

      case 'notifications':
        return (
          <NotificationsScreen
            onNavigateToTracking={(req: FoodRequest) => {
              setActiveStack({ screen: 'tracking', data: req });
            }}
            onNavigateToFindFood={() => setActiveTab('find_food')}
            onProfilePress={() => setActiveTab('profile')}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            onNavigateToRequestsHistory={() => {
              setRequestsTabFilter('All');
              setActiveTab('my_requests');
            }}
            onLogout={() => {
              setActiveStack({ screen: 'tabs' });
            }}
          />
        );

      default:
        return null;
    }
  };

  const TAB_ITEMS: { key: TabKey; label: string; icon: string; iconActive: string }[] = [
    { key: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
    { key: 'find_food', label: 'Find Food', icon: 'search-outline', iconActive: 'search' },
    { key: 'my_requests', label: 'My Requests', icon: 'cube-outline', iconActive: 'cube' },
    { key: 'notifications', label: 'Alerts', icon: 'notifications-outline', iconActive: 'notifications' },
    { key: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.mainWrapper}>
        {/* Active Screen Content */}
        <View style={styles.screenContent}>{renderCurrentTab()}</View>

        {/* Bottom Tab Navigation Bar */}
        <View style={[styles.bottomTabBar, SHADOWS.floatingBar]}>
          {TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  if (tab.key === 'my_requests') setRequestsTabFilter('All');
                  setActiveTab(tab.key);
                }}
                style={styles.tabButton}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >
                <View style={styles.tabIconWrap}>
                  <SafeIcon
                    name={isActive ? tab.iconActive : tab.icon}
                    size={22}
                    color={isActive ? COLORS.primary : COLORS.textDisabled}
                  />
                  {tab.key === 'notifications' && unreadNotificationsCount > 0 && (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mainWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    width: '100%',
    alignSelf: 'center',
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: COLORS.border,
  },
  screenContent: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabIconWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: COLORS.primary, // Orange 500
    borderRadius: RADIUS.round,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONTS.weight.bold,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: FONTS.weight.semibold,
  },
  tabLabelActive: {
    color: COLORS.primary, // Orange 500
    fontWeight: FONTS.weight.bold,
  },
  tabLabelInactive: {
    color: COLORS.textDisabled,
  },
});

export default AppNavigator;
