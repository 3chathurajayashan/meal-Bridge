import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DonorDashboardScreen() {
  return (
    <ScrollView style={styles.container}>
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

      <Text style={styles.sectionTitle}>Recent Donations</Text>
      
      {/* Mock data for recent donations */}
      <View style={styles.donationItem}>
        <View>
          <Text style={styles.donationTitle}>50 Boxed Lunches</Text>
          <Text style={styles.donationDate}>Today, 2:00 PM</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.statusText, { color: '#2E7D32' }]}>Completed</Text>
        </View>
      </View>

      <View style={styles.donationItem}>
        <View>
          <Text style={styles.donationTitle}>Fresh Vegetables (10kg)</Text>
          <Text style={styles.donationDate}>Yesterday</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.statusText, { color: '#2E7D32' }]}>Completed</Text>
        </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  donationDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
