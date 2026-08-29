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
import { RADIUS, FONTS, SPACING } from '../../constants/theme';
import SafeIcon from './SafeIcon';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  iconName?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
  borderColor?: string;
  textColor?: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  iconName,
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'large',
  borderColor = COLORS.primary, // Orange 500
  textColor = COLORS.black,     // Black text
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
          {
            height: getHeight(),
            borderColor: disabled ? COLORS.border : borderColor,
          },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="small" />
        ) : (
          <>
            {iconName && (
              <SafeIcon
                name={iconName}
                size={getFontSize() + 2}
                color={disabled ? COLORS.textDisabled : textColor}
                style={styles.iconLeft}
              />
            )}
            <Text
              style={[
                styles.text,
                {
                  fontSize: getFontSize(),
                  color: disabled ? COLORS.textDisabled : textColor,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    width: '100%',
  },
  text: {
    fontWeight: FONTS.weight.semibold,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
});

export default SecondaryButton;
