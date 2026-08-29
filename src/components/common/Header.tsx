import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING } from '../../constants/theme';
import SafeIcon from './SafeIcon';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  showActions?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  onNotificationPress,
  onProfilePress,
  showActions = true,
}) => {
  const { user, unreadNotificationsCount } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <SafeIcon name="arrow-back" size={22} color={COLORS.black} />
          </Pressable>
        ) : (
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <SafeIcon name="restaurant" size={18} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.appName}>Community Food Connect</Text>
              <Text style={styles.welcomeText}>
                {subtitle || `Welcome back!  ${user?.fullName ? user.fullName.split(' ')[0] : ''}`}
              </Text>
            </View>
          </View>
        )}

        {showBack && title && (
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>

      {showActions && (
        <View style={styles.rightSection}>
          {onNotificationPress && (
            <Pressable
              onPress={onNotificationPress}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel={`Notifications, ${unreadNotificationsCount} unread`}
            >
              <SafeIcon name="notifications-outline" size={24} color={COLORS.black} />
              {unreadNotificationsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </Pressable>
          )}

          {onProfilePress && (
            <Pressable
              onPress={onProfilePress}
              style={styles.avatarButton}
              accessibilityRole="button"
              accessibilityLabel="View profile"
            >
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {user?.fullName ? user.fullName[0] : 'U'}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary, // Orange 500
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  appName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.primaryDark,
    letterSpacing: -0.2,
  },
  welcomeText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.black,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  pageSubtitle: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
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
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONTS.weight.bold,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: COLORS.primaryDark,
    fontWeight: FONTS.weight.bold,
    fontSize: FONTS.size.md,
  },
});

export default Header;
