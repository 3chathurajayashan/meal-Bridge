import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { getMyDonations, Donation, getStoredUser, User } from '../../services/api';
import DonationQRModal from '../../components/DonationQRModal';
import QRScannerModal from '../../components/QRScannerModal';

export default function DonorDashboardScreen() {
  const router = useRouter();
  const [donorUser, setDonorUser] = useState<User | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [mealsDonatedCount, setMealsDonatedCount] = useState<number>(0);
  const [activePickupsCount, setActivePickupsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQRDonation, setSelectedQRDonation] = useState<Donation | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await getStoredUser();
      setDonorUser(user);

      const donations = await getMyDonations();
      setAllDonations(donations);

      // Calculate real stats
      const active = donations.filter(
        d => d.rawStatus === 'AVAILABLE' || d.rawStatus === 'RESERVED' || d.rawStatus === 'CLAIMED'
      );
      setActivePickupsCount(active.length);

      const totalMeals = donations.reduce((acc, curr) => acc + (curr.rawQuantity || 1), 0);
      setMealsDonatedCount(totalMeals);

      // Most recent donations
      setRecentDonations(donations.slice(0, 4));
    } catch (error) {
      console.log('Error fetching donor dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Active';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateString;
    }
  };

  const getStatusDisplay = (rawStatus?: string, uiStatus?: string) => {
    switch (rawStatus) {
      case 'AVAILABLE':
        return { text: 'Available', color: '#007AFF', bg: '#E3F2FD', icon: 'clock.fill' };
      case 'RESERVED':
        return { text: 'Reserved', color: '#FF9500', bg: '#FFF7E6', icon: 'checkmark.seal.fill' };
      case 'CLAIMED':
        return { text: 'In Transit', color: '#FF6B00', bg: '#FFF0E5', icon: 'car.fill' };
      case 'COMPLETED':
        return { text: 'Completed', color: '#34C759', bg: '#E8F5E9', icon: 'checkmark.circle.fill' };
      case 'CANCELLED':
        return { text: 'Cancelled', color: '#FF3B30', bg: '#FFF5F5', icon: 'xmark.circle.fill' };
      case 'EXPIRED':
        return { text: 'Expired', color: '#8E8E93', bg: '#F2F2F7', icon: 'clock.badge.xmark.fill' };
      default:
        return { text: uiStatus || 'Active', color: '#FF6B00', bg: '#FFF0E5', icon: 'gift.fill' };
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
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{donorUser?.fullName || 'Food Donor'}</Text>
          <Text style={styles.addressSubtext}>
            <SymbolView name="mappin" tintColor="#8E8E93" size={13} fallback={null} />{' '}
            {donorUser?.address || 'Pickup location ready'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.scanQRHeaderBtn}
          onPress={() => setScannerVisible(true)}
          activeOpacity={0.8}
        >
          <SymbolView name="qrcode.viewfinder" tintColor="#FFFFFF" size={18} fallback={null} />
          <Text style={styles.scanQRHeaderBtnText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mealsDonatedCount}</Text>
          <Text style={styles.statLabel}>Meals Donated</Text>
        </View>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => router.push('/(donor)/active')}
        >
          <Text style={[styles.statValue, { color: '#007AFF' }]}>{activePickupsCount}</Text>
          <Text style={styles.statLabel}>Active Pickups</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Donations</Text>
        <TouchableOpacity onPress={() => router.push('/(donor)/history')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 24 }} size="large" color="#FF6B00" />
      ) : recentDonations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SymbolView name="gift" tintColor="#C7C7CC" size={48} fallback={null} />
          <Text style={styles.emptyTitle}>No Donations Yet</Text>
          <Text style={styles.emptyText}>You haven't listed any food donations yet. Tap Donate below to start saving food!</Text>
          <TouchableOpacity 
            style={styles.donateNowBtn}
            onPress={() => router.push('/(donor)/add')}
          >
            <Text style={styles.donateNowBtnText}>Donate Food Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recentDonations.map((item) => {
          const statusConfig = getStatusDisplay(item.rawStatus, item.status);

          return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.donationItem}
              onPress={() => router.push('/(donor)/active')}
              activeOpacity={0.8}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.foodThumbnail} />
              ) : (
                <View style={styles.iconContainer}>
                  <SymbolView name="gift.fill" tintColor="#FF6B00" size={24} fallback={null} />
                </View>
              )}

              <View style={styles.detailsContainer}>
                <Text style={styles.donationTitle} numberOfLines={1}>{item.title}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.categoryBadge}>{item.category}</Text>
                  <View style={styles.metaDivider} />
                  <Text style={styles.metaText}>{item.quantity}</Text>
                </View>

                <Text style={styles.dateText}>Until: {formatDate(item.expiry)}</Text>
              </View>

              <View style={styles.actionColumn}>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.text}</Text>
                </View>

                <TouchableOpacity
                  style={styles.qrPassBtn}
                  onPress={() => setSelectedQRDonation(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <SymbolView name="qrcode" tintColor="#FF6B00" size={17} fallback={null} />
                  <Text style={styles.qrPassBtnText}>Pass</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      <View style={{ height: 40 }} />

      {/* Donation Unique QR Code Pass Modal */}
      <DonationQRModal
        visible={!!selectedQRDonation}
        donation={selectedQRDonation}
        donorName={donorUser?.fullName}
        onClose={() => setSelectedQRDonation(null)}
      />

      {/* QR Code Scanner Modal */}
      <QRScannerModal
        visible={scannerVisible}
        activeDonations={allDonations}
        donorName={donorUser?.fullName}
        onClose={() => setScannerVisible(false)}
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
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanQRHeaderBtn: {
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  scanQRHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  greeting: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '500',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  addressSubtext: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 28,
    gap: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
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
    fontWeight: '800',
    color: '#FF6B00',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
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
    fontWeight: '700',
    color: '#1C1C1E',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B00',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  donateNowBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  donateNowBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  foodThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#F2F2F7',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 8,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B00',
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D1D6',
    marginHorizontal: 6,
  },
  dateText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  qrPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },
  qrPassBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B00',
  },
});
