import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { createDonation, getStoredUser, User, Donation } from '../../services/api';
import DonationQRModal from '../../components/DonationQRModal';

const CATEGORIES = [
  { label: 'Prepared Meals', value: 'Prepared Meals', icon: 'fork.knife' },
  { label: 'Bakery', value: 'Baked Goods', icon: 'takeoutbag.and.cup.and.straw.fill' },
  { label: 'Produce', value: 'Produce', icon: 'leaf.fill' },
  { label: 'Groceries', value: 'Groceries', icon: 'cart.fill' },
  { label: 'Beverages', value: 'Beverages', icon: 'cup.and.saucer.fill' },
  { label: 'Other', value: 'Other', icon: 'cube.box.fill' },
];

const QUANTITY_UNITS = ['PORTIONS', 'KG', 'ITEMS', 'PACKETS', 'LITERS'];

const EXPIRY_OPTIONS = [
  { label: '3 Hours', hours: 3 },
  { label: '6 Hours', hours: 6 },
  { label: '12 Hours', hours: 12 },
  { label: '24 Hours', hours: 24 },
  { label: '48 Hours', hours: 48 },
];

export default function AddDonationScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Prepared Meals');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('PORTIONS');
  const [selectedExpiryHours, setSelectedExpiryHours] = useState<number>(6);
  const [instructions, setInstructions] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const stored = await getStoredUser();
    setUser(stored);
    if (stored.address) {
      setPickupAddress(stored.address);
    } else {
      setPickupAddress('Colombo, Sri Lanka');
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Please allow gallery permissions to attach a food photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Image picker error:', e);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for the food item.');
      return;
    }

    const parsedQty = parseInt(quantity.trim(), 10);
    if (!quantity || isNaN(parsedQty) || parsedQty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid numeric quantity (e.g. 10).');
      return;
    }

    if (!pickupAddress.trim()) {
      Alert.alert('Pickup Address', 'Please provide a pickup address for volunteers or recipients.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + selectedExpiryHours * 60 * 60 * 1000);

      const created = await createDonation({
        title: title.trim(),
        category,
        quantity: parsedQty,
        quantityUnit,
        availableFrom: now.toISOString(),
        availableUntil: expiryDate.toISOString(),
        instructions: instructions.trim(),
        pickupAddress: pickupAddress.trim(),
        latitude: user?.location?.latitude || 6.9271,
        longitude: user?.location?.longitude || 79.8612,
        imageUri: selectedImage || undefined,
      });

      setCreatedDonation(created);
    } catch (error: any) {
      console.error('Error creating donation:', error);
      Alert.alert('Submission Failed', error?.message || 'Could not connect to the server. Please check your backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setQuantity('');
    setInstructions('');
    setSelectedImage(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Donate Food</Text>
          <Text style={styles.subtitle}>List surplus food to connect with recipients and reduce food waste.</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Photo Upload Card */}
          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
                <SymbolView name="xmark.circle.fill" tintColor="#FF3B30" size={26} fallback={null} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.changeImageBtn} onPress={pickImage}>
                <Text style={styles.changeImageText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoUploadContainer} onPress={pickImage} activeOpacity={0.8}>
              <View style={styles.photoUploadIconCircle}>
                <SymbolView name="camera.fill" tintColor="#FF6B00" size={28} fallback={null} />
              </View>
              <Text style={styles.photoUploadText}>Add Food Photo</Text>
              <Text style={styles.photoUploadSubtext}>A clear photo helps recipients recognize the food.</Text>
            </TouchableOpacity>
          )}

          {/* Food Title */}
          <Text style={styles.label}>What are you donating? *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 30 Chicken Biryani Meals, 10kg Fresh Apples"
            placeholderTextColor="#8E8E93"
            value={title}
            onChangeText={setTitle}
          />

          {/* Category Chips */}
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[styles.chip, category === c.value && styles.chipSelected]}
                onPress={() => setCategory(c.value)}
              >
                <Text style={[styles.chipText, category === c.value && styles.chipTextSelected]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quantity & Unit Row */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 25"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Unit</Text>
              <View style={styles.unitSelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {QUANTITY_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, quantityUnit === u && styles.unitChipSelected]}
                      onPress={() => setQuantityUnit(u)}
                    >
                      <Text style={[styles.unitChipText, quantityUnit === u && styles.unitChipTextSelected]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Expiry Window */}
          <Text style={styles.label}>Available / Expires in</Text>
          <View style={styles.expiryRow}>
            {EXPIRY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.hours}
                style={[styles.expiryChip, selectedExpiryHours === opt.hours && styles.expiryChipSelected]}
                onPress={() => setSelectedExpiryHours(opt.hours)}
              >
                <Text style={[styles.expiryChipText, selectedExpiryHours === opt.hours && styles.expiryChipTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Special Instructions */}
          <Text style={styles.label}>Special Instructions / Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. Needs refrigeration, packaged in safe containers, call on arrival"
            placeholderTextColor="#8E8E93"
            multiline
            numberOfLines={4}
            value={instructions}
            onChangeText={setInstructions}
          />

          {/* Pickup Address */}
          <Text style={styles.label}>Pickup Address *</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationIconWrapper}>
              <SymbolView name="mappin.and.ellipse" tintColor="#FF6B00" size={24} fallback={null} />
            </View>
            <TextInput
              style={styles.locationInput}
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholder="Enter pickup address"
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.8 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Publish Donation</Text>
              <SymbolView name="arrow.right" tintColor="#FFFFFF" size={18} fallback={null} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Unique QR Code Pass Modal for Newly Created Donation */}
      <DonationQRModal
        visible={!!createdDonation}
        donation={createdDonation}
        donorName={user?.fullName || 'Thilakshi Weliwaththa'}
        onClose={() => {
          setCreatedDonation(null);
          resetForm();
          router.push('/(donor)/active');
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },
  header: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  photoUploadContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  photoUploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  photoUploadSubtext: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 18,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
  },
  changeImageBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  chipSelected: {
    backgroundColor: '#FFF0E5',
    borderColor: '#FF6B00',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  chipTextSelected: {
    color: '#FF6B00',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  halfWidth: {
    width: '48%',
  },
  unitSelector: {
    paddingVertical: 4,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
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
  expiryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expiryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  expiryChipSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  expiryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  expiryChipTextSelected: {
    color: '#FFFFFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    padding: 12,
  },
  locationIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  submitButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
