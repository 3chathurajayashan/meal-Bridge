import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { FoodItem, FoodCategory } from '../../types/food';
import Header from '../../components/common/Header';
import SearchBar from '../../components/common/SearchBar';
import StatCard from '../../components/common/StatCard';
import FoodCard from '../../components/food/FoodCard';
import CategoryFilter from '../../components/food/CategoryFilter';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import SafeIcon from '../../components/common/SafeIcon';
import { useApp } from '../../context/AppContext';

interface HomeScreenProps {
  onNavigateToFindFood: (category?: FoodCategory) => void;
  onNavigateToFoodDetails: (item: FoodItem) => void;
  onNavigateToRequestFood: (item: FoodItem) => void;
  onNavigateToMyRequests: (statusFilter?: string) => void;
  onNavigateToNotifications: () => void;
  onNavigateToProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToFindFood,
  onNavigateToFoodDetails,
  onNavigateToRequestFood,
  onNavigateToMyRequests,
  onNavigateToNotifications,
  onNavigateToProfile,
}) => {
  const {
    foods,
    requests,
    isLoading,
    isRefreshing,
    refreshData,
    selectedCategory,
    setCategory,
  } = useApp();

  // Calculate statistics
  const availableCount = foods.filter((f) => f.status === 'Available').length;
  const activeRequestsCount = requests.filter(
    (r) => r.status === 'Pending' || r.status === 'Accepted' || r.status === 'Reserved' || r.status === 'In Transit'
  ).length;
  const acceptedCount = requests.filter((r) => r.status === 'Accepted' || r.status === 'Reserved').length;
  const completedCount = requests.filter((r) => r.status === 'Delivered' || r.status === 'Collected').length;

  const urgentDonations = foods.filter((f) => f.expiresInHours <= 4);
  const nearbyFoods = foods.slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <Header
        onNotificationPress={onNavigateToNotifications}
        onProfilePress={onNavigateToProfile}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            onPress={() => onNavigateToFindFood()}
            editable={false}
            placeholder="Search for available food..."
          />
        </View>

        {/* Quick Statistics Bento Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.sectionSubtitle}>Live Surplus Activity</Text>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon="restaurant"
              count={availableCount}
              label="Available Food"
              onPress={() => onNavigateToFindFood()}
              accentColor={COLORS.primary}
            />
            <StatCard
              icon="cube"
              count={activeRequestsCount}
              label="My Requests"
              onPress={() => onNavigateToMyRequests('All')}
              accentColor={COLORS.primaryDark}
            />
            <StatCard
              icon="checkmark-circle"
              count={acceptedCount}
              label="Accepted"
              onPress={() => onNavigateToMyRequests('Accepted')}
              accentColor={COLORS.statusAccepted}
            />
            <StatCard
              icon="gift"
              count={completedCount}
              label="Completed"
              onPress={() => onNavigateToMyRequests('Completed')}
              accentColor={COLORS.statusCompleted}
            />
          </View>
        </View>

        {/* Urgent Surplus Highlight Banner */}
        {urgentDonations.length > 0 && (
          <View style={styles.section}>
            <Pressable
              onPress={() => onNavigateToFindFood()}
              style={[styles.urgentBanner, SHADOWS.card]}
            >
              <View style={styles.urgentBannerIcon}>
                <SafeIcon name="flame" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.urgentBannerText}>
                <Text style={styles.urgentBannerTitle}>Urgent Surplus Available!</Text>
                <Text style={styles.urgentBannerDesc}>
                  {urgentDonations.length} hot donation items expiring in &lt; 4 hours. Request before they expire!
                </Text>
              </View>
              <SafeIcon name="chevron-forward" size={20} color={COLORS.primaryDark} />
            </Pressable>
          </View>
        )}

        {/* Food Categories Horizontal Bar */}
        <View style={styles.categorySection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Pressable onPress={() => onNavigateToFindFood()}>
              <Text style={styles.seeAllText}>See All ›</Text>
            </Pressable>
          </View>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setCategory(cat);
              onNavigateToFindFood(cat);
            }}
          />
        </View>

        {/* Nearby Donations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Nearby Donations 📍</Text>
              <Text style={styles.sectionSubtitle}>Fresh surplus food listed within your area</Text>
            </View>
            <Pressable onPress={() => onNavigateToFindFood()}>
              <Text style={styles.seeAllText}>View All ({foods.length})</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <LoadingState message="Discovering nearby donations..." />
          ) : nearbyFoods.length === 0 ? (
            <EmptyState
              icon="restaurant"
              title="No Food Listings Right Now"
              description="Check back in a few minutes as restaurants and community donors post fresh meals regularly."
              actionTitle="Refresh Feed"
              onAction={refreshData}
            />
          ) : (
            <View style={styles.foodListContainer}>
              {nearbyFoods.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onPress={() => onNavigateToFoodDetails(item)}
                  onRequestPress={() => onNavigateToRequestFood(item)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  categorySection: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDark,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  urgentBanner: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primarySoft,
  },
  urgentBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  urgentBannerText: {
    flex: 1,
  },
  urgentBannerTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDark,
  },
  urgentBannerDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  foodListContainer: {
    marginTop: SPACING.sm,
  },
});

export default HomeScreen;
