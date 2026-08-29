import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';

export default function DonationHistoryScreen() {
  return (
    <ScrollView style={styles.container}>
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

      {/* History Item 1 */}
      <View style={styles.historyItem}>
        <View style={styles.dateCol}>
          <Text style={styles.month}>OCT</Text>
          <Text style={styles.day}>12</Text>
        </View>
        <View style={styles.detailsCol}>
          <Text style={styles.foodTitle}>50 Boxed Lunches</Text>
          <Text style={styles.pickupInfo}>Picked up by John Doe (NGO)</Text>
        </View>
        <View style={styles.statusCol}>
          <SymbolView name="checkmark.circle.fill" tintColor="#34C759" size={20} fallback={null} />
        </View>
      </View>

      {/* History Item 2 */}
      <View style={styles.historyItem}>
        <View style={styles.dateCol}>
          <Text style={styles.month}>OCT</Text>
          <Text style={styles.day}>08</Text>
        </View>
        <View style={styles.detailsCol}>
          <Text style={styles.foodTitle}>Fresh Vegetables (10kg)</Text>
          <Text style={styles.pickupInfo}>Picked up by Sarah Smith</Text>
        </View>
        <View style={styles.statusCol}>
          <SymbolView name="checkmark.circle.fill" tintColor="#34C759" size={20} fallback={null} />
        </View>
      </View>

      {/* History Item 3 (Cancelled) */}
      <View style={styles.historyItem}>
        <View style={styles.dateCol}>
          <Text style={styles.month}>SEP</Text>
          <Text style={styles.day}>29</Text>
        </View>
        <View style={styles.detailsCol}>
          <Text style={styles.foodTitle}>Bakery Surplus</Text>
          <Text style={styles.pickupInfo}>Expired before pickup</Text>
        </View>
        <View style={styles.statusCol}>
          <SymbolView name="xmark.circle.fill" tintColor="#FF3B30" size={20} fallback={null} />
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
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateCol: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F2F2F7',
    paddingRight: 12,
  },
  month: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  day: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  detailsCol: {
    flex: 1,
    paddingLeft: 16,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  pickupInfo: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statusCol: {
    paddingLeft: 12,
  },
});
