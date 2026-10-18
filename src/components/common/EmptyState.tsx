import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING } from '../../constants/theme';
import SafeIcon from './SafeIcon';
import PrimaryButton from './PrimaryButton';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search-outline',
  title,
  description,
  actionTitle,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <SafeIcon name={icon} size={36} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <View style={styles.buttonContainer}>
          <PrimaryButton title={actionTitle} onPress={onAction} size="medium" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  title: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONTS.size.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
    width: 200,
  },
});

export default EmptyState;
