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
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import SafeIcon from '../../components/common/SafeIcon';
import { useApp } from '../../context/AppContext';

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
}) => {
  const { login } = useApp();
  const [emailOrPhone, setEmailOrPhone] = useState('priyantha.f@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrPhone.trim()) {
      Alert.alert('Required Field', 'Please enter your email or phone number.');
      return;
    }
    setIsLoading(true);
    try {
      await login(emailOrPhone);
      if (onLoginSuccess) onLoginSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmailOrPhone('priyantha.f@gmail.com');
    setPassword('demo1234');
    setIsLoading(true);
    try {
      await login('priyantha.f@gmail.com');
      if (onLoginSuccess) onLoginSuccess();
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
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <SafeIcon name="restaurant" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.brandTitle}>Community Food Connect</Text>
          <Text style={styles.brandSubtitle}>Empowering communities through shared meals</Text>

          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>👤 Food Recipient Portal</Text>
          </View>
        </View>

        {/* Login Form Card */}
        <View style={[styles.card, SHADOWS.card]}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to claim surplus food and track your requests</Text>

          {/* Email / Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Phone Number</Text>
            <View style={styles.inputWrapper}>
              <SafeIcon name="person-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                placeholder="Enter email or mobile"
                placeholderTextColor={COLORS.textDisabled}
                style={styles.input}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <Pressable hitSlop={8}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </View>
            <View style={styles.inputWrapper}>
              <SafeIcon name="shield-checkmark" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textDisabled}
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <SafeIcon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              size="large"
            />

            <View style={{ height: SPACING.sm }} />

            <SecondaryButton
              title="⚡ Fast Demo Login (Recipient)"
              onPress={handleDemoLogin}
              size="large"
            />
          </View>

          {/* Register Link */}
          {onNavigateToRegister && (
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New to Community Food Connect? </Text>
              <Pressable onPress={onNavigateToRegister} hitSlop={8}>
                <Text style={styles.registerLink}>Register</Text>
              </Pressable>
            </View>
          )}
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxxl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary, // Orange 500
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.buttonPrimary,
  },
  brandTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  roleTag: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  roleTagText: {
    color: COLORS.primaryDark,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  forgotText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.primaryDark,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 50,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.black,
    fontSize: FONTS.size.md,
  },
  buttonContainer: {
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
  registerLink: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary, // Orange 500
  },
});

export default LoginScreen;
