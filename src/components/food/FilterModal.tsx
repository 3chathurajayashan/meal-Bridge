import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { FoodFilters, FoodCategory } from '../../types/food';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import SafeIcon from '../common/SafeIcon';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FoodFilters;
  onApplyFilters: (filters: Partial<FoodFilters>) => void;
  onResetFilters: () => void;
}

const CATEGORIES: FoodCategory[] = [
  'All',
  'Rice & Meals',
  'Bakery',
  'Fruits',
  'Vegetables',
  'Groceries',
  'Beverages',
];

const DISTANCE_OPTIONS = [
  { label: 'Any Distance', value: 50 },
  { label: '< 2 km', value: 2 },
  { label: '< 5 km', value: 5 },
  { label: '< 10 km', value: 10 },
];

const EXPIRY_OPTIONS: { label: string; value: 'all' | 'under3h' | 'today' | 'tomorrow' }[] = [
  { label: 'Any Time', value: 'all' },
  { label: 'Expires in < 3 Hours ', value: 'under3h' },
  { label: 'Expires Today', value: 'today' },
  { label: 'Within 24 Hours', value: 'tomorrow' },
];

const FULFILLMENT_OPTIONS: { label: string; value: 'all' | 'Pickup' | 'Delivery' }[] = [
  { label: 'All Options', value: 'all' },
  { label: 'Self Pickup ', value: 'Pickup' },
  { label: 'Volunteer Delivery ', value: 'Delivery' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>(filters.category);
  const [maxDistance, setMaxDistance] = useState<number>(filters.maxDistanceKm);
  const [expiryWindow, setExpiryWindow] = useState<'all' | 'under3h' | 'today' | 'tomorrow'>(filters.expiryWindow);
  const [fulfillmentType, setFulfillmentType] = useState<'all' | 'Pickup' | 'Delivery'>(filters.fulfillmentType);

  const handleApply = () => {
    onApplyFilters({
      category: selectedCategory,
      maxDistanceKm: maxDistance,
      expiryWindow,
      fulfillmentType,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('All');
    setMaxDistance(50);
    setExpiryWindow('all');
    setFulfillmentType('all');
    onResetFilters();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <SafeIcon name="filter" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Filter Food Surplus</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <SafeIcon name="close" size={20} color={COLORS.black} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Category Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Food Category</Text>
              <View style={styles.chipsWrap}>
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                    >
                      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Distance Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Maximum Distance</Text>
              <View style={styles.chipsWrap}>
                {DISTANCE_OPTIONS.map((opt) => {
                  const active = maxDistance === opt.value;
                  return (
                    <Pressable
                      key={opt.label}
                      onPress={() => setMaxDistance(opt.value)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                    >
                      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Expiry Window Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expiry Time</Text>
              <View style={styles.chipsWrap}>
                {EXPIRY_OPTIONS.map((opt) => {
                  const active = expiryWindow === opt.value;
                  return (
                    <Pressable
                      key={opt.label}
                      onPress={() => setExpiryWindow(opt.value)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                    >
                      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Pickup / Delivery Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pickup / Delivery Option</Text>
              <View style={styles.chipsWrap}>
                {FULFILLMENT_OPTIONS.map((opt) => {
                  const active = fulfillmentType === opt.value;
                  return (
                    <Pressable
                      key={opt.label}
                      onPress={() => setFulfillmentType(opt.value)}
                      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                    >
                      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <View style={styles.footerBtn}>
              <SecondaryButton title="Reset All" onPress={handleReset} size="medium" />
            </View>
            <View style={styles.footerBtn}>
              <PrimaryButton title="Apply Filters" onPress={handleApply} size="medium" />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '85%',
    paddingBottom: SPACING.xl,
    ...SHADOWS.floatingBar,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: COLORS.primary, // Orange 500
    borderColor: COLORS.primary,
  },
  chipInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  chipTextInactive: {
    color: COLORS.black,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerBtn: {
    flex: 1,
  },
});

export default FilterModal;
