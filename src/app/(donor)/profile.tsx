import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import {
  getStoredUser,
  getEffectiveBaseUrl,
  setCustomApiBaseUrl,
  logoutDonor,
  User,
} from '../../services/api';

export default function DonorProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [serverUrl, setServerUrl] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const stored = await getStoredUser();
    setUser(stored);

    const url = await getEffectiveBaseUrl();
    setServerUrl(url);
    setCustomUrlInput(url);

    testConnection(url);
  };

  const testConnection = async (urlToTest?: string) => {
    const url = urlToTest || serverUrl;
    setIsTesting(true);
    try {
      // Test root endpoint
      const rootUrl = url.replace(/\/api$/, '');
      const res = await fetch(`${rootUrl}/`, { method: 'GET' });
      if (res.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch {
      setConnectionStatus('disconnected');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCustomUrl = async () => {
    if (!customUrlInput.trim()) {
      await setCustomApiBaseUrl(null);
      const def = await getEffectiveBaseUrl();
      setServerUrl(def);
      setCustomUrlInput(def);
      setIsEditingUrl(false);
      testConnection(def);
      Alert.alert('Reset to Default', `API endpoint reset to: ${def}`);
      return;
    }

    let formatted = customUrlInput.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `http://${formatted}`;
    }
    if (!formatted.endsWith('/api')) {
      formatted = `${formatted.replace(/\/$/, '')}/api`;
    }

    await setCustomApiBaseUrl(formatted);
    setServerUrl(formatted);
    setCustomUrlInput(formatted);
    setIsEditingUrl(false);
    testConnection(formatted);
    Alert.alert('Server URL Updated', `Backend API endpoint set to:\n${formatted}`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logoutDonor();
            Alert.alert('Logged Out', 'You have been logged out.');
            loadProfile();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <SymbolView name="person.crop.circle.fill" tintColor="#FF6B00" size={84} fallback={null} />
            <View style={styles.badgeDonor}>
              <Text style={styles.badgeDonorText}>DONOR</Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.fullName || 'Food Donor'}</Text>
          <Text style={styles.email}>{user?.email || 'donor@mealbridge.org'}</Text>
        </View>
      </View>

      {/* Backend API Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Endpoint Connection</Text>
        <View style={styles.card}>
          <View style={styles.connectionHeader}>
            <View style={styles.statusIndicatorRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      connectionStatus === 'connected'
                        ? '#34C759'
                        : connectionStatus === 'checking'
                        ? '#FF9500'
                        : '#FF3B30',
                  },
                ]}
              />
              <Text style={styles.statusLabel}>
                {connectionStatus === 'connected'
                  ? 'Backend Connected (Port 5002)'
                  : connectionStatus === 'checking'
                  ? 'Checking Server Connection...'
                  : 'Backend Disconnected'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => testConnection()} disabled={isTesting}>
              {isTesting ? (
                <ActivityIndicator size="small" color="#FF6B00" />
              ) : (
                <Text style={styles.retestBtn}>Test</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.urlRow}>
            <Text style={styles.urlLabel}>Active Base URL:</Text>
            <Text style={styles.urlValue}>{serverUrl}</Text>
          </View>

          {isEditingUrl ? (
            <View style={styles.editUrlBox}>
              <TextInput
                style={styles.urlInput}
                value={customUrlInput}
                onChangeText={setCustomUrlInput}
                placeholder="http://192.168.1.X:5002/api"
                autoCapitalize="none"
              />
              <View style={styles.editUrlBtns}>
                <TouchableOpacity style={styles.saveUrlBtn} onPress={handleSaveCustomUrl}>
                  <Text style={styles.saveUrlBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelUrlBtn} onPress={() => setIsEditingUrl(false)}>
                  <Text style={styles.cancelUrlBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.changeUrlBtn} onPress={() => setIsEditingUrl(true)}>
              <SymbolView name="slider.horizontal.3" tintColor="#FF6B00" size={16} fallback={null} />
              <Text style={styles.changeUrlText}>Configure Server IP / Host</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <SymbolView name="person.text.rectangle" tintColor="#1C1C1E" size={22} fallback={null} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Full Name</Text>
              <Text style={styles.menuValue}>{user?.fullName || 'Food Donor'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <SymbolView name="mappin.and.ellipse" tintColor="#1C1C1E" size={22} fallback={null} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Pickup Location</Text>
              <Text style={styles.menuValue}>{user?.address || 'Kurunegala / Colombo'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <SymbolView name="shield.lefthalf.filled" tintColor="#1C1C1E" size={22} fallback={null} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Role</Text>
              <Text style={styles.menuValue}>Verified Food Donor ({user?.role || 'DONOR'})</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <SymbolView name="rectangle.portrait.and.arrow.right" tintColor="#FF3B30" size={20} fallback={null} />
        <Text style={styles.logoutText}>Log Out / Reset Session</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Meal Bridge v1.0.0 • Connected to Node Backend</Text>
      <View style={{ height: 40 }} />
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
    paddingTop: 28,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
    alignItems: 'center',
  },
  badgeDonor: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeDonorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    marginTop: 6,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 10,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  retestBtn: {
    color: '#FF6B00',
    fontWeight: '700',
    fontSize: 13,
  },
  urlRow: {
    paddingVertical: 10,
  },
  urlLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  urlValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  changeUrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  changeUrlText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B00',
  },
  editUrlBox: {
    paddingTop: 10,
  },
  urlInput: {
    backgroundColor: '#F9F9FB',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  editUrlBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  saveUrlBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveUrlBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelUrlBtn: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelUrlBtnText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 13,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  menuValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
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
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#C7C7CC',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 20,
  },
});
