import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';

export default function AddDonationScreen() {
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [instructions, setInstructions] = useState('');

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Donate Food</Text>
          <Text style={styles.subtitle}>Fill in the details to list a new donation.</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>What are you donating?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50 Boxed Lunches, 10kg Fresh Vegetables"
            placeholderTextColor="#8E8E93"
            value={foodType}
            onChangeText={setFoodType}
          />

          <Text style={styles.label}>Quantity (Approx)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50 servings, 10 kg"
            placeholderTextColor="#8E8E93"
            value={quantity}
            onChangeText={setQuantity}
          />

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
            <SymbolView name="mappin.circle.fill" tintColor="#FF6B00" size={24} fallback={null} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationTitle}>My Default Address</Text>
              <Text style={styles.locationDesc}>123 Main St, City Center</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Publish Donation</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  locationDesc: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  editText: {
    color: '#FF6B00',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: 32, // for safe area
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  submitButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
