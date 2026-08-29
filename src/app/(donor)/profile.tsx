import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SymbolView } from 'expo-symbols';

export default function DonorProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <SymbolView name="person.crop.circle.fill" tintColor="#E5E5EA" size={80} fallback={null} />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <SymbolView name="pencil" tintColor="#FFFFFF" size={14} fallback={null} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Food Donor</Text>
          <Text style={styles.email}>donor@example.com</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <SymbolView name="person.text.rectangle" tintColor="#1C1C1E" size={22} fallback={null} />
            </View>
            <Text style={styles.menuText}>Personal Details</Text>
            <SymbolView name="chevron.right" tintColor="#C7C7CC" size={16} fallback={null} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <SymbolView name="mappin.and.ellipse" tintColor="#1C1C1E" size={22} fallback={null} />
            </View>
            <Text style={styles.menuText}>Default Pickup Address</Text>
            <SymbolView name="chevron.right" tintColor="#C7C7CC" size={16} fallback={null} />
          </TouchableOpacity>

          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <SymbolView name="bell.badge" tintColor="#1C1C1E" size={22} fallback={null} />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <SymbolView name="chevron.right" tintColor="#C7C7CC" size={16} fallback={null} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <SymbolView name="questionmark.circle" tintColor="#1C1C1E" size={22} fallback={null} />
            </View>
            <Text style={styles.menuText}>Help Center</Text>
            <SymbolView name="chevron.right" tintColor="#C7C7CC" size={16} fallback={null} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <SymbolView name="doc.text" tintColor="#1C1C1E" size={22} fallback={null} />
            </View>
            <Text style={styles.menuText}>Terms of Service</Text>
            <SymbolView name="chevron.right" tintColor="#C7C7CC" size={16} fallback={null} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <SymbolView name="rectangle.portrait.and.arrow.right" tintColor="#FF3B30" size={20} fallback={null} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Meal Bridge v1.0.0</Text>
      
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
    alignItems: 'center',
    paddingTop: 32,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B00',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F9F9FB',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: '#8E8E93',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    marginLeft: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginLeft: 60, // Align with text
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#C7C7CC',
    fontSize: 13,
    marginTop: 32,
    marginBottom: 40,
  }
});
