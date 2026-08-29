import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SHADOWS, SPACING } from '../../constants/theme';
import { FoodRequest } from '../../types/request';
import StatusBadge from '../common/StatusBadge';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import SafeIcon from '../common/SafeIcon';

interface RequestCardProps {
  request: FoodRequest;
  onPressTrack: () => void;
  onPressCancel?: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onPressTrack,
  onPressCancel,
}) => {
  const isPending = request.status === 'Pending';
  const isCancelled = request.status === 'Cancelled';
  const isCompleted = request.status === 'Delivered' || request.status === 'Collected';

  return (
    <View style={[styles.card, SHADOWS.card]}>
      {/* Header Info */}
      <View style={styles.topRow}>
        <View style={styles.requestCodeBadge}>
          <Text style={styles.requestCodeText}>{request.requestCode}</Text>
        </View>
        <StatusBadge status={request.status} size="small" />
      </View>

      {/* Main Content */}
      <View style={styles.body}>
        <Image source={{ uri: request.foodImageUrl }} style={styles.foodImage} />

        <View style={styles.details}>
          <Text style={styles.foodTitle} numberOfLines={2}>
            {request.foodTitle}
          </Text>

          <View style={styles.donorRow}>
            <SafeIcon name="restaurant" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.donorText} numberOfLines={1}>
              {request.donor.name}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <SafeIcon name="cube" size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>
              Quantity: <Text style={styles.boldText}>{request.requestedQuantity} {request.unit}</Text>
            </Text>
          </View>

          <View style={styles.metaRow}>
            <SafeIcon name="time" size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>
              Requested: {request.createdAt}
            </Text>
          </View>
        </View>
      </View>

      {/* Fulfillment Note */}
      <View style={styles.fulfillmentRow}>
        <View style={styles.fulfillmentTag}>
          <SafeIcon
            name={request.fulfillmentType === 'Delivery' ? 'bicycle' : 'location'}
            size={12}
            color={COLORS.primaryDark}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.fulfillmentTagText}>
            {request.fulfillmentType === 'Delivery' ? 'Volunteer Delivery' : 'Self Pickup'} • {request.preferredTime}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        {!isCancelled && (
          <View style={styles.btnFlex}>
            <PrimaryButton
              title={isCompleted ? 'View Receipt / Summary' : 'Track Status 🚚'}
              onPress={onPressTrack}
              size="small"
            />
          </View>
        )}

        {isPending && onPressCancel && (
          <View style={styles.btnCancel}>
            <SecondaryButton
              title="Cancel"
              onPress={onPressCancel}
              size="small"
              borderColor={COLORS.border}
              textColor={COLORS.danger}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  requestCodeBadge: {
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  requestCodeText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  body: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  foodImage: {
    width: 74,
    height: 74,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceSecondary,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  foodTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    lineHeight: 18,
    marginBottom: 4,
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  donorText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weight.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metaText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
  },
  boldText: {
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  fulfillmentRow: {
    marginBottom: SPACING.sm,
  },
  fulfillmentTag: {
    backgroundColor: COLORS.primaryBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.xs,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  fulfillmentTagText: {
    fontSize: 11,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.primaryDark,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  btnFlex: {
    flex: 1,
  },
  btnCancel: {
    width: 90,
  },
});

export default RequestCard;
