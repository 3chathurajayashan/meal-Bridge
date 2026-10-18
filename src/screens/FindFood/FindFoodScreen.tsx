import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING } from '../../constants/theme';
import { FoodItem, FoodCategory } from '../../types/food';
import Header from '../../components/common/Header';
import SearchBar from '../../components/common/SearchBar';
import CategoryFilter from '../../components/food/CategoryFilter';
import FoodCard from '../../components/food/FoodCard';
import FilterModal from '../../components/food/FilterModal';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import SafeIcon from '../../components/common/SafeIcon';
import { useApp } from '../../context/AppContext';

interface FindFoodScreenProps {
  onNavigateToFoodDetails: (item: FoodItem) => void;
  onNavigateToRequestFood: (item: FoodItem) => void;
  onNotificationPress: () => void;
  onProfilePress: () => void;
}

export const FindFoodScreen: React.FC<FindFoodScreenProps> = ({
  onNavigateToFoodDetails,
  onNavigateToRequestFood,
  onNotificationPress,
  onProfilePress,
}) => {
  const {
    foods,
    filters,
    isLoading,
    isRefreshing,
    refreshData,
    setSearchQuery,
    setCategory,
    setFilters,
    resetFilters,
  } = useApp();

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.maxDistanceKm < 50 ||
    filters.expiryWindow !== 'all' ||
    filters.fulfillmentType !== 'all';

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="Find Food"
        subtitle="Discover surplus donations nearby"
        onNotificationPress={onNotificationPress}
        onProfilePress={onProfilePress}
      />

      {/* Search Bar & Filter Button */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={filters.searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search food, dishes, donors..."
          onFilterPress={() => setIsFilterModalVisible(true)}
          hasActiveFilters={hasActiveFilters}
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Category Pills Horizontal Scroll */}
      <View style={styles.categoryContainer}>
        <CategoryFilter
          selectedCategory={filters.category}
          onSelectCategory={(cat) => setCategory(cat)}
        />
      </View>

      {/* Results Header / Active Filters Strip */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {foods.length} {foods.length === 1 ? 'item available' : 'items available'}
        </Text>

        {hasActiveFilters && (
          <Pressable onPress={resetFilters} style={styles.resetButton} hitSlop={8}>
            <SafeIcon name="refresh" size={12} color={COLORS.primaryDark} style={{ marginRight: 4 }} />
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </Pressable>
        )}
      </View>

      {/* Food Cards List */}
      {isLoading ? (
        <LoadingState message="Loading surplus food..." />
      ) : foods.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Matching Food Found"
          description="We couldn't find any donations matching your current search and filters. Try adjusting your criteria."
          actionTitle="Reset Filters"
          onAction={resetFilters}
        />
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FoodCard
              item={item}
              onPress={() => onNavigateToFoodDetails(item)}
              onRequestPress={() => onNavigateToRequestFood(item)}
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

      {/* Filter Modal Bottom Sheet */}
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={resetFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  categoryContainer: {
    marginBottom: SPACING.xs,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  resultsCount: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
  },
  resetButtonText: {
    fontSize: 11,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDark,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
    paddingTop: SPACING.xs,
  },
});

export default FindFoodScreen;
