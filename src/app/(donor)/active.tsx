import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';

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
  const [expandedId, setExpandedId] = useState<string | null>('don-1');

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
          const isPending = index > currentStepIndex;

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Tracker</Text>
        <Text style={styles.subtitle}>Track your ongoing food donations</Text>
      </View>

      {/* Donation Card 1 - Active */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => toggleExpand('don-1')} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconBox}>
              <SymbolView name="takeoutbag.and.cup.and.straw.fill" tintColor="#FF6B00" size={24} fallback={null} />
            </View>
            <View>
              <Text style={styles.foodTitle}>Bakery Surplus (20 items)</Text>
              <Text style={styles.timeText}>Expires in 3 hours</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: '#FFF0E5' }]}>
            <Text style={[styles.badgeText, { color: '#FF6B00' }]}>En Route</Text>
          </View>
        </View>

        {expandedId === 'don-1' && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            
            <View style={styles.volunteerInfo}>
              <View style={styles.volunteerAvatar}>
                <SymbolView name="person.crop.circle.fill" tintColor="#8E8E93" size={40} fallback={null} />
              </View>
              <View style={styles.volunteerDetails}>
                <Text style={styles.volunteerName}>Alex Johnson</Text>
                <Text style={styles.volunteerRole}>NGO Volunteer</Text>
              </View>
              <TouchableOpacity style={styles.contactButton}>
                <SymbolView name="phone.fill" tintColor="#FF6B00" size={20} fallback={null} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactButton, { marginLeft: 8 }]}>
                <SymbolView name="message.fill" tintColor="#FF6B00" size={20} fallback={null} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.trackerHeading}>Donation Status</Text>
            {renderTimeline(2)} {/* Picked Up state */}
          </View>
        )}
      </TouchableOpacity>

      {/* Donation Card 2 - Pending */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => toggleExpand('don-2')} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <SymbolView name="leaf.fill" tintColor="#1565C0" size={24} fallback={null} />
            </View>
            <View>
              <Text style={styles.foodTitle}>Fresh Produce (5kg)</Text>
              <Text style={styles.timeText}>Expires in 12 hours</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.badgeText, { color: '#1565C0' }]}>Pending</Text>
          </View>
        </View>

        {expandedId === 'don-2' && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            
            <Text style={styles.pendingText}>
              Waiting for a volunteer or NGO to review and accept this donation request.
            </Text>
            
            <Text style={styles.trackerHeading}>Donation Status</Text>
            {renderTimeline(0)} {/* Requested state */}

            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

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
