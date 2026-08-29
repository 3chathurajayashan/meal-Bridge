import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { SupportedLanguage } from '../../types/user';
import Header from '../../components/common/Header';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import SafeIcon from '../../components/common/SafeIcon';
import { useApp } from '../../context/AppContext';

interface ProfileScreenProps {
  onNavigateToRequestsHistory: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToRequestsHistory,
  onLogout,
}) => {
  const { user, updateProfile, setLanguage, logout } = useApp();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editHousehold, setEditHousehold] = useState(user?.householdMembersCount.toString() || '4');

  const handleSaveProfile = async () => {
    await updateProfile({
      fullName: editName,
      phoneNumber: editPhone,
      address: editAddress,
      householdMembersCount: parseInt(editHousehold, 10) || 1,
    });
    setIsEditModalVisible(false);
    Alert.alert('Profile Updated', 'Your recipient profile details have been saved.');
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Community Food Connect?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            onLogout();
          },
        },
      ]
    );
  };

  const getLanguageLabel = (code?: SupportedLanguage) => {
    switch (code) {
      case 'si':
        return 'සිංහල (Sinhala)';
      case 'ta':
        return 'தமிழ் (Tamil)';
      case 'en':
      default:
        return 'English';
    }
  };

  return (
    <View style={styles.container}>
      <Header title="My Profile" subtitle="Recipient Account Settings" showActions={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={[styles.profileCard, SHADOWS.card]}>
          <View style={styles.avatarWrap}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {user?.fullName ? user.fullName[0] : 'P'}
                </Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <SafeIcon name="checkmark-circle" size={16} color={COLORS.white} />
            </View>
          </View>

          <Text style={styles.userName}>{user?.fullName || 'Recipient User'}</Text>
          <Text style={styles.userSub}>{user?.email || 'priyantha.f@gmail.com'}</Text>
          <Text style={styles.joinDate}>{user?.joinDate || 'Member since 2026'}</Text>

          {/* Impact Stats Bento Strip */}
          <View style={styles.impactStrip}>
            <View style={styles.impactItem}>
              <Text style={styles.impactNumber}>{user?.totalMealsReceived || 18}</Text>
              <Text style={styles.impactLabel}>Meals Received </Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactItem}>
              <Text style={styles.impactNumber}>{user?.totalKilogramsSaved || 14.5} kg</Text>
              <Text style={styles.impactLabel}>Food Waste Saved 🌱</Text>
            </View>
          </View>
        </View>

        {/* Profile Details List */}
        <View style={[styles.detailsCard, SHADOWS.card]}>
          <Text style={styles.cardHeaderTitle}>Contact & Location</Text>

          <View style={styles.detailRow}>
            <SafeIcon name="call-outline" size={18} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{user?.phoneNumber || '+94 77 123 4567'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <SafeIcon name="location-outline" size={18} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Saved Delivery Address</Text>
              <Text style={styles.detailValue}>{user?.address || 'No. 42/B, Galle Road, Bambalapitiya'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <SafeIcon name="person-outline" size={18} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Household Members</Text>
              <Text style={styles.detailValue}>{user?.householdMembersCount || 4} Persons</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={[styles.menuCard, SHADOWS.card]}>
          <Text style={styles.cardHeaderTitle}>Preferences & Support</Text>

          {/* Edit Profile */}
          <Pressable
            onPress={() => {
              setEditName(user?.fullName || '');
              setEditPhone(user?.phoneNumber || '');
              setEditAddress(user?.address || '');
              setEditHousehold(user?.householdMembersCount.toString() || '4');
              setIsEditModalVisible(true);
            }}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <SafeIcon name="create" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.menuTitle}>Edit Profile</Text>
            </View>
            <SafeIcon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          {/* Request History */}
          <Pressable onPress={onNavigateToRequestsHistory} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <SafeIcon name="cube" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.menuTitle}>Request History</Text>
            </View>
            <SafeIcon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          {/* Preferred Language */}
          <Pressable onPress={() => setIsLanguageModalVisible(true)} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <SafeIcon name="globe" size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Preferred Language</Text>
                <Text style={styles.menuSubtitle}>{getLanguageLabel(user?.preferredLanguage)}</Text>
              </View>
            </View>
            <SafeIcon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          {/* Help & Support */}
          <Pressable onPress={() => setIsHelpModalVisible(true)} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <SafeIcon name="help-circle" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.menuTitle}>Help & Support</Text>
            </View>
            <SafeIcon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <SecondaryButton
            title="Log Out 🚪"
            onPress={handleLogoutPress}
            borderColor={COLORS.border}
            textColor={COLORS.danger}
            size="large"
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.floatingBar]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Recipient Profile</Text>
              <Pressable onPress={() => setIsEditModalVisible(false)} hitSlop={8}>
                <SafeIcon name="close" size={20} color={COLORS.black} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Full Name</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Phone Number</Text>
                <TextInput
                  value={editPhone}
                  onChangeText={setEditPhone}
                  style={styles.modalInput}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Delivery Address</Text>
                <TextInput
                  value={editAddress}
                  onChangeText={setEditAddress}
                  multiline
                  style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Household Members Count</Text>
                <TextInput
                  value={editHousehold}
                  onChangeText={setEditHousehold}
                  style={styles.modalInput}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <PrimaryButton title="Save Changes" onPress={handleSaveProfile} size="medium" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selector Modal */}
      <Modal visible={isLanguageModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.floatingBar]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Preferred Language</Text>
              <Pressable onPress={() => setIsLanguageModalVisible(false)} hitSlop={8}>
                <SafeIcon name="close" size={20} color={COLORS.black} />
              </Pressable>
            </View>

            <View style={{ gap: SPACING.sm, marginVertical: SPACING.md }}>
              {[
                { code: 'en', title: 'English', sub: 'Standard Application Language' },
                { code: 'si', title: 'සිංහල (Sinhala)', sub: 'ශ්‍රී ලංකා ප්‍රජා භාෂාව' },
                { code: 'ta', title: 'தமிழ் (Tamil)', sub: 'இலங்கை தமிழ் மொழி' },
              ].map((lang) => {
                const isSelected = user?.preferredLanguage === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={async () => {
                      await setLanguage(lang.code as SupportedLanguage);
                      setIsLanguageModalVisible(false);
                    }}
                    style={[styles.langSelectCard, isSelected && styles.langSelectCardActive]}
                  >
                    <View>
                      <Text style={[styles.langSelectTitle, isSelected && styles.langSelectTitleActive]}>
                        {lang.title}
                      </Text>
                      <Text style={styles.langSelectSub}>{lang.sub}</Text>
                    </View>
                    {isSelected && (
                      <SafeIcon name="checkmark-circle" size={20} color={COLORS.primary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal visible={isHelpModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.floatingBar]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Safety Guidelines</Text>
              <Pressable onPress={() => setIsHelpModalVisible(false)} hitSlop={8}>
                <SafeIcon name="close" size={20} color={COLORS.black} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380, paddingVertical: SPACING.xs }}>
              <View style={styles.helpItem}>
                <Text style={styles.helpQuestion}>Is the food really 100% free?</Text>
                <Text style={styles.helpAnswer}>
                  Yes! All food on Community Food Connect is donated by restaurants, hotels, bakeries, and farms to eliminate food waste.
                </Text>
              </View>

              <View style={styles.helpItem}>
                <Text style={styles.helpQuestion}>How does pickup verification work?</Text>
                <Text style={styles.helpAnswer}>
                  When your request is accepted, a verification code is generated. Show this code to the counter staff or volunteer upon arrival.
                </Text>
              </View>

              <View style={styles.helpItem}>
                <Text style={styles.helpQuestion}>Need urgent assistance?</Text>
                <Text style={styles.helpAnswer}>
                  Email us at support@communityfood.lk or call community helpline 1990.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <PrimaryButton title="Close Help" onPress={() => setIsHelpModalVisible(false)} size="medium" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.round,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarFallbackText: {
    fontSize: 32,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.primaryDark,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  userSub: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  joinDate: {
    fontSize: 11,
    color: COLORS.textDisabled,
    marginTop: 2,
  },
  impactStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  impactItem: {
    alignItems: 'center',
  },
  impactNumber: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.primaryDark,
  },
  impactLabel: {
    fontSize: 10,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  impactDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.primarySoft,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardHeaderTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.black,
    marginTop: 1,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBg: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  menuTitle: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.black,
  },
  menuSubtitle: {
    fontSize: 10,
    color: COLORS.primaryDark,
    marginTop: 1,
  },
  logoutContainer: {
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  modalInputGroup: {
    marginBottom: SPACING.sm,
  },
  modalLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    fontSize: FONTS.size.xs,
    color: COLORS.black,
  },
  modalActions: {
    marginTop: SPACING.md,
  },
  langSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  langSelectCardActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
  },
  langSelectTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  langSelectTitleActive: {
    color: COLORS.primaryDark,
  },
  langSelectSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  helpItem: {
    marginBottom: SPACING.md,
  },
  helpQuestion: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  helpAnswer: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});

export default ProfileScreen;
