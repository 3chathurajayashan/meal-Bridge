import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { getDonationHistory, Donation } from '../../services/api';

export default function DonorDashboardScreen() {
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    try {
      setLoading(true);
      const data = await getDonationHistory();
      // Only show the top 3 most recent donations for the dashboard
      setRecentDonations(data.slice(0, 3));
    } catch (error) {
      console.log('API error fetching recent donations:', error);
      // Fallback to mock data
      setRecentDonations([
        {
          id: 'hist-1',
          title: 'Boxed Lunches',
          category: 'Prepared Meals',
          quantity: '50 items',
          expiry: '2023-10-12T14:30:00Z',
          dietaryTags: [],
          instructions: '',
          status: 'delivered',
        },
        {
          id: 'hist-2',
          title: 'Fresh Vegetables',
          category: 'Produce',
          quantity: '10 kg',
          expiry: '2023-10-08T09:00:00Z',
          dietaryTags: [],
          instructions: '',
          status: 'picked_up',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString.includes('T')) return dateString;
    const d = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'delivered': return { text: 'Completed', color: '#34C759', bg: '#E8F5E9', icon: 'checkmark.circle.fill' };
      case 'picked_up': return { text: 'En Route', color: '#FF6B00', bg: '#FFF0E5', icon: 'car.fill' };
      case 'approved': return { text: 'Approved', color: '#007AFF', bg: '#E3F2FD', icon: 'checkmark.seal.fill' };
      case 'requested': return { text: 'Pending', color: '#8E8E93', bg: '#F2F2F7', icon: 'clock.fill' };
      case 'cancelled': return { text: 'Cancelled', color: '#FF3B30', bg: '#FFF5F5', icon: 'xmark.circle.fill' };
      default: return { text: 'Unknown', color: '#8E8E93', bg: '#F2F2F7', icon: 'questionmark.circle.fill' };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>Food Donor</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>124</Text>
          <Text style={styles.statLabel}>Meals Donated</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Active Pickups</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Donations</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#FF6B00" />
      ) : recentDonations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent donations.</Text>
        </View>
      ) : (
        recentDonations.map((item) => {
          const statusConfig = getStatusDisplay(item.status);

          return (
            <View key={item.id} style={styles.donationItem}>
              <View style={styles.iconContainer}>
                <SymbolView name="gift.fill" tintColor="#FF6B00" size={24} fallback={null} />
              </View>
              
              <View style={styles.detailsContainer}>
                <Text style={styles.donationTitle} numberOfLines={1}>{item.title}</Text>
                
                <View style={styles.metaRow}>
                  <SymbolView name="number" tintColor="#8E8E93" size={14} fallback={null} style={styles.metaIcon} />
                  <Text style={styles.metaText}>{item.quantity}</Text>
                  
                  <View style={styles.metaDivider} />
                  
                  <SymbolView name="calendar" tintColor="#8E8E93" size={14} fallback={null} style={styles.metaIcon} />
                  <Text style={styles.metaText}>{formatDate(item.expiry)}</Text>
                </View>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.text}</Text>
              </View>
            </View>
          );
        })
      )}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },
  header: {
    padding: 24,
    paddingTop: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B00',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 8,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
    marginHorizontal: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
