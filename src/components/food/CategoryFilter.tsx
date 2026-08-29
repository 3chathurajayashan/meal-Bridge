import React from 'react';
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING } from '../../constants/theme';
import { FoodCategory } from '../../types/food';
import SafeIcon from '../common/SafeIcon';

interface CategoryFilterProps {
  categories?: FoodCategory[];
  selectedCategory: FoodCategory;
  onSelectCategory: (category: FoodCategory) => void;
}

const DEFAULT_CATEGORIES: FoodCategory[] = [
  'All',
  'Rice & Meals',
  'Bakery',
  'Fruits',
  'Vegetables',
  'Groceries',
  'Beverages',
];

const CATEGORY_ICONS: Record<FoodCategory, string> = {
  'All': 'restaurant',
  'Rice & Meals': 'restaurant',
  'Bakery': 'bread-slice',
  'Fruits': 'nutrition',
  'Vegetables': 'leaf',
  'Groceries': 'cart',
  'Beverages': 'beer',
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories = DEFAULT_CATEGORIES,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        const iconName = CATEGORY_ICONS[category] || 'restaurant';

        return (
          <Pressable
            key={category}
            onPress={() => onSelectCategory(category)}
            style={[
              styles.pill,
              isSelected ? styles.pillSelected : styles.pillUnselected,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Filter by ${category}`}
          >
            <SafeIcon
              name={iconName}
              size={15}
              color={isSelected ? COLORS.white : COLORS.primary}
              style={styles.pillIcon}
            />
            <Text
              style={[
                styles.pillText,
                isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
  },
  pillSelected: {
    backgroundColor: COLORS.primary, // Orange 500
    borderColor: COLORS.primary,
  },
  pillUnselected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary, // Orange border
  },
  pillIcon: {
    marginRight: SPACING.xs,
  },
  pillText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
  pillTextSelected: {
    color: COLORS.white,
  },
  pillTextUnselected: {
    color: COLORS.black, // Black text
  },
});

export default CategoryFilter;
