import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { SupportedLanguage } from '../../types/user';
import PrimaryButton from '../../components/common/PrimaryButton';
import SafeIcon from '../../components/common/SafeIcon';
import { useApp } from '../../context/AppContext';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const { updateProfile, login } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [householdMembers, setHouseholdMembers] = useState('3');
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Incomplete Form', 'Please enter your Full Name, Phone Number, and Address.');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        fullName,
        email: email || `${fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        phoneNumber: phone,
        address,
        householdMembersCount: parseInt(householdMembers, 10) || 1,
        preferredLanguage,
      });
      await login(email || phone);
      Alert.alert('Welcome!', 'Your recipient account has been created.');
      onRegisterSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onNavigateToLogin} style={styles.backButton} hitSlop={10}>
            <SafeIcon name="arrow-back" size={20} color={COLORS.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Create Recipient Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.subtitle}>
          Sign up to connect with nearby community kitchens, restaurants, and grocery surplus donations.
        </Text>

        {/* Registration Card */}
        <View style={[styles.card, SHADOWS.card]}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <SafeIcon name="person-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Kasun Silva"
                placeholderTextColor={COLORS.textDisabled}
                style={styles.input}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number (For verification & delivery) *</Text>
            <View style={styles.inputWrapper}>
              <SafeIcon name="call-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +94 77 000 0000"
                placeholderTextColor={COLORS.textDisabled}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address (Optional)</Text>
            <View style={styles.inputWrapper}>
              <SafeIcon name="mail-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. kasun@gmail.com"
                placeholderTextColor={COLORS.textDisabled}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery / Pickup Home Address *</Text>
            <View style={[styles.inputWrapper, { height: 70, alignItems: 'flex-start', paddingTop: 8 }]}>
              <SafeIcon name="location-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Street address, apartment, city"
                placeholderTextColor={COLORS.textDisabled}
                multiline
                style={[styles.input, { height: 50, textAlignVertical: 'top' }]}
              />
            </View>
          </View>

          {/* Preferred Language */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Language</Text>
            <View style={styles.langRow}>
              {[
                { code: 'en', label: 'English' },
                { code: 'si', label: 'සිංහල' },
                { code: 'ta', label: 'தமிழ்' },
              ].map((lang) => {
                const active = preferredLanguage === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => setPreferredLanguage(lang.code as SupportedLanguage)}
                    style={[styles.langChip, active ? styles.langChipActive : styles.langChipInactive]}
                  >
                    <Text style={[styles.langChipText, active ? styles.langChipTextActive : styles.langChipTextInactive]}>
                      {lang.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Submit */}
          <View style={styles.btnWrap}>
            <PrimaryButton
              title="Create Account & Get Started"
              onPress={handleRegister}
              loading={isLoading}
              size="large"
            />
          </View>

          {/* Back to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={onNavigateToLogin} hitSlop={8}>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  subtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.black,
    fontSize: FONTS.size.sm,
  },
  langRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  langChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  langChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  langChipInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  langChipText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },
  langChipTextActive: {
    color: COLORS.white,
  },
  langChipTextInactive: {
    color: COLORS.black,
  },
  btnWrap: {
    marginTop: SPACING.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
});

export default RegisterScreen;
