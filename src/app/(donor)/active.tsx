import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import {
  getActiveDonations,
  cancelDonation,
  getIncomingFoodRequests,
  acceptFoodRequest,
  rejectFoodRequest,
  Donation,
  FoodRequest,
} from '../../services/api';
import DonationQRModal from '../../components/DonationQRModal';
import QRScannerModal from '../../components/QRScannerModal';
import { EditDonationModal } from '../../components/EditDonationModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TIMELINE_STEPS = [
  { id: 'AVAILABLE', title: 'Listed', desc: 'Awaiting recipient request', icon: 'clock.fill' },
  { id: 'RESERVED', title: 'Reserved', desc: 'Accepted & reserved for pickup', icon: 'checkmark.seal.fill' },
  { id: 'CLAIMED', title: 'En Route', desc: 'Volunteer / recipient picking up', icon: 'car.fill' },
  { id: 'COMPLETED', title: 'Delivered', desc: 'Food safely delivered', icon: 'gift.fill' },
];

export default function ActiveDonationsScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedQRDonation, setSelectedQRDonation] = useState<Donation | null>(null);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsData, requestsData] = await Promise.all([
        getActiveDonations(),
        getIncomingFoodRequests().catch(() => []),
      ]);

      setDonations(donationsData);
      setRequests(requestsData);

      if (donationsData.length > 0 && !expandedId) {
        setExpandedId(donationsData[0].id);
      }
    } catch (error) {
      console.log('Error fetching active donations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCancel = (id: string, title: string) => {
    Alert.alert(
      'Cancel Donation',
      `Are you sure you want to cancel the donation "${title}"?`,
      [
        { text: 'Keep Donation', style: 'cancel' },
        {
          text: 'Cancel It',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoadingId(id);
              await cancelDonation(id);
              Alert.alert('Cancelled', 'Donation was cancelled successfully.');
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel donation');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoadingId(requestId);
      await acceptFoodRequest(requestId);
      Alert.alert('Accepted', 'Food request accepted successfully!');
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to accept request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setActionLoadingId(requestId);
      await rejectFoodRequest(requestId);
      Alert.alert('Rejected', 'Food request rejected.');
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reject request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderTimeline = (rawStatus?: string) => {
    let currentStepIndex = 0;
    if (rawStatus === 'AVAILABLE') currentStepIndex = 0;
    else if (rawStatus === 'RESERVED') currentStepIndex = 1;
    else if (rawStatus === 'CLAIMED') currentStepIndex = 2;
    else if (rawStatus === 'COMPLETED') currentStepIndex = 3;

    return (
      <View style={styles.timelineContainer}>
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          let iconColor = '#E5E5EA';
          let textColor = '#8E8E93';
          let bgColor = '#F2F2F7';

          if (isCompleted) {
            iconColor = '#FFFFFF';
            textColor = '#1C1C1E';
            bgColor = '#34C759';
          } else if (isActive) {
            iconColor = '#FFFFFF';
            textColor = '#FF6B00';
            bgColor = '#FF6B00';
          }

          return (
            <View key={step.id} style={styles.timelineStep}>
              {index !== TIMELINE_STEPS.length - 1 && (
                <View style={[styles.timelineLine, isCompleted && styles.timelineLineActive]} />
              )}

              <View style={[styles.timelineIconWrapper, { backgroundColor: bgColor }]}>
                <SymbolView name={step.icon as any} tintColor={iconColor} size={15} fallback={null} />
              </View>

              <View style={styles.timelineTextContainer}>
                <Text style={[styles.timelineTitle, { color: textColor, fontWeight: isActive ? '700' : '500' }]}>
                  {step.title}
                </Text>
                {(isActive || isCompleted) && <Text style={styles.timelineDesc}>{step.desc}</Text>}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const getStatusBadge = (rawStatus?: string) => {
    switch (rawStatus) {
      case 'AVAILABLE':
        return { text: 'Available', bg: '#E3F2FD', textCol: '#1565C0' };
      case 'RESERVED':
        return { text: 'Reserved', bg: '#FFF7E6', textCol: '#FF9500' };
      case 'CLAIMED':
        return { text: 'En Route', bg: '#FFF0E5', textCol: '#FF6B00' };
      case 'COMPLETED':
        return { text: 'Delivered', bg: '#E8F5E9', textCol: '#2E7D32' };
      default:
        return { text: 'Active', bg: '#F2F2F7', textCol: '#8E8E93' };
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
          <Text style={styles.title}>Live Tracker</Text>
          <Text style={styles.subtitle}>Track your ongoing food donations and pickup status.</Text>
        </View>
        <TouchableOpacity
          style={styles.headerScanBtn}
          onPress={() => setScannerVisible(true)}
          activeOpacity={0.8}
        >
          <SymbolView name="qrcode.viewfinder" tintColor="#FFFFFF" size={18} fallback={null} />
          <Text style={styles.headerScanBtnText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {/* Incoming Requests Section (if any) */}
      {requests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={styles.sectionHeading}>Incoming Recipient Requests ({requests.length})</Text>
          {requests.map((req) => (
            <View key={req._id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <SymbolView name="person.fill" tintColor="#FF6B00" size={18} fallback={null} />
                <Text style={styles.requestUser}>{req.recipient?.fullName || 'Recipient Partner'}</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{req.status}</Text>
                </View>
              </View>
              {req.message ? <Text style={styles.requestMsg}>"{req.message}"</Text> : null}
              {req.status === 'PENDING' && (
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptRequest(req._id)}
                    disabled={actionLoadingId === req._id}
                  >
                    <Text style={styles.acceptBtnText}>Accept Request</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleRejectRequest(req._id)}
                    disabled={actionLoadingId === req._id}
                  >
                    <Text style={styles.rejectBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Fetching active donations...</Text>
        </View>
      ) : donations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SymbolView name="location.slash" tintColor="#C7C7CC" size={50} fallback={null} />
          <Text style={styles.emptyTitle}>No Active Donations</Text>
          <Text style={styles.emptyText}>You don't have any ongoing donations right now. When you donate, track the pickup progress live here.</Text>
        </View>
      ) : (
        donations.map((donation) => {
          const statusConfig = getStatusBadge(donation.rawStatus);
          const isExpanded = expandedId === donation.id;

          return (
            <TouchableOpacity
              key={donation.id}
              activeOpacity={0.9}
              onPress={() => toggleExpand(donation.id)}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  {donation.imageUrl ? (
                    <Image source={{ uri: donation.imageUrl }} style={styles.thumbImage} />
                  ) : (
                    <View style={styles.iconBox}>
                      <SymbolView name="gift.fill" tintColor="#FF6B00" size={24} fallback={null} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodTitle} numberOfLines={1}>{donation.title}</Text>
                    <Text style={styles.quantityText}>{donation.quantity} • {donation.category}</Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.badgeText, { color: statusConfig.textCol }]}>{statusConfig.text}</Text>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.divider} />

                  {/* Pickup address */}
                  <View style={styles.infoRow}>
                    <SymbolView name="mappin.circle.fill" tintColor="#8E8E93" size={16} fallback={null} />
                    <Text style={styles.infoText}>{donation.pickupAddress || 'Address on file'}</Text>
                  </View>

                  {/* Volunteer / Recipient info */}
                  {donation.volunteer && (
                    <View style={styles.volunteerInfo}>
                      <View style={styles.volunteerAvatar}>
                        <SymbolView name="person.crop.circle.fill" tintColor="#FF6B00" size={38} fallback={null} />
                      </View>
                      <View style={styles.volunteerDetails}>
                        <Text style={styles.volunteerName}>{donation.volunteer.name}</Text>
                        <Text style={styles.volunteerRole}>{donation.volunteer.role}</Text>
                        {donation.volunteer.phone && (
                          <Text style={styles.volunteerPhone}>{donation.volunteer.phone}</Text>
                        )}
                      </View>
                    </View>
                  )}

                  {donation.rawStatus === 'AVAILABLE' && (
                    <Text style={styles.pendingText}>
                      Your donation is live on the platform. Recipient organizations and volunteers in your area can now claim and arrange pickup.
                    </Text>
                  )}

                  <Text style={styles.trackerHeading}>Progress Timeline</Text>
                  {renderTimeline(donation.rawStatus)}

                  {/* Action Buttons: View QR Pass, Edit Listing & Cancel */}
                  <View style={styles.cardActionsContainer}>
                    <TouchableOpacity
                      style={styles.qrPassButton}
                      onPress={() => setSelectedQRDonation(donation)}
                      activeOpacity={0.8}
                    >
                      <SymbolView name="qrcode" tintColor="#FFFFFF" size={17} fallback={null} />
                      <Text style={styles.qrPassButtonText}>View QR Pass</Text>
                    </TouchableOpacity>

                    {donation.rawStatus === 'AVAILABLE' && (
                      <View style={styles.secondaryActionsRow}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => setEditingDonation(donation)}
                          activeOpacity={0.8}
                        >
                          <SymbolView name="pencil" tintColor="#FF6B00" size={16} fallback={null} />
                          <Text style={styles.editButtonText}>Edit Details</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => handleCancel(donation.id, donation.title)}
                          disabled={actionLoadingId === donation.id}
                        >
                          {actionLoadingId === donation.id ? (
                            <ActivityIndicator color="#FF3B30" />
                          ) : (
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}

      <View style={{ height: 40 }} />

      {/* Edit Donation Modal */}
      <EditDonationModal
        visible={!!editingDonation}
        donation={editingDonation}
        onClose={() => setEditingDonation(null)}
        onUpdated={() => {
          fetchData();
        }}
      />

      {/* Donation Unique QR Code Pass Modal */}
      <DonationQRModal
        visible={!!selectedQRDonation}
        donation={selectedQRDonation}
        donorName="Thilakshi Weliwaththa"
        onClose={() => setSelectedQRDonation(null)}
      />

      {/* QR Code Scanner Modal */}
      <QRScannerModal
        visible={scannerVisible}
        activeDonations={donations}
        donorName="Thilakshi Weliwaththa"
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
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerScanBtn: {
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
  headerScanBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
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
  requestsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  requestCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE3CC',
    backgroundColor: '#FFFBF7',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requestUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B00',
  },
  requestMsg: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#FF6B00',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rejectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 13,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    color: '#8E8E93',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 6,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  thumbImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F2F2F7',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  quantityText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#8E8E93',
    flex: 1,
  },
  volunteerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF9F5',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE3CC',
  },
  volunteerAvatar: {
    marginRight: 12,
  },
  volunteerDetails: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  volunteerRole: {
    fontSize: 12,
    color: '#FF6B00',
    fontWeight: '600',
  },
  volunteerPhone: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  trackerHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  timelineContainer: {
    paddingLeft: 6,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 22,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 14,
    top: 30,
    bottom: -22,
    width: 2,
    backgroundColor: '#F2F2F7',
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: '#34C759',
  },
  timelineIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineTextContainer: {
    marginLeft: 14,
    flex: 1,
    paddingTop: 3,
  },
  timelineTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 12,
    color: '#8E8E93',
  },
  pendingText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 16,
    backgroundColor: '#F9F9FB',
    padding: 12,
    borderRadius: 12,
  },
  cardActionsContainer: {
    gap: 8,
    marginTop: 14,
  },
  qrPassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  qrPassButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#FFF0E5',
    borderWidth: 1,
    borderColor: '#FFD7BD',
  },
  editButtonText: {
    color: '#FF6B00',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontWeight: '700',
    fontSize: 14,
  },
});
