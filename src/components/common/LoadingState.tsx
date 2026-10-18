import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import { FONTS, SPACING } from '../../constants/theme';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading available food...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
    minHeight: 220,
  },
  text: {
    marginTop: SPACING.md,
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.medium,
  },
});

export default LoadingState;
