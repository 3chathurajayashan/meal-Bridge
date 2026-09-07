import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform, ActivityIndicator, Alert } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { getActiveDonations, Donation } from '../../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TIMELINE_STEPS = [
  { id: 'requested', title: 'Requested', desc: 'Pending NGO approval', icon: 'clock.fill' },
  { id: 'approved', title: 'Approved', desc: 'Volunteer assigned', icon: 'checkmark.seal.fill' },
  { id: 'picked_up', title: 'Picked Up', desc: 'En route to destination', icon: 'car.fill' },
  { id: 'delivered', title: 'Delivered', desc: 'Food safely delivered', icon: 'gift.fill' },
];

export default function ActiveDonationsScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await getActiveDonations();
      setDonations(data);
      if (data.length > 0) {
        setExpandedId(data[0].id);
      }
    } catch (error) {
      console.log('API error fetching donations:', error);
      // Fallback to mock data for preview purposes if API is not running
      setDonations([
        {
          id: 'don-1',
          title: 'Bakery Surplus (20 items)',
          category: 'Baked Goods',
          quantity: '20 items',
          expiry: 'Expires in 3 hours',
          dietaryTags: [],
          instructions: '',
          status: 'picked_up',
          volunteer: { name: 'Alex Johnson', role: 'NGO Volunteer' }
        },
        {
          id: 'don-2',
          title: 'Fresh Produce (5kg)',
          category: 'Produce',
          quantity: '5kg',
          expiry: 'Expires in 12 hours',
          dietaryTags: ['Vegan'],
          instructions: '',
          status: 'requested',
        }
      ]);
      setExpandedId('don-1');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const renderTimeline = (currentStepIndex: number) => {
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
            bgColor = '#34C759'; // Green
          } else if (isActive) {
            iconColor = '#FFFFFF';
            textColor = '#FF6B00'; // Orange
            bgColor = '#FF6B00';
          }

          return (
            <View key={step.id} style={styles.timelineStep}>
              {/* Vertical Line */}
              {index !== TIMELINE_STEPS.length - 1 && (
                <View style={[styles.timelineLine, isCompleted && styles.timelineLineActive]} />
              )}
              
              <View style={[styles.timelineIconWrapper, { backgroundColor: bgColor }]}>
                {/* Fallbacks provided manually as the built-in fallback isn't fully reliable with complex types */}
                <SymbolView name={step.icon as any} tintColor={iconColor} size={16} fallback={null} />
              </View>
              
              <View style={styles.timelineTextContainer}>
                <Text style={[styles.timelineTitle, { color: textColor, fontWeight: isActive ? '700' : '500' }]}>
                  {step.title}
                </Text>
                {(isActive || isCompleted) && (
                  <Text style={styles.timelineDesc}>{step.desc}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'requested': return 'Pending';
      case 'approved': return 'Approved';
      case 'picked_up': return 'En Route';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return { bg: '#E3F2FD', text: '#1565C0' };
      case 'approved': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'picked_up': return { bg: '#FFF0E5', text: '#FF6B00' };
      case 'delivered': return { bg: '#F2F2F7', text: '#8E8E93' };
      default: return { bg: '#F2F2F7', text: '#8E8E93' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'produce': return 'leaf.fill';
      case 'baked goods': return 'takeoutbag.and.cup.and.straw.fill';
      case 'prepared meals': return 'fork.knife';
      default: return 'takeoutbag.and.cup.and.straw.fill';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Tracker</Text>
        <Text style={styles.subtitle}>Track your ongoing food donations</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Fetching donations...</Text>
        </View>
      ) : donations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You have no active donations at the moment.</Text>
        </View>
      ) : (
        donations.map((donation) => {
          const statusConfig = getStatusColor(donation.status);
          const currentStepIndex = TIMELINE_STEPS.findIndex(step => step.id === donation.status);
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
                  <View style={[styles.iconBox, { backgroundColor: statusConfig.bg }]}>
                    <SymbolView name={getCategoryIcon(donation.category) as any} tintColor={statusConfig.text} size={24} fallback={null} />
                  </View>
                  <View>
                    <Text style={styles.foodTitle}>{donation.title}</Text>
                    <Text style={styles.timeText}>{donation.expiry}</Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.badgeText, { color: statusConfig.text }]}>
                    {getStatusText(donation.status)}
                  </Text>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.divider} />
                  
                  {donation.volunteer && (
                    <View style={styles.volunteerInfo}>
                      <View style={styles.volunteerAvatar}>
                        <SymbolView name="person.crop.circle.fill" tintColor="#8E8E93" size={40} fallback={null} />
                      </View>
                      <View style={styles.volunteerDetails}>
                        <Text style={styles.volunteerName}>{donation.volunteer.name}</Text>
                        <Text style={styles.volunteerRole}>{donation.volunteer.role}</Text>
                      </View>
                      <TouchableOpacity style={styles.contactButton}>
                        <SymbolView name="phone.fill" tintColor="#FF6B00" size={20} fallback={null} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.contactButton, { marginLeft: 8 }]}>
                        <SymbolView name="message.fill" tintColor="#FF6B00" size={20} fallback={null} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {donation.status === 'requested' && (
                    <Text style={styles.pendingText}>
                      Waiting for a volunteer or NGO to review and accept this donation request.
                    </Text>
                  )}
                  
                  <Text style={styles.trackerHeading}>Donation Status</Text>
                  {renderTimeline(Math.max(0, currentStepIndex))}

                  {donation.status === 'requested' && (
                    <TouchableOpacity style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>Cancel Request</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </TouchableOpacity>
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
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
  loadingText: {
    marginTop: 16,
    color: '#8E8E93',
    fontSize: 15,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
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
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    marginBottom: 16,
  },
  volunteerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F9F9FB',
    padding: 12,
    borderRadius: 16,
  },
  volunteerAvatar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 13,
    color: '#8E8E93',
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackerHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    bottom: -24,
    width: 2,
    backgroundColor: '#F2F2F7',
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: '#34C759',
  },
  timelineIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineTextContainer: {
    marginLeft: 16,
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 13,
    color: '#8E8E93',
  },
  pendingText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 20,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontWeight: '700',
    fontSize: 15,
  },
});
