import React from 'react';
import { Modal, View, Text, StyleSheet, Image } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { FoodRequest } from '../../types/request';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import SafeIcon from '../common/SafeIcon';

interface SuccessModalProps {
  visible: boolean;
  request: FoodRequest | null;
  onViewRequest: () => void;
  onGoHome: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  request,
  onViewRequest,
  onGoHome,
}) => {
  if (!request) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.card, SHADOWS.cardHover]}>
          {/* Animated Celebration Icon */}
          <View style={styles.iconCircle}>
            <SafeIcon name="checkmark-circle" size={44} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Food Request Submitted! 🎉</Text>
          <Text style={styles.subtitle}>
            Your request has been forwarded to the donor kitchen. You can track status updates in real-time.
          </Text>

          {/* Request Quick Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryCode}>{request.requestCode}</Text>
              <Text style={styles.summaryStatus}>Status: Pending</Text>
            </View>

            <View style={styles.foodRow}>
              <Image source={{ uri: request.foodImageUrl }} style={styles.foodThumb} />
              <View style={styles.foodInfo}>
                <Text style={styles.foodName} numberOfLines={1}>
                  {request.foodTitle}
                </Text>
                <Text style={styles.donorName}>{request.donor.name}</Text>
                <Text style={styles.qtyText}>
                  Qty: {request.requestedQuantity} {request.unit} • {request.fulfillmentType}
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.actions}>
            <PrimaryButton
              title="View My Request 📦"
              onPress={onViewRequest}
              size="large"
            />
            <View style={{ height: SPACING.sm }} />
            <SecondaryButton
              title="Discover More Food 🔍"
              onPress={onGoHome}
              size="large"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primarySoft,
  },
  title: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  summaryCode: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDark,
  },
  summaryStatus: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
    color: '#B45309',
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  foodThumb: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  donorName: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  qtyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actions: {
    width: '100%',
  },
});

export default SuccessModal;
