import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING } from '../../constants/theme';
import { AppNotification } from '../../types/notification';
import { FoodRequest } from '../../types/request';
import Header from '../../components/common/Header';
import NotificationCard from '../../components/notification/NotificationCard';
import EmptyState from '../../components/common/EmptyState';
import SafeIcon from '../../components/common/SafeIcon';
import { useApp } from '../../context/AppContext';

interface NotificationsScreenProps {
  onNavigateToTracking?: (request: FoodRequest) => void;
  onNavigateToFindFood?: () => void;
  onProfilePress?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onNavigateToTracking,
  onNavigateToFindFood,
  onProfilePress,
}) => {
  const {
    notifications,
    requests,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();

  const handleNotificationPress = async (notification: AppNotification) => {
    await markNotificationAsRead(notification.id);

    if (notification.relatedRequestId && onNavigateToTracking) {
      const matchedReq = requests.find((r) => r.id === notification.relatedRequestId);
      if (matchedReq) {
        onNavigateToTracking(matchedReq);
      }
    } else if (onNavigateToFindFood) {
      onNavigateToFindFood();
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        subtitle={
          unreadNotificationsCount > 0
            ? `${unreadNotificationsCount} unread update${unreadNotificationsCount === 1 ? '' : 's'}`
            : 'All caught up'
        }
        onProfilePress={onProfilePress}
        showActions={false}
      />

      {/* Subheader with Mark All as Read */}
      <View style={styles.subHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {unreadNotificationsCount > 0 && (
          <Pressable onPress={markAllNotificationsAsRead} style={styles.markReadBtn} hitSlop={8}>
            <SafeIcon name="checkmark-done" size={14} color={COLORS.primaryDark} style={{ marginRight: 4 }} />
            <Text style={styles.markReadText}>Mark all as read</Text>
          </Pressable>
        )}
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No Notifications Yet"
          description="You'll receive live status alerts when donors accept your food requests or when volunteers start deliveries."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={() => handleNotificationPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  markReadText: {
    fontSize: 11,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDark,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: 40,
  },
});

export default NotificationsScreen;
