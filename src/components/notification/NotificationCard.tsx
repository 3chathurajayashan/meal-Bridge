import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { AppNotification } from '../../types/notification';
import SafeIcon from '../common/SafeIcon';

interface NotificationCardProps {
  notification: AppNotification;
  onPress: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
}) => {
  const getIconConfig = () => {
    switch (notification.type) {
      case 'delivery_started':
      case 'volunteer_assigned':
        return {
          icon: 'bicycle',
          bg: COLORS.statusInTransitBg,
          color: COLORS.statusInTransit,
        };
      case 'request_accepted':
        return {
          icon: 'checkmark-circle',
          bg: COLORS.statusAcceptedBg,
          color: COLORS.statusAccepted,
        };
      case 'ready_for_pickup':
        return {
          icon: 'location',
          bg: COLORS.primarySoft,
          color: COLORS.primaryDark,
        };
      case 'food_delivered':
        return {
          icon: 'gift',
          bg: COLORS.statusCompletedBg,
          color: COLORS.statusCompleted,
        };
      case 'request_cancelled':
        return {
          icon: 'close-circle',
          bg: COLORS.statusCancelledBg,
          color: COLORS.statusCancelled,
        };
      case 'food_expired':
        return {
          icon: 'time',
          bg: COLORS.statusExpiredBg,
          color: COLORS.statusExpired,
        };
      case 'new_donation_nearby':
      default:
        return {
          icon: 'restaurant',
          bg: COLORS.primaryBg,
          color: COLORS.primary,
        };
    }
  };

  const config = getIconConfig();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !notification.isRead && styles.cardUnread,
        SHADOWS.card,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}: ${notification.message}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
        <SafeIcon name={config.icon} size={20} color={config.color} />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              !notification.isRead && styles.titleUnread,
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.message} numberOfLines={3}>
          {notification.message}
        </Text>

        <Text style={styles.timestamp}>{notification.timestamp}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  cardUnread: {
    borderColor: COLORS.primarySoft,
    backgroundColor: '#FFFDFB',
  },
  cardPressed: {
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    flex: 1,
  },
  titleUnread: {
    color: COLORS.primaryDark,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.primary, // Orange 500
    marginLeft: SPACING.xs,
  },
  message: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: FONTS.weight.medium,
  },
});

export default NotificationCard;
