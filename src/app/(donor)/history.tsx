import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { getMyDonations, Donation } from '../../services/api';
import DonationQRModal from '../../components/DonationQRModal';

export default function DonationHistoryScreen() {
  const [history, setHistory] = useState<Donation[]>([]);
  const [totalMeals, setTotalMeals] = useState<number>(0);
  const [peopleFed, setPeopleFed] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQRDonation, setSelectedQRDonation] = useState<Donation | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const all = await getMyDonations();
      setHistory(all);

      // Compute lifetime impact
      const total = all.reduce((sum, item) => sum + (item.rawQuantity || 1), 0);
      setTotalMeals(total);
      // Rough estimation: 1 meal can feed ~1.5 people on average
      setPeopleFed(Math.round(total * 1.5));
    } catch (error) {
      console.log('Error fetching donation history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return { month: 'TODAY', day: '--', time: '' };
    }
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) {
        return { month: 'DATE', day: '--', time: '' };
      }
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return {
        month: months[d.getMonth()],
        day: d.getDate().toString().padStart(2, '0'),
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { month: 'DATE', day: '--', time: '' };
    }
  };

  const getStatusDisplay = (rawStatus?: string, uiStatus?: string) => {
    switch (rawStatus) {
      case 'COMPLETED':
        return { text: 'Completed', color: '#34C759', bg: '#E8F5E9', icon: 'checkmark.circle.fill' };
      case 'CLAIMED':
        return { text: 'In Transit', color: '#FF6B00', bg: '#FFF0E5', icon: 'car.fill' };
      case 'RESERVED':
        return { text: 'Reserved', color: '#007AFF', bg: '#E3F2FD', icon: 'checkmark.seal.fill' };
      case 'AVAILABLE':
        return { text: 'Available', color: '#8E8E93', bg: '#F2F2F7', icon: 'clock.fill' };
      case 'CANCELLED':
        return { text: 'Cancelled', color: '#FF3B30', bg: '#FFF5F5', icon: 'xmark.circle.fill' };
      case 'EXPIRED':
        return { text: 'Expired', color: '#8E8E93', bg: '#F2F2F7', icon: 'clock.badge.xmark.fill' };
      default:
        return { text: uiStatus || 'Listed', color: '#8E8E93', bg: '#F2F2F7', icon: 'gift.fill' };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Donation History</Text>
        <Text style={styles.subtitle}>Your past donations and community impact.</Text>
      </View>

      {/* Lifetime Impact Card */}
      <View style={styles.impactCard}>
        <View style={styles.impactHeader}>
          <SymbolView name="star.fill" tintColor="#FF9500" size={24} fallback={null} />
          <Text style={styles.impactTitle}>Lifetime Impact</Text>
        </View>
        <Text style={styles.impactDesc}>
          You have created <Text style={styles.impactHighlight}>{history.length} donations</Text> saving{' '}
          <Text style={styles.impactHighlight}>{totalMeals} portions</Text> of food from going to waste, feeding approximately{' '}
          <Text style={styles.impactHighlight}>{peopleFed} people</Text>.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>All Donations ({history.length})</Text>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No past donations found.</Text>
        </View>
      ) : (
        history.map((donation) => {
          const dateInfo = formatDate(donation.createdAt || donation.expiry);
          const statusConfig = getStatusDisplay(donation.rawStatus, donation.status);

          return (
            <View key={donation.id} style={styles.historyItem}>
              <View style={styles.dateCol}>
                <Text style={styles.month}>{dateInfo.month}</Text>
                <Text style={styles.day}>{dateInfo.day}</Text>
                {dateInfo.time ? <Text style={styles.time}>{dateInfo.time}</Text> : null}
              </View>

              <View style={styles.detailsCol}>
                <View style={styles.titleRow}>
                  <Text style={styles.foodTitle} numberOfLines={1}>
                    {donation.title}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <SymbolView
                      name={statusConfig.icon as any}
                      tintColor={statusConfig.color}
                      size={12}
                      fallback={null}
                    />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.text}
                    </Text>
                  </View>
                </View>

                <View style={styles.subInfoRow}>
                  <Text style={styles.quantityTag}>{donation.quantity}</Text>
                  <Text style={styles.categoryTag}>• {donation.category}</Text>
                </View>

                <View style={styles.historyBottomRow}>
                  {donation.volunteer ? (
                    <Text style={styles.pickupInfo} numberOfLines={1}>
                      Claimed by: {donation.volunteer.name}
                    </Text>
                  ) : (
                    <Text style={styles.pickupInfo} numberOfLines={1}>
                      Pickup: {donation.pickupAddress || 'Address on file'}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={styles.qrHistoryBtn}
                    onPress={() => setSelectedQRDonation(donation)}
                    activeOpacity={0.7}
                  >
                    <SymbolView name="qrcode" tintColor="#FF6B00" size={15} fallback={null} />
                    <Text style={styles.qrHistoryBtnText}>QR Pass</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />

      {/* Unique QR Code Pass Modal */}
      <DonationQRModal
        visible={!!selectedQRDonation}
        donation={selectedQRDonation}
        donorName="Thilakshi Weliwaththa"
        onClose={() => setSelectedQRDonation(null)}
      />
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  impactCard: {
    backgroundColor: '#FFF5EC',
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
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
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  impactHighlight: {
    fontWeight: '700',
    color: '#FF6B00',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  dateCol: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F2F2F7',
    paddingRight: 12,
  },
  month: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 2,
  },
  day: {
    fontSize: 22,
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
    paddingLeft: 14,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantityTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B00',
  },
  categoryTag: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
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
    fontSize: 12,
    color: '#8E8E93',
    flex: 1,
    marginRight: 8,
  },
  historyBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  qrHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },
  qrHistoryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B00',
  },
});
