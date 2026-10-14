import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Donation, updateDonation } from '../services/api';

interface EditDonationModalProps {
  visible: boolean;
  donation: Donation | null;
  onClose: () => void;
  onUpdated: (updatedDonation: Donation) => void;
}

const CATEGORIES = [
  { label: 'Prepared Meals', value: 'Prepared Meals', icon: 'fork.knife' },
  { label: 'Bakery', value: 'Bakery', icon: 'takeoutbag.and.cup.and.saucer.fill' },
  { label: 'Produce', value: 'Produce', icon: 'leaf.fill' },
  { label: 'Groceries', value: 'Groceries', icon: 'cart.fill' },
  { label: 'Beverages', value: 'Beverages', icon: 'cup.and.saucer.fill' },
  { label: 'Other', value: 'Other', icon: 'cube.box.fill' },
];

const QUANTITY_UNITS = ['PORTIONS', 'KG', 'ITEMS', 'PACKETS', 'LITERS'];

export const EditDonationModal: React.FC<EditDonationModalProps> = ({
  visible,
  donation,
  onClose,
  onUpdated,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Prepared Meals');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('PORTIONS');
  const [instructions, setInstructions] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (donation) {
      setTitle(donation.title || '');
      setCategory(donation.category || 'Prepared Meals');
      // Extract numeric quantity
      const numericMatch = String(donation.quantity || '').match(/[\d.]+/);
      setQuantity(donation.rawQuantity ? String(donation.rawQuantity) : numericMatch ? numericMatch[0] : '1');
      setQuantityUnit(donation.quantityUnit?.toUpperCase() || 'PORTIONS');
      setInstructions(donation.instructions || '');
      setPickupAddress(donation.pickupAddress || '');
    }
  }, [donation]);

  if (!donation) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please provide a food title / item name.');
      return;
    }

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid numeric quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateDonation(donation.id, {
        title: title.trim(),
        category,
        quantity: parsedQty,
        quantityUnit,
        instructions: instructions.trim(),
        pickupAddress: pickupAddress.trim(),
      });

      Alert.alert('Donation Updated', 'Your food donation listing has been updated successfully.');
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update donation details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Edit Food Donation</Text>
              <Text style={styles.modalSubtitle}>Update details for active listing</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <SymbolView name="xmark.circle.fill" tintColor="#8E8E93" size={26} fallback={null} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
            {/* Food Title */}
            <Text style={styles.label}>Food Name / Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Fresh Bread Buns, Rice & Curry"
              placeholderTextColor="#8E8E93"
            />

            {/* Category Selector */}
            <Text style={styles.label}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => {
                const selected = category.toLowerCase() === cat.value.toLowerCase();
                return (
                  <TouchableOpacity
                    key={cat.value}
                    style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <SymbolView
                      name={cat.icon as any}
                      tintColor={selected ? '#FFFFFF' : '#FF6B00'}
                      size={16}
                      fallback={null}
                    />
                    <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Quantity and Units */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="e.g. 15"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
                  {QUANTITY_UNITS.map((unit) => {
                    const selected = quantityUnit === unit;
                    return (
                      <TouchableOpacity
                        key={unit}
                        style={[styles.unitChip, selected && styles.unitChipSelected]}
                        onPress={() => setQuantityUnit(unit)}
                      >
                        <Text style={[styles.unitChipText, selected && styles.unitChipTextSelected]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Special Instructions */}
            <Text style={styles.label}>Description / Special Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="e.g. Packaged in sanitized boxes, best if picked up before evening"
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={3}
            />

            {/* Pickup Address */}
            <Text style={styles.label}>Pickup Address *</Text>
            <View style={styles.locationContainer}>
              <SymbolView name="mappin.and.ellipse" tintColor="#FF6B00" size={20} fallback={null} />
              <TextInput
                style={styles.locationInput}
                value={pickupAddress}
                onChangeText={setPickupAddress}
                placeholder="e.g. Kottawa, Sri Lanka"
                placeholderTextColor="#8E8E93"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <SymbolView name="checkmark.circle.fill" tintColor="#FFFFFF" size={18} fallback={null} />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isSubmitting}>
                <Text style={styles.cancelBtnText}>Discard</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1C1E',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  unitSelector: {
    paddingVertical: 2,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 6,
  },
  unitChipSelected: {
    backgroundColor: '#1C1C1E',
    borderColor: '#1C1C1E',
  },
  unitChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
  },
  unitChipTextSelected: {
    color: '#FFFFFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    paddingVertical: 4,
  },
  actionsContainer: {
    marginTop: 24,
    gap: 10,
  },
  saveBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  cancelBtnText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
});
