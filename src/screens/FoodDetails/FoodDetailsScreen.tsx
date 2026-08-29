import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Linking,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { FoodItem } from '../../types/food';
import StatusBadge from '../../components/common/StatusBadge';
import PrimaryButton from '../../components/common/PrimaryButton';
import MapPreview from '../../components/food/MapPreview';
import SafeIcon from '../../components/common/SafeIcon';

interface FoodDetailsScreenProps {
  foodItem: FoodItem;
  onBack: () => void;
  onRequestPress: () => void;
}

export const FoodDetailsScreen: React.FC<FoodDetailsScreenProps> = ({
  foodItem,
  onBack,
  onRequestPress,
}) => {
  const handleCallDonor = () => {
    Linking.openURL(`tel:${foodItem.donor.phone}`).catch((err) =>
      console.error('Call failed', err)
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: foodItem.imageUrl }} style={styles.heroImage} resizeMode="cover" />

          {/* Top Bar Floating Buttons */}
          <View style={styles.floatingTopBar}>
            <Pressable
              onPress={onBack}
              style={styles.circleBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <SafeIcon name="arrow-back" size={20} color={COLORS.black} />
            </Pressable>

            <View style={styles.rightFloatRow}>
              <View style={styles.expiryFloatBadge}>
                <SafeIcon name="time" size={12} color={COLORS.white} style={{ marginRight: 4 }} />
                <Text style={styles.expiryFloatText}>
                  {foodItem.expiresInHours <= 3
                    ? `Expires in ${foodItem.expiresInHours}h ⏰`
                    : `${foodItem.expiresInHours}h left`}
                </Text>
              </View>
            </View>
          </View>

          {/* Category Chip */}
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{foodItem.category}</Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Title & Status */}
          <View style={styles.titleRow}>
            <Text style={styles.foodTitle}>{foodItem.title}</Text>
            <View style={{ marginTop: 6 }}>
              <StatusBadge status={foodItem.status} />
            </View>
          </View>

          {/* Key Metrics Strip */}
          <View style={styles.metricsStrip}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Available Qty</Text>
              <Text style={styles.metricValue}>
                {foodItem.availableQuantity} {foodItem.unit}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>{foodItem.distanceText}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Pickup Type</Text>
              <Text style={styles.metricValue}>{foodItem.pickupType}</Text>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food Description</Text>
            <Text style={styles.descriptionText}>{foodItem.description}</Text>

            {/* Dietary Tags */}
            {foodItem.dietaryTags && foodItem.dietaryTags.length > 0 && (
              <View style={styles.tagsContainer}>
                {foodItem.dietaryTags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <SafeIcon name="checkmark" size={11} color={COLORS.primaryDark} style={{ marginRight: 3 }} />
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Allergen Notice */}
            {foodItem.allergens && foodItem.allergens.length > 0 && (
              <View style={styles.allergenBox}>
                <SafeIcon name="information-circle" size={16} color={COLORS.primaryDark} style={{ marginRight: 6 }} />
                <Text style={styles.allergenText}>
                  <Text style={{ fontWeight: 'bold' }}>Allergens / Ingredients:</Text>{' '}
                  {foodItem.allergens.join(', ')}
                </Text>
              </View>
            )}
          </View>

          {/* Donor Information Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donor Information</Text>
            <View style={[styles.donorCard, SHADOWS.card]}>
              <View style={styles.donorHeader}>
                {foodItem.donor.avatarUrl ? (
                  <Image source={{ uri: foodItem.donor.avatarUrl }} style={styles.donorAvatar} />
                ) : (
                  <View style={styles.donorAvatarFallback}>
                    <SafeIcon name="restaurant" size={20} color={COLORS.primary} />
                  </View>
                )}
                <View style={styles.donorDetails}>
                  <View style={styles.donorNameRow}>
                    <Text style={styles.donorName}>{foodItem.donor.name}</Text>
                    {foodItem.donor.verified && (
                      <SafeIcon name="checkmark-circle" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                    )}
                  </View>
                  <Text style={styles.donorType}>
                    {foodItem.donor.type} • ⭐ {foodItem.donor.rating} ({foodItem.donor.reviewsCount} reviews)
                  </Text>
                </View>

                <Pressable onPress={handleCallDonor} style={styles.callBtn} hitSlop={8}>
                  <SafeIcon name="call" size={16} color={COLORS.white} />
                </Pressable>
              </View>

              <View style={styles.donorAddressRow}>
                <SafeIcon name="location-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                <Text style={styles.donorAddressText}>{foodItem.donor.address}</Text>
              </View>
            </View>
          </View>

          {/* Timings & Expiry Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collection Timings</Text>
            <View style={styles.timingCard}>
              <View style={styles.timingRow}>
                <SafeIcon name="time-outline" size={18} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
                <View>
                  <Text style={styles.timingTitle}>Pickup Window Today</Text>
                  <Text style={styles.timingSubtitle}>
                    {foodItem.pickupStartTime} - {foodItem.pickupEndTime}
                  </Text>
                </View>
              </View>
              <View style={styles.timingRow}>
                <SafeIcon name="shield-checkmark" size={18} color={COLORS.statusCompleted} style={{ marginRight: SPACING.sm }} />
                <View>
                  <Text style={styles.timingTitle}>Food Safety Guidelines</Text>
                  <Text style={styles.timingSubtitle}>{foodItem.hygieneRating}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Map & Pickup Location Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <MapPreview
              locationName={foodItem.donor.name}
              address={foodItem.pickupAddress || foodItem.donor.address}
              distanceText={foodItem.distanceText}
              latitude={foodItem.coordinates.latitude}
              longitude={foodItem.coordinates.longitude}
            />
          </View>

          {/* Storage & Handling Information */}
          <View style={styles.section}>
            <View style={styles.safetyBox}>
              <SafeIcon name="information-circle" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.safetyTitle}>Safety & Storage Instructions</Text>
                <Text style={styles.safetyDesc}>{foodItem.storageInstructions}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Request Action Bar */}
      <View style={[styles.bottomActionBar, SHADOWS.floatingBar]}>
        <View style={styles.priceColumn}>
          <Text style={styles.bottomBarLabel}>Community Surplus</Text>
          <Text style={styles.bottomBarFree}>100% Free 🍱</Text>
        </View>

        <View style={styles.requestBtnContainer}>
          <PrimaryButton
            title="Request Food"
            onPress={onRequestPress}
            iconName="cube"
            size="large"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: COLORS.surfaceMuted,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingTopBar: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  rightFloatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryFloatBadge: {
    backgroundColor: COLORS.primary, // Orange 500
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  expiryFloatText: {
    color: COLORS.white,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },
  categoryChip: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  categoryChipText: {
    color: COLORS.white,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  titleRow: {
    marginBottom: SPACING.md,
  },
  foodTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.black,
    lineHeight: 28,
  },
  metricsStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  tagText: {
    fontSize: 11,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.primaryDark,
  },
  allergenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  allergenText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
  donorCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  donorAvatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceMuted,
  },
  donorAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donorDetails: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  donorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donorName: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  donorType: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donorAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  donorAddressText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
  timingCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timingTitle: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
  },
  timingSubtitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    marginTop: 1,
  },
  safetyBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryBg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  safetyTitle: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDark,
  },
  safetyDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  priceColumn: {
    justifyContent: 'center',
  },
  bottomBarLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomBarFree: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.primaryDark,
  },
  requestBtnContainer: {
    flex: 1,
  },
});

export default FoodDetailsScreen;
