import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SymbolView } from 'expo-symbols';

const CATEGORIES = ['Prepared Meals', 'Groceries', 'Produce', 'Baked Goods'];
const DIETARY_TAGS = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Nut-Free'];

export default function AddDonationScreen() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiry, setExpiry] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Donate Food</Text>
          <Text style={styles.subtitle}>Fill in the details to list a new donation and help those in need.</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Photo Upload Placeholder */}
          <TouchableOpacity style={styles.photoUploadContainer}>
            <View style={styles.photoUploadIconCircle}>
               <SymbolView name="camera.fill" tintColor="#FF6B00" size={28} fallback={null} />
            </View>
            <Text style={styles.photoUploadText}>Add Food Photo</Text>
            <Text style={styles.photoUploadSubtext}>A clear photo helps recipients.</Text>
          </TouchableOpacity>

          <Text style={styles.label}>What are you donating?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50 Boxed Lunches, 10kg Fresh Vegetables"
            placeholderTextColor="#8E8E93"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {CATEGORIES.map(c => (
              <TouchableOpacity 
                key={c} 
                style={[styles.chip, category === c && styles.chipSelected]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.chipText, category === c && styles.chipTextSelected]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Quantity (Approx)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 50 servings"
                placeholderTextColor="#8E8E93"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Use By / Expiry</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Today 5 PM"
                placeholderTextColor="#8E8E93"
                value={expiry}
                onChangeText={setExpiry}
              />
            </View>
          </View>

          <Text style={styles.label}>Dietary Tags (Optional)</Text>
          <View style={styles.tagsContainer}>
            {DIETARY_TAGS.map(tag => (
              <TouchableOpacity 
                key={tag} 
                style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Special Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. Needs refrigeration, call upon arrival"
            placeholderTextColor="#8E8E93"
            multiline
            numberOfLines={4}
            value={instructions}
            onChangeText={setInstructions}
          />

          <Text style={styles.label}>Pickup Location</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationIconWrapper}>
              <SymbolView name="mappin.and.ellipse" tintColor="#FF6B00" size={24} fallback={null} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationTitle}>My Default Address</Text>
              <Text style={styles.locationDesc}>123 Main St, City Center</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Publish Donation</Text>
          <SymbolView name="arrow.right" tintColor="#FFFFFF" size={20} fallback={null} />
        </TouchableOpacity>
      </View>
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
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  photoUploadContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 12,
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  photoUploadSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
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
  },
  halfWidth: {
    width: '48%',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  tagSelected: {
    backgroundColor: '#1C1C1E',
    borderColor: '#1C1C1E',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  locationIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  locationDesc: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#1C1C1E',
    fontWeight: '600',
    fontSize: 13,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  submitButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
