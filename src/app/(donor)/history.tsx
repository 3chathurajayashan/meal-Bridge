import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { getDonationHistory, Donation } from '../../services/api';

export default function DonationHistoryScreen() {
  const [history, setHistory] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getDonationHistory();
      setHistory(data);
    } catch (error) {
      console.log('API error fetching history:', error);
      // Fallback to mock data for preview purposes
      setHistory([
        {
          id: 'hist-1',
          title: '50 Boxed Lunches',
          category: 'Prepared Meals',
          quantity: '50 items',
          expiry: '2023-10-12T14:30:00Z',
          dietaryTags: [],
          instructions: '',
          status: 'delivered',
          volunteer: { name: 'John Doe (NGO)', role: 'NGO Volunteer' }
        },
        {
          id: 'hist-2',
          title: 'Fresh Vegetables (10kg)',
          category: 'Produce',
          quantity: '10kg',
          expiry: '2023-10-08T09:00:00Z',
          dietaryTags: [],
          instructions: '',
          status: 'delivered',
          volunteer: { name: 'Sarah Smith', role: 'NGO Volunteer' }
        },
        {
          id: 'hist-3',
          title: 'Bakery Surplus',
          category: 'Baked Goods',
          quantity: '15 items',
          expiry: '2023-09-29T18:00:00Z',
          dietaryTags: [],
          instructions: '',
          status: 'cancelled' as any, // Adding a fake 'cancelled' status for history UI demo
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString.includes('T')) {
      return { month: 'OCT', day: '12', time: '2:30 PM' };
    }
    const d = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      month: months[d.getMonth()],
      day: d.getDate().toString().padStart(2, '0'),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
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
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Your past donations and impact.</Text>
      </View>

      <View style={styles.impactCard}>
        <View style={styles.impactHeader}>
          <SymbolView name="star.fill" tintColor="#FFD700" size={24} fallback={null} />
          <Text style={styles.impactTitle}>Lifetime Impact</Text>
        </View>
        <Text style={styles.impactDesc}>
          You have helped save <Text style={styles.impactHighlight}>124 meals</Text> from going to waste, feeding approximately <Text style={styles.impactHighlight}>200 people</Text>.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Past Donations</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No past donations found.</Text>
        </View>
      ) : (
        history.map((donation) => {
          const dateInfo = formatDate(donation.expiry);
          const statusConfig = getStatusDisplay(donation.status);

          return (
            <View key={donation.id} style={styles.historyItem}>
              <View style={styles.dateCol}>
                <Text style={styles.month}>{dateInfo.month}</Text>
                <Text style={styles.day}>{dateInfo.day}</Text>
                <Text style={styles.time}>{dateInfo.time}</Text>
              </View>
              
              <View style={styles.detailsCol}>
                <View style={styles.titleRow}>
                  <Text style={styles.foodTitle} numberOfLines={1}>{donation.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <SymbolView name={statusConfig.icon as any} tintColor={statusConfig.color} size={12} fallback={null} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.text}</Text>
                  </View>
                </View>
                
                {donation.volunteer ? (
                  <Text style={styles.pickupInfo} numberOfLines={1}>Picked up by {donation.volunteer.name}</Text>
                ) : donation.status === 'cancelled' ? (
                  <Text style={styles.pickupInfo} numberOfLines={1}>Donation was cancelled</Text>
                ) : (
                  <Text style={styles.pickupInfo} numberOfLines={1}>Category: {donation.category}</Text>
                )}
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
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
  },
  impactCard: {
    backgroundColor: '#FFF5EC',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FFE3CC',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E65100',
    marginLeft: 8,
  },
  impactDesc: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  impactHighlight: {
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  dateCol: {
    width: 65,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F2F2F7',
    paddingRight: 12,
  },
  month: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 2,
  },
  day: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  time: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
  },
  detailsCol: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  pickupInfo: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
});
