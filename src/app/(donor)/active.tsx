import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SymbolView } from 'expo-symbols';

export default function ActiveDonationsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Pickups</Text>
        <Text style={styles.subtitle}>Track your ongoing donations</Text>
      </View>

      {/* Active Donation Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.foodTitle}>Bakery Surplus (20 items)</Text>
            <Text style={styles.timeText}>Expires in 3 hours</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.badgeText, { color: '#E65100' }]}>En Route</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.volunteerInfo}>
          <View style={styles.volunteerAvatar}>
            <SymbolView name="person.fill" tintColor="#8E8E93" size={24} fallback={null} />
          </View>
          <View style={styles.volunteerDetails}>
            <Text style={styles.volunteerName}>Alex Johnson</Text>
            <Text style={styles.volunteerRole}>Volunteer</Text>
          </View>
          <TouchableOpacity style={styles.contactButton}>
            <SymbolView name="phone.fill" tintColor="#FF6B00" size={20} fallback={null} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactButton, { marginLeft: 8 }]}>
            <SymbolView name="message.fill" tintColor="#FF6B00" size={20} fallback={null} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <Text style={styles.progressTextActive}>Accepted</Text>
          </View>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <Text style={styles.progressTextActive}>On the way</Text>
          </View>
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
            <Text style={styles.progressText}>Arrived</Text>
          </View>
        </View>
      </View>

      {/* Pending Request Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.foodTitle}>Fresh Produce (5kg)</Text>
            <Text style={styles.timeText}>Expires in 12 hours</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[styles.badgeText, { color: '#1565C0' }]}>Pending</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.pendingText}>
          Waiting for a volunteer or NGO to accept this donation request.
        </Text>
        
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>

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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
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
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 16,
  },
  volunteerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  volunteerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  volunteerDetails: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  volunteerRole: {
    fontSize: 14,
    color: '#8E8E93',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    marginTop: 10,
  },
  progressLine: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#F2F2F7',
    zIndex: 0,
  },
  progressStep: {
    alignItems: 'center',
    zIndex: 1,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E5EA',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#FF6B00',
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressTextActive: {
    fontSize: 12,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  pendingText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 16,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 15,
  },
});
