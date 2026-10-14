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
  Modal,
  Switch,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import {
  getStoredUser,
  setStoredUser,
  getEffectiveBaseUrl,
  setCustomApiBaseUrl,
  logoutDonor,
  User,
} from '../../services/api';

export default function DonorProfileScreen() {
  const [user, setUser] = useState<User | null>(null);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Preference Toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [qrInstantPass, setQrInstantPass] = useState(true);

  // Server Debug Panel (Collapsible)
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const stored = await getStoredUser();
    setUser(stored);
    setEditFullName(stored?.fullName || 'Thilakshi Weliwaththa');
    setEditPhone(stored?.phoneNumber || '+94 77 123 4567');
    setEditAddress(stored?.address || 'Kurunegala, Sri Lanka');

    const url = await getEffectiveBaseUrl();
    setServerUrl(url);
    setCustomUrlInput(url);
    testConnection(url);
  };

  const testConnection = async (urlToTest?: string) => {
    const url = urlToTest || serverUrl;
    setIsTesting(true);
    try {
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
    testConnection(formatted);
    Alert.alert('Server URL Updated', `Backend API endpoint set to:\n${formatted}`);
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser: User = {
        ...(user || {
          id: '6a8170312305425a97f35bc2',
          email: 'thilakshiweliwaththa@gmail.com',
          role: 'DONOR',
        }),
        fullName: editFullName.trim(),
        phoneNumber: editPhone.trim() || '+94 77 123 4567',
        address: editAddress.trim() || 'Kurunegala, Sri Lanka',
      };

      await setStoredUser(updatedUser);
      setUser(updatedUser);
      setIsEditModalOpen(false);
      Alert.alert('Profile Updated', 'Your profile details have been saved successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to sign out from your donor account?',
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
      {/* Profile Header Banner */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>TW</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <SymbolView name="checkmark.seal.fill" tintColor="#FF6B00" size={24} fallback={null} />
          </View>
        </View>

        <Text style={styles.userName}>{user?.fullName || 'Thilakshi Weliwaththa'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'thilakshiweliwaththa@gmail.com'}</Text>

        <View style={styles.roleTag}>
          <SymbolView name="leaf.fill" tintColor="#2E7D32" size={14} fallback={null} />
          <Text style={styles.roleTagText}>Verified Food Donor</Text>
          <Text style={styles.roleTagDot}>•</Text>
          <Text style={styles.roleTagLevel}>Gold Level</Text>
        </View>

        <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditModalOpen(true)}>
          <SymbolView name="square.and.pencil" tintColor="#FF6B00" size={16} fallback={null} />
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Donor Community Impact Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>18</Text>
          <Text style={styles.statLabel}>Donations</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>420+</Text>
          <Text style={styles.statLabel}>Meals Shared</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>98%</Text>
          <Text style={styles.statLabel}>Trust Score</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>4.9 ★</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* General Profile Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Profile Details</Text>
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <SymbolView name="person.fill" tintColor="#FF6B00" size={20} fallback={null} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{user?.fullName || 'Thilakshi Weliwaththa'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <SymbolView name="envelope.fill" tintColor="#FF6B00" size={20} fallback={null} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue}>{user?.email || 'thilakshiweliwaththa@gmail.com'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <SymbolView name="phone.fill" tintColor="#FF6B00" size={20} fallback={null} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{user?.phoneNumber || '+94 77 123 4567'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <SymbolView name="mappin.circle.fill" tintColor="#FF6B00" size={20} fallback={null} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Primary Pickup Location</Text>
              <Text style={styles.detailValue}>{user?.address || 'Kurunegala, Sri Lanka'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <SymbolView name="building.2.fill" tintColor="#FF6B00" size={20} fallback={null} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Donor Category</Text>
              <Text style={styles.detailValue}>Individual Community Donor</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <SymbolView name="calendar" tintColor="#FF6B00" size={20} fallback={null} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>October 2024</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Donation & App Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences & Features</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <SymbolView name="bell.fill" tintColor="#1C1C1E" size={20} fallback={null} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.switchTitle}>Push Notifications</Text>
                <Text style={styles.switchSubtitle}>Alerts for donation claims and pickups</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E5EA', true: '#FF6B00' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <SymbolView name="qrcode" tintColor="#1C1C1E" size={20} fallback={null} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.switchTitle}>Instant QR Passes</Text>
                <Text style={styles.switchSubtitle}>Generate shareable QR pass upon publishing</Text>
              </View>
            </View>
            <Switch
              value={qrInstantPass}
              onValueChange={setQrInstantPass}
              trackColor={{ false: '#E5E5EA', true: '#FF6B00' }}
            />
          </View>
        </View>
      </View>

      {/* Safety & Guidelines */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety & Verification</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert(
                'Food Safety Pledge',
                '✓ Food is prepared or packaged in hygienic conditions.\n✓ Proper expiry dates are accurately indicated.\n✓ Stored at appropriate temperatures before pickup.'
              )
            }
          >
            <View style={styles.menuRowLeft}>
              <SymbolView name="checkmark.shield.fill" tintColor="#34C759" size={20} fallback={null} />
              <Text style={styles.menuRowTitle}>Food Safety Guidelines</Text>
            </View>
            <SymbolView name="chevron.right" tintColor="#C7C7CC" size={16} fallback={null} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert(
                'Donor Privacy & Terms',
                'Your address is only shared with verified recipients and volunteers who are assigned to pick up confirmed food donations.'
              )
            }
          >
            <View style={styles.menuRowLeft}>
              <SymbolView name="lock.fill" tintColor="#007AFF" size={20} fallback={null} />
              <Text style={styles.menuRowTitle}>Privacy & Security</Text>
            </View>
            <SymbolView name="chevron.right" tintColor="#C7C7CC" size={16} fallback={null} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Advanced / Developer Settings (Collapsible) */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.collapsibleHeader}
          onPress={() => setShowServerSettings(!showServerSettings)}
        >
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
            <Text style={styles.collapsibleTitle}>
              Server Connection ({connectionStatus === 'connected' ? 'Port 5002 Online' : 'Check Status'})
            </Text>
          </View>
          <SymbolView
            name={showServerSettings ? 'chevron.up' : 'chevron.down'}
            tintColor="#8E8E93"
            size={16}
            fallback={null}
          />
        </TouchableOpacity>

        {showServerSettings && (
          <View style={[styles.card, { marginTop: 8 }]}>
            <View style={styles.urlRow}>
              <Text style={styles.urlLabel}>Backend Endpoint:</Text>
              <Text style={styles.urlValue}>{serverUrl}</Text>
            </View>

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
                  <Text style={styles.saveUrlBtnText}>Save URL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.retestBtnBox}
                  onPress={() => testConnection()}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <ActivityIndicator size="small" color="#FF6B00" />
                  ) : (
                    <Text style={styles.retestBtnText}>Test Connection</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Log Out Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <SymbolView name="rectangle.portrait.and.arrow.right" tintColor="#FF3B30" size={20} fallback={null} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Meal Bridge v1.0.0 • Verified Food Donor Profile</Text>
      <View style={{ height: 40 }} />

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Details</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <SymbolView name="xmark.circle.fill" tintColor="#8E8E93" size={24} fallback={null} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder="Enter full name"
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.modalInput, styles.inputDisabled]}
                value={user?.email || 'thilakshiweliwaththa@gmail.com'}
                editable={false}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="+94 77 123 4567"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Default Pickup Address</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 70, textAlignVertical: 'top' }]}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="Kurunegala, Sri Lanka"
                multiline
              />

              <TouchableOpacity
                style={[styles.saveModalBtn, isSaving && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveModalBtnText}>Save Profile Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 36,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 10,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
    marginBottom: 14,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  roleTagDot: {
    color: '#81C784',
    fontSize: 12,
  },
  roleTagLevel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F57C00',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF0E5',
  },
  editProfileBtnText: {
    color: '#FF6B00',
    fontWeight: '700',
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F4F4F6',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  collapsibleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  urlRow: {
    paddingVertical: 8,
  },
  urlLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  urlValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  editUrlBox: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  urlInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  editUrlBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  saveUrlBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveUrlBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  retestBtnBox: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  retestBtnText: {
    color: '#1C1C1E',
    fontWeight: '600',
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    gap: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    color: '#C7C7CC',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1C1E',
  },
  inputDisabled: {
    backgroundColor: '#F2F2F7',
    color: '#8E8E93',
  },
  saveModalBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  saveModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
