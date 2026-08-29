import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING } from '../../constants/theme';
import SafeIcon from './SafeIcon';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true,
}) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'available':
        return {
          bg: COLORS.statusAvailableBg,
          text: COLORS.statusAvailable,
          icon: 'checkmark-circle',
          label: 'Available',
        };
      case 'pending':
        return {
          bg: COLORS.statusPendingBg,
          text: '#B45309', // Dark amber for readability
          icon: 'time',
          label: 'Pending',
        };
      case 'accepted':
        return {
          bg: COLORS.statusAcceptedBg,
          text: COLORS.statusAccepted,
          icon: 'checkmark',
          label: 'Accepted',
        };
      case 'reserved':
        return {
          bg: COLORS.primarySoft,
          text: COLORS.primaryDark,
          icon: 'cube',
          label: 'Reserved',
        };
      case 'in transit':
      case 'in_transit':
        return {
          bg: COLORS.statusInTransitBg,
          text: COLORS.statusInTransit,
          icon: 'bicycle',
          label: 'In Transit',
        };
      case 'collected':
        return {
          bg: COLORS.statusCompletedBg,
          text: COLORS.statusCompleted,
          icon: 'checkmark-circle',
          label: 'Collected',
        };
      case 'delivered':
        return {
          bg: COLORS.statusDeliveredBg,
          text: COLORS.statusDelivered,
          icon: 'checkmark-circle',
          label: 'Delivered',
        };
      case 'cancelled':
        return {
          bg: COLORS.statusCancelledBg,
          text: COLORS.statusCancelled,
          icon: 'close-circle',
          label: 'Cancelled',
        };
      case 'expired':
        return {
          bg: COLORS.statusExpiredBg,
          text: COLORS.statusExpired,
          icon: 'time',
          label: 'Expired',
        };
      default:
        return {
          bg: COLORS.surfaceMuted,
          text: COLORS.textSecondary,
          icon: 'information-circle',
          label: status,
        };
    }
  };

  const config = getStatusConfig();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
        },
      ]}
    >
      {showIcon && (
        <SafeIcon
          name={config.icon}
          size={isSmall ? 11 : 13}
          color={config.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSmall ? FONTS.size.xs : FONTS.size.sm,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.round,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: SPACING.xs,
  },
  text: {
    fontWeight: FONTS.weight.semibold,
    letterSpacing: 0.2,
  },
});

export default StatusBadge;
