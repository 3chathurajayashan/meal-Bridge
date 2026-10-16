import { palette, PrimaryButton, RecipientShell } from '@/components/RecipientUI';
import { donations, RecipientRequest } from '@/data/recipientDemo';
import { useRecipientDemo } from '@/context/RecipientDemoContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RequestDonationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addRequest } = useRecipientDemo();
  const donation = donations.find((item) => item.id === id);
  const [quantity, setQuantity] = useState('1');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!donation) {
    return (
      <RecipientShell active="Browse" title="Request food" back={() => router.back()}>
        <Text style={styles.error}>This sample donation could not be found.</Text>
      </RecipientShell>
    );
  }

  const amount = Number(quantity);
  const validQuantity = Number.isInteger(amount) && amount > 0 && amount <= donation.quantity;
  const submit = () => {
    if (!validQuantity) {
      setError(`Enter a whole number between 1 and ${donation.quantity}.`);
      return;
    }
    const request: RecipientRequest = {
      id: `MB-${Math.floor(1000 + Math.random() * 9000)}`,
      donationId: donation.id,
      donationName: donation.name,
      quantity: amount,
      unit: donation.unit.replace(/s$/, ''),
      status: 'Pending',
      submitted: 'Just now',
      emoji: donation.emoji,
      color: donation.color,
      note: note.trim() || undefined,
    };
    addRequest(request);
    setError('');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <RecipientShell active="Requests" title="Request sent" subtitle="Your request is in the preview" back={() => router.replace('/recipient/requests')}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}><Text style={styles.successCheck}>✓</Text></View>
          <Text style={styles.successTitle}>Request sent!</Text>
          <Text style={styles.successText}>Your request for {amount} {donation.unit} of {donation.name} is now pending.</Text>
          <View style={styles.pendingCard}>
            <Text style={styles.pendingEyebrow}>REQUEST STATUS</Text>
            <View style={styles.pendingRow}><View style={styles.pendingDot} /><Text style={styles.pendingLabel}>Pending donor confirmation</Text></View>
          </View>
          <PrimaryButton label="View my requests" onPress={() => router.replace('/recipient/requests')} />
          <Pressable onPress={() => router.replace('/food-recipient')} style={styles.homeButton}><Text style={styles.homeText}>Back to home</Text></Pressable>
        </View>
      </RecipientShell>
    );
  }

  return (
    <RecipientShell active="Browse" title="Request donation" subtitle="A few details before you go" back={() => router.back()}>
      <View style={styles.donationSummary}>
        <View style={[styles.summaryArt, { backgroundColor: donation.color }]}><Text style={styles.summaryEmoji}>{donation.emoji}</Text></View>
        <View style={styles.summaryText}>
          <Text style={styles.summaryName}>{donation.name}</Text>
          <Text style={styles.summaryMeta}>{donation.quantity} {donation.unit} available</Text>
        </View>
      </View>
      <Text style={styles.formLabel}>How much would you like?</Text>
      <View style={styles.quantityBox}>
        <Pressable accessibilityLabel="Decrease quantity" onPress={() => setQuantity(String(Math.max(1, amount - 1 || 1)))} style={styles.stepper}><Text style={styles.stepperText}>−</Text></Pressable>
        <TextInput
          accessibilityLabel="Requested quantity"
          keyboardType="number-pad"
          value={quantity}
          onChangeText={(value) => { setQuantity(value.replace(/\D/g, '')); setError(''); }}
          style={styles.quantityInput}
          maxLength={3}
        />
        <Pressable accessibilityLabel="Increase quantity" onPress={() => setQuantity(String(Math.min(donation.quantity, (amount || 0) + 1)))} style={styles.stepper}><Text style={styles.stepperText}>+</Text></Pressable>
      </View>
      <Text style={styles.helper}>Up to {donation.quantity} {donation.unit} available</Text>
      <Text style={[styles.formLabel, styles.messageLabel]}>Pickup note <Text style={styles.optional}>(optional)</Text></Text>
      <TextInput
        accessibilityLabel="Pickup note"
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={180}
        placeholder="Add a note for the donor..."
        placeholderTextColor="#A0A6AE"
        style={styles.noteInput}
        textAlignVertical="top"
      />
      <Text style={styles.characterCount}>{note.length}/180</Text>
      <View style={styles.pickupCard}>
        <Text style={styles.pickupIcon}>⌖</Text>
        <View style={styles.pickupCopy}><Text style={styles.pickupLabel}>PICKUP</Text><Text style={styles.pickupValue}>{donation.pickupWindow}</Text><Text style={styles.pickupAddress}>{donation.location}</Text></View>
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="Send request  →" onPress={submit} />
      <Text style={styles.disclaimer}>Your request will be marked pending until the donor confirms it.</Text>
      <Text style={styles.demoNote}>Preview experience · requests are stored only in this session</Text>
    </RecipientShell>
  );
}

const styles = StyleSheet.create({
  donationSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.white, borderColor: palette.line, borderWidth: 1, borderRadius: 17, padding: 11, marginBottom: 23 },
  summaryArt: { width: 58, height: 58, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  summaryEmoji: { fontSize: 30 },
  summaryText: { flex: 1 },
  summaryName: { color: palette.ink, fontSize: 13, fontWeight: '800' },
  summaryMeta: { color: palette.muted, fontSize: 11, marginTop: 5 },
  formLabel: { color: palette.ink, fontSize: 13, fontWeight: '800', marginBottom: 9 },
  quantityBox: { minHeight: 57, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 16, paddingHorizontal: 9 },
  stepper: { width: 38, height: 38, borderRadius: 12, backgroundColor: palette.orangePale, alignItems: 'center', justifyContent: 'center' },
  stepperText: { color: palette.orangeDark, fontSize: 22, fontWeight: '700', lineHeight: 25 },
  quantityInput: { color: palette.ink, fontSize: 18, fontWeight: '800', textAlign: 'center', width: 70, padding: 4 },
  helper: { color: palette.muted, fontSize: 10, marginTop: 7, marginBottom: 21 },
  messageLabel: { marginBottom: 9 },
  optional: { color: '#9BA2AB', fontSize: 11, fontWeight: '500' },
  noteInput: { minHeight: 96, borderRadius: 15, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, padding: 13, fontSize: 12, color: palette.ink },
  characterCount: { color: '#9BA2AB', fontSize: 10, textAlign: 'right', marginTop: 5, marginBottom: 18 },
  pickupCard: { flexDirection: 'row', padding: 13, backgroundColor: '#FFF5E8', borderRadius: 16, marginBottom: 17 },
  pickupIcon: { color: palette.orange, fontSize: 23, marginRight: 10 },
  pickupCopy: { flex: 1 },
  pickupLabel: { color: '#A66725', fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  pickupValue: { color: palette.ink, fontSize: 12, fontWeight: '800', marginTop: 4 },
  pickupAddress: { color: palette.muted, fontSize: 11, marginTop: 3 },
  error: { color: palette.red, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  disclaimer: { color: palette.muted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 10 },
  demoNote: { color: '#A5ABB2', fontSize: 10, textAlign: 'center', marginTop: 16 },
  successWrap: { flex: 1, alignItems: 'center', paddingTop: 45 },
  successIcon: { width: 76, height: 76, borderRadius: 27, backgroundColor: palette.greenPale, alignItems: 'center', justifyContent: 'center' },
  successCheck: { color: palette.green, fontSize: 39, fontWeight: '800' },
  successTitle: { color: palette.ink, fontSize: 24, fontWeight: '900', marginTop: 20 },
  successText: { color: palette.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 290, marginTop: 8, marginBottom: 25 },
  pendingCard: { width: '100%', backgroundColor: palette.white, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: palette.line, marginBottom: 22 },
  pendingEyebrow: { color: '#8D96A0', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E6A22A', marginRight: 8 },
  pendingLabel: { color: palette.ink, fontSize: 12, fontWeight: '700' },
  homeButton: { padding: 15 },
  homeText: { color: palette.orangeDark, fontSize: 12, fontWeight: '800' },
});
