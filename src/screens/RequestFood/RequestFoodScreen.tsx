import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import { FoodItem } from '../../types/food';
import { FoodRequest } from '../../types/request';
import Header from '../../components/common/Header';
import PrimaryButton from '../../components/common/PrimaryButton';
import SuccessModal from '../../components/request/SuccessModal';
import SafeIcon from '../../components/common/SafeIcon';
import { useApp } from '../../context/AppContext';

interface RequestFoodScreenProps {
  foodItem: FoodItem;
  onBack: () => void;
  onViewCreatedRequest: (request: FoodRequest) => void;
  onGoHome: () => void;
}

const TIME_SLOTS = [
  'As Soon As Possible (ASAP)',
  'Within 1 Hour',
  'Today, 12:00 PM - 02:00 PM',
  'Today, 04:00 PM - 06:00 PM',
];

export const RequestFoodScreen: React.FC<RequestFoodScreenProps> = ({
  foodItem,
  onBack,
  onViewCreatedRequest,
  onGoHome,
}) => {
  const { user, createRequest } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState<'Pickup' | 'Delivery'>(
    foodItem.pickupType === 'Delivery' ? 'Delivery' : 'Pickup'
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || 'No. 42/B, Galle Road, Bambalapitiya');
  const [recipientNotes, setRecipientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<FoodRequest | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const maxQuantity = Math.min(foodItem.availableQuantity, 6);

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    } else {
      Alert.alert('Maximum Limit', `You can request up to ${maxQuantity} ${foodItem.unit} to ensure community fairness.`);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleConfirmRequest = async () => {
    setIsSubmitting(true);
    try {
      const newReq = await createRequest({
        foodItem,
        quantity,
        fulfillmentType,
        preferredTime: selectedTimeSlot,
        deliveryAddress: fulfillmentType === 'Delivery' ? deliveryAddress : undefined,
        recipientNotes,
      });

      setCreatedRequest(newReq);
      setIsSuccessModalVisible(true);
    } catch (error) {
      Alert.alert('Request Error', 'Could not submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Header title="Request Food" subtitle="Reserve surplus meals" showBack onBack={onBack} showActions={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Food Item Summary Banner */}
        <View style={[styles.foodSummaryCard, SHADOWS.card]}>
          <Image source={{ uri: foodItem.imageUrl }} style={styles.foodImage} />
          <View style={styles.foodDetails}>
            <Text style={styles.foodTitle} numberOfLines={2}>
              {foodItem.title}
            </Text>
            <View style={styles.donorRow}>
              <SafeIcon name="restaurant" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.donorName}>{foodItem.donor.name}</Text>
            </View>
            <Text style={styles.availableText}>
              Available: <Text style={styles.boldText}>{foodItem.availableQuantity} {foodItem.unit}</Text>
            </Text>
          </View>
        </View>

        {/* Quantity Stepper Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quantity Required</Text>
          <Text style={styles.sectionSubtitle}>
            How many {foodItem.unit} do you require? (Max {maxQuantity} per household)
          </Text>

          <View style={styles.stepperContainer}>
            <Pressable
              onPress={handleDecrement}
              disabled={quantity <= 1}
              style={[styles.stepperBtn, quantity <= 1 && styles.stepperBtnDisabled]}
              hitSlop={8}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </Pressable>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <Text style={styles.quantityUnit}>{foodItem.unit}</Text>
            </View>

            <Pressable
              onPress={handleIncrement}
              disabled={quantity >= maxQuantity}
              style={[styles.stepperBtn, quantity >= maxQuantity && styles.stepperBtnDisabled]}
              hitSlop={8}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Pickup / Delivery Options */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Fulfillment Method</Text>
          <View style={styles.optionRow}>
            {foodItem.pickupType !== 'Delivery' && (
              <Pressable
                onPress={() => setFulfillmentType('Pickup')}
                style={[
                  styles.optionCard,
                  fulfillmentType === 'Pickup' ? styles.optionCardActive : styles.optionCardInactive,
                ]}
              >
                <SafeIcon
                  name="location"
                  size={20}
                  color={fulfillmentType === 'Pickup' ? COLORS.primary : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.optionTitle,
                    fulfillmentType === 'Pickup' ? styles.optionTitleActive : styles.optionTitleInactive,
                  ]}
                >
                  Self Pickup 🚶
                </Text>
                <Text style={styles.optionDesc}>Collect directly from donor counter</Text>
              </Pressable>
            )}

            {foodItem.pickupType !== 'Pickup' && (
              <Pressable
                onPress={() => setFulfillmentType('Delivery')}
                style={[
                  styles.optionCard,
                  fulfillmentType === 'Delivery' ? styles.optionCardActive : styles.optionCardInactive,
                ]}
              >
                <SafeIcon
                  name="bicycle"
                  size={20}
                  color={fulfillmentType === 'Delivery' ? COLORS.primary : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.optionTitle,
                    fulfillmentType === 'Delivery' ? styles.optionTitleActive : styles.optionTitleInactive,
                  ]}
                >
                  Volunteer Delivery 🛵
                </Text>
                <Text style={styles.optionDesc}>Delivered by community volunteer</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Delivery Address (if delivery selected) */}
        {fulfillmentType === 'Delivery' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.inputWrapper}>
              <SafeIcon name="location-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Enter complete delivery address"
                placeholderTextColor={COLORS.textDisabled}
                style={styles.input}
              />
            </View>
          </View>
        )}

        {/* Preferred Time Slot */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferred Time</Text>
          <View style={styles.slotsContainer}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTimeSlot === slot;
              return (
                <Pressable
                  key={slot}
                  onPress={() => setSelectedTimeSlot(slot)}
                  style={[styles.slotItem, isSelected ? styles.slotItemActive : styles.slotItemInactive]}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.slotText, isSelected ? styles.slotTextActive : styles.slotTextInactive]}>
                    {slot}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Additional Note Input */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Additional Note for Donor / Volunteer</Text>
          <TextInput
            value={recipientNotes}
            onChangeText={setRecipientNotes}
            placeholder="e.g. Any dietary note, buzzer instructions, or contact details"
            placeholderTextColor={COLORS.textDisabled}
            multiline
            style={styles.textArea}
          />
        </View>

        {/* Fair Share Guidelines */}
        <View style={styles.guidelinesBox}>
          <SafeIcon name="information-circle" size={16} color={COLORS.primaryDark} style={{ marginRight: 6 }} />
          <Text style={styles.guidelinesText}>
            Community food sharing is 100% free. Please only claim what you and your household can consume.
          </Text>
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <PrimaryButton
            title="Confirm Request"
            onPress={handleConfirmRequest}
            loading={isSubmitting}
            iconName="checkmark-circle"
            size="large"
          />
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={isSuccessModalVisible}
        request={createdRequest}
        onViewRequest={() => {
          setIsSuccessModalVisible(false);
          if (createdRequest) onViewCreatedRequest(createdRequest);
        }}
        onGoHome={() => {
          setIsSuccessModalVisible(false);
          onGoHome();
        }}
      />
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
    paddingTop: SPACING.md,
    paddingBottom: 40,
  },
  foodSummaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  foodImage: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
  },
  foodDetails: {
    flex: 1,
  },
  foodTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    lineHeight: 18,
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  donorName: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
  },
  availableText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  boldText: {
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingVertical: SPACING.xs,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnDisabled: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceMuted,
  },
  stepperBtnText: {
    fontSize: 24,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDark,
    lineHeight: 28,
  },
  quantityDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  quantityValue: {
    fontSize: 28,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.black,
  },
  quantityUnit: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  optionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  optionCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'flex-start',
  },
  optionCardActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary, // Orange 500
  },
  optionCardInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  optionTitle: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  optionTitleActive: {
    color: COLORS.primaryDark,
  },
  optionTitleInactive: {
    color: COLORS.black,
  },
  optionDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
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
    marginTop: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.black,
    fontSize: FONTS.size.sm,
  },
  slotsContainer: {
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  slotItemActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
  },
  slotItemInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.primary,
  },
  slotText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
  },
  slotTextActive: {
    color: COLORS.primaryDark,
  },
  slotTextInactive: {
    color: COLORS.black,
  },
  textArea: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    height: 70,
    textAlignVertical: 'top',
    fontSize: FONTS.size.xs,
    color: COLORS.black,
    marginTop: SPACING.xs,
  },
  guidelinesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  guidelinesText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    flex: 1,
    lineHeight: 16,
  },
  submitContainer: {
    marginTop: SPACING.xs,
  },
});

export default RequestFoodScreen;
