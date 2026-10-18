import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SHADOWS, SPACING } from '../../constants/theme';
import { FoodItem } from '../../types/food';
import StatusBadge from '../common/StatusBadge';
import PrimaryButton from '../common/PrimaryButton';
import SafeIcon from '../common/SafeIcon';

interface FoodCardProps {
  item: FoodItem;
  onPress: () => void;
  onRequestPress: () => void;
  layout?: 'vertical' | 'horizontal';
}

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  onPress,
  onRequestPress,
  layout = 'vertical',
}) => {
  const isHorizontal = layout === 'horizontal';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isHorizontal ? styles.cardHorizontal : styles.cardVertical,
        SHADOWS.card,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} from ${item.donor.name}`}
    >
      {/* Food Image & Badges */}
      <View style={isHorizontal ? styles.imageWrapHorizontal : styles.imageWrapVertical}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Category Pill Overlay */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>

        {/* Expiry Pill */}
        <View style={styles.expiryBadge}>
          <SafeIcon name="time" size={11} color={COLORS.white} style={{ marginRight: 3 }} />
          <Text style={styles.expiryBadgeText}>
            {item.expiresInHours <= 3
              ? `Expires in ${item.expiresInHours}h`
              : `${item.expiresInHours}h left`}
          </Text>
        </View>
      </View>

      {/* Content Body */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </View>

        {/* Donor Info */}
        <View style={styles.donorRow}>
          <SafeIcon name="restaurant" size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.donorName} numberOfLines={1}>
            {item.donor.name}
          </Text>
          <View style={styles.donorTypePill}>
            <Text style={styles.donorTypeText}>{item.donor.type}</Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.metaContainer}>
          {/* Location & Distance */}
          <View style={styles.metaRow}>
            <SafeIcon name="location" size={13} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.location} • <Text style={styles.boldText}>{item.distanceText}</Text>
            </Text>
          </View>

          {/* Quantity */}
          <View style={styles.metaRow}>
            <SafeIcon name="cube" size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>
              Available: <Text style={styles.boldText}>{item.availableQuantity} {item.unit}</Text>
            </Text>
          </View>
        </View>

        {/* Footer: Status & Action Button */}
        <View style={styles.footerRow}>
          <StatusBadge status={item.status} size="small" />

          <View style={styles.actionBtnWrap}>
            <PrimaryButton
              title="Request Food"
              onPress={onRequestPress}
              size="small"
              iconName="cube"
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardVertical: {
    width: '100%',
  },
  cardHorizontal: {
    width: 280,
    marginRight: SPACING.md,
    marginBottom: SPACING.xs,
  },
  cardPressed: {
    borderColor: COLORS.primary,
  },
  imageWrapVertical: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: COLORS.surfaceSecondary,
  },
  imageWrapHorizontal: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: COLORS.surfaceSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.xs,
  },
  categoryBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },
  expiryBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.primary, // Orange 500
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.round,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },
  content: {
    padding: SPACING.md,
  },
  topRow: {
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    lineHeight: 20,
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  donorName: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textSecondary,
    maxWidth: 160,
  },
  donorTypePill: {
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginLeft: SPACING.xs,
  },
  donorTypeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONTS.weight.medium,
  },
  metaContainer: {
    backgroundColor: COLORS.surfaceSecondary,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: 4,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
  boldText: {
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    paddingTop: 2,
  },
  actionBtnWrap: {
    flex: 1,
    maxWidth: 150,
  },
});

export default FoodCard;
