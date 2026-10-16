import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SHADOWS, SPACING } from '../../constants/theme';
import SafeIcon from './SafeIcon';

interface StatCardProps {
  icon: string;
  count: number | string;
  label: string;
  onPress?: () => void;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  count,
  label,
  onPress,
  accentColor = COLORS.primary,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        SHADOWS.card,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${count}`}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryBg }]}>
          <SafeIcon name={icon} size={18} color={accentColor} />
        </View>
        <Text style={styles.countText}>{count}</Text>
      </View>
      <Text style={styles.labelText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    minWidth: 74,
  },
  cardPressed: {
    borderColor: COLORS.primary,
    transform: [{ scale: 0.98 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.black,
  },
  labelText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default StatCard;
