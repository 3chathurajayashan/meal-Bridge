import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { FoodRequest } from '../../types/request';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import TrackingTimeline from '../../components/request/TrackingTimeline';
import SecondaryButton from '../../components/common/SecondaryButton';
import SafeIcon from '../../components/common/SafeIcon';
import { useApp } from '../../context/AppContext';

interface RequestTrackingScreenProps {
  request: FoodRequest;
  onBack: () => void;
}

export const RequestTrackingScreen: React.FC<RequestTrackingScreenProps> = ({
  request,
  onBack,
}) => {
  const { cancelRequest } = useApp();

  const handleCall = (phone: string, name: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Calling', `Connecting to ${name} at ${phone}`);
    });
  };

  const handleMessage = (phone: string, name: string) => {
    Linking.openURL(`sms:${phone}`).catch(() => {
      Alert.alert('Messaging', `Opening SMS chat with ${name}`);
    });
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Request',
      `Are you sure you want to cancel request ${request.requestCode}?`,
      [
        { text: 'Keep Request', style: 'cancel' },
        {
          text: 'Confirm Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelRequest(request.id, 'Cancelled by user during tracking');
            onBack();
          },
        },
      ]
    );
  };

  const isPending = request.status === 'Pending';
  const isDelivered = request.status === 'Delivered' || request.status === 'Collected';

  return (
    <View style={styles.container}>
      <Header
        title={`Track ${request.requestCode}`}
        subtitle="Live status updates"
        showBack
        onBack={onBack}
        showActions={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Header Banner */}
        <View style={[styles.statusBanner, SHADOWS.card]}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusCodeText}>{request.requestCode}</Text>
              <Text style={styles.statusTimeText}>Placed {request.createdAt}</Text>
            </View>
            <StatusBadge status={request.status} />
          </View>

          {/* Food Details Summary */}
          <View style={styles.foodRow}>
            <Image source={{ uri: request.foodImageUrl }} style={styles.foodImage} />
            <View style={styles.foodDetails}>
              <Text style={styles.foodTitle} numberOfLines={1}>
                {request.foodTitle}
              </Text>
              <Text style={styles.qtyText}>
                Quantity: <Text style={styles.boldText}>{request.requestedQuantity} {request.unit}</Text>
              </Text>
              <Text style={styles.fulfillmentTag}>
                {request.fulfillmentType === 'Delivery' ? '🛵 Volunteer Delivery' : '🚶 Self Pickup'}
              </Text>
            </View>
          </View>
        </View>

        {/* Verification PIN / QR Code Box */}
        {request.qrVerificationCode && !isDelivered && (
          <View style={styles.verificationBox}>
            <View style={styles.qrIconWrap}>
              <SafeIcon name="shield-checkmark" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.verificationTitle}>Handover Verification Code</Text>
              <Text style={styles.verificationCode}>{request.qrVerificationCode}</Text>
              <Text style={styles.verificationHint}>
                Show this code or tell volunteer/donor upon collection.
              </Text>
            </View>
          </View>
        )}

        {/* Volunteer Card (when in transit) */}
        {request.volunteer && (
          <View style={[styles.volunteerCard, SHADOWS.card]}>
            <View style={styles.volunteerHeader}>
              <Image source={{ uri: request.volunteer.avatarUrl }} style={styles.volunteerAvatar} />
              <View style={styles.volunteerInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.volunteerName}>{request.volunteer.name}</Text>
                  <View style={styles.volunteerBadge}>
                    <Text style={styles.volunteerBadgeText}>Volunteer</Text>
                  </View>
                </View>
                <Text style={styles.vehicleText}>
                  {request.volunteer.vehicleType} • {request.volunteer.vehiclePlate}
                </Text>
                <Text style={styles.etaText}>
                  ETA: <Text style={{ color: COLORS.primaryDark, fontWeight: 'bold' }}>{request.volunteer.estimatedArrivalMinutes} minutes</Text>
                </Text>
              </View>
            </View>

            <View style={styles.volunteerActions}>
              <Pressable
                onPress={() => handleCall(request.volunteer!.phone, request.volunteer!.name)}
                style={styles.contactBtn}
              >
                <SafeIcon name="call" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.contactBtnText}>Call Volunteer</Text>
              </Pressable>

              <Pressable
                onPress={() => handleMessage(request.volunteer!.phone, request.volunteer!.name)}
                style={styles.contactBtn}
              >
                <SafeIcon name="chatbubble" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.contactBtnText}>Message</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Donor Card */}
        <View style={[styles.donorCard, SHADOWS.card]}>
          <Text style={styles.cardHeaderTitle}>Donor Information</Text>
          <View style={styles.donorRow}>
            <SafeIcon name="restaurant" size={18} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.donorNameText}>{request.donor.name}</Text>
              <Text style={styles.donorAddressText}>{request.donor.address}</Text>
            </View>
            <Pressable
              onPress={() => handleCall(request.donor.phone, request.donor.name)}
              style={styles.donorCallIcon}
              hitSlop={8}
            >
              <SafeIcon name="call" size={16} color={COLORS.white} />
            </Pressable>
          </View>
        </View>

        {/* Visual 5-Stage Timeline */}
        <View style={[styles.timelineCard, SHADOWS.card]}>
          <Text style={styles.cardHeaderTitle}>Live Progress Timeline</Text>
          <TrackingTimeline timeline={request.timeline} currentStatus={request.status} />
        </View>

        {/* Cancellation Option (when pending) */}
        {isPending && (
          <View style={styles.cancelContainer}>
            <SecondaryButton
              title="Cancel Food Request"
              onPress={handleCancel}
              borderColor={COLORS.danger}
              textColor={COLORS.danger}
              size="medium"
            />
          </View>
        )}
      </ScrollView>
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
  statusBanner: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  statusCodeText: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.black,
  },
  statusTimeText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  foodImage: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
  },
  foodDetails: {
    flex: 1,
  },
  foodTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  qtyText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  boldText: {
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  fulfillmentTag: {
    fontSize: 11,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  verificationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primarySoft,
    marginBottom: SPACING.md,
  },
  qrIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  verificationTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: FONTS.weight.semibold,
  },
  verificationCode: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.primaryDark,
    letterSpacing: 1,
    marginTop: 2,
  },
  verificationHint: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  volunteerCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  volunteerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  volunteerAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceMuted,
  },
  volunteerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volunteerName: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  volunteerBadge: {
    backgroundColor: COLORS.statusInTransitBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginLeft: 6,
  },
  volunteerBadgeText: {
    fontSize: 9,
    fontWeight: FONTS.weight.bold,
    color: COLORS.statusInTransit,
  },
  vehicleText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  etaText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  volunteerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  contactBtnText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDark,
  },
  donorCard: {
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
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donorNameText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  donorAddressText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  donorCallIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cancelContainer: {
    marginTop: SPACING.sm,
  },
});

export default RequestTrackingScreen;
