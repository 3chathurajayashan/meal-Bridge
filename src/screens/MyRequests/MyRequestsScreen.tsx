import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING } from '../../constants/theme';
import { FoodRequest } from '../../types/request';
import Header from '../../components/common/Header';
import RequestCard from '../../components/request/RequestCard';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { useApp } from '../../context/AppContext';

interface MyRequestsScreenProps {
  onNavigateToTracking: (request: FoodRequest) => void;
  onNavigateToFindFood: () => void;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  initialFilter?: string;
}

const TABS = ['All', 'Pending', 'Accepted', 'Completed'];

export const MyRequestsScreen: React.FC<MyRequestsScreenProps> = ({
  onNavigateToTracking,
  onNavigateToFindFood,
  onNotificationPress,
  onProfilePress,
  initialFilter = 'All',
}) => {
  const { requests, isLoading, isRefreshing, refreshData, cancelRequest } = useApp();
  const [activeTab, setActiveTab] = useState<string>(initialFilter);

  // Filter requests based on tab
  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return req.status === 'Pending';
    if (activeTab === 'Accepted') {
      return req.status === 'Accepted' || req.status === 'Reserved' || req.status === 'In Transit';
    }
    if (activeTab === 'Completed') {
      return req.status === 'Delivered' || req.status === 'Collected' || req.status === 'Cancelled';
    }
    return true;
  });

  const handleCancelRequest = (request: FoodRequest) => {
    Alert.alert(
      'Cancel Request',
      `Are you sure you want to cancel request ${request.requestCode} for ${request.foodTitle}?`,
      [
        { text: 'No, Keep Request', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelRequest(request.id, 'Cancelled by recipient');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Requests"
        subtitle="Manage and track your food claims"
        onNotificationPress={onNotificationPress}
        onProfilePress={onProfilePress}
      />

      {/* Segmented Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, isSelected && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Requests List */}
      {isLoading ? (
        <LoadingState message="Loading your food requests..." />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="No Requests In This Tab"
          description={
            activeTab === 'All'
              ? 'You have not made any food requests yet. Browse surplus food donations near you!'
              : `You currently have no ${activeTab.toLowerCase()} requests.`
          }
          actionTitle="Find Food Now 🍱"
          onAction={onNavigateToFindFood}
        />
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              onPressTrack={() => onNavigateToTracking(item)}
              onPressCancel={() => handleCancelRequest(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshData}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSecondary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    padding: 4,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: COLORS.primary, // Orange 500
  },
  tabText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: 40,
  },
});

export default MyRequestsScreen;
