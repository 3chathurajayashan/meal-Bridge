import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SHADOWS, SPACING } from '../../constants/theme';
import SafeIcon from './SafeIcon';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  iconName?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  iconName,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'large',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 38;
      case 'medium':
        return 46;
      case 'large':
      default:
        return 54;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return FONTS.size.sm;
      case 'medium':
        return FONTS.size.md;
      case 'large':
      default:
        return FONTS.size.lg;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[{ width: '100%' }, Array.isArray(style) ? StyleSheet.flatten(style) : style]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      <Animated.View
        style={[
          styles.button,
          { height: getHeight() },
          SHADOWS.buttonPrimary,
          disabled && styles.disabledButton,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <>
            {iconName && iconPosition === 'left' && (
              <SafeIcon name={iconName} size={getFontSize() + 2} color={COLORS.white} style={styles.iconLeft} />
            )}
            <Text style={[styles.text, { fontSize: getFontSize() }, textStyle]}>
              {title}
            </Text>
            {iconName && iconPosition === 'right' && (
              <SafeIcon name={iconName} size={getFontSize() + 2} color={COLORS.white} style={styles.iconRight} />
            )}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary, // Orange 500
    borderRadius: RADIUS.round,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    width: '100%',
  },
  disabledButton: {
    backgroundColor: COLORS.textDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

export default PrimaryButton;
