import { palette, PrimaryButton, RecipientShell } from '@/components/RecipientUI';
import { donations } from '@/data/recipientDemo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function DonationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const donation = donations.find((item) => item.id === id);
  if (!donation) {
    return (
      <RecipientShell active="Browse" title="Donation" back={() => router.back()}>
        <Text style={styles.missing}>This sample donation could not be found.</Text>
      </RecipientShell>
    );
  }

  return (
    <RecipientShell active="Browse" title="Donation details" back={() => router.back()}>
      <View style={[styles.hero, { backgroundColor: donation.color }]}>
        <Text style={styles.foodEmoji}>{donation.emoji}</Text>
        <View style={styles.availableTag}><View style={styles.greenDot} /><Text style={styles.availableText}>Available now</Text></View>
        <Text style={styles.expiringTag}>⏳ {donation.expiresIn}</Text>
      </View>
      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{donation.name}</Text>
          <View style={styles.category}><Text style={styles.categoryText}>{donation.category}</Text></View>
        </View>
        <Text style={styles.description}>{donation.description}</Text>
      </View>
      <View style={styles.quantityCard}>
        <View><Text style={styles.smallLabel}>PORTIONS AVAILABLE</Text><Text style={styles.quantity}>{donation.quantity} <Text style={styles.unit}>{donation.unit}</Text></Text></View>
        <View style={styles.quantityDivider} />
        <View><Text style={styles.smallLabel}>PICKUP DISTANCE</Text><Text style={styles.distance}>⌖ {donation.distance}</Text></View>
      </View>
      <View style={styles.infoCard}>
        <InfoRow icon="◷" title="Best before" value={donation.expiresIn.replace('Expires ', '')} />
        <InfoRow icon="▣" title="Pickup window" value={donation.pickupWindow} />
        <InfoRow icon="⌖" title="Pickup location" value={donation.location} />
      </View>
      <View style={styles.donorCard}>
        <View style={styles.donorAvatar}><Text style={styles.donorInitials}>{donation.donorInitials}</Text></View>
        <View style={styles.donorDetails}><Text style={styles.donorLabel}>KIND DONOR</Text><Text style={styles.donorName}>{donation.donor}</Text></View>
        <Text style={styles.verified}>✓</Text>
      </View>
      <View style={styles.pickupNote}><Text style={styles.noteIcon}>ⓘ</Text><Text style={styles.noteText}>{donation.pickupInstructions}</Text></View>
      <PrimaryButton label="Request this donation  →" onPress={() => router.push({ pathname: '/recipient/request/[id]', params: { id: donation.id } })} />
      <Pressable onPress={() => setSaved((value) => !value)} style={styles.saveButton}>
        <Text style={styles.saveText}>{saved ? '♥  Saved for later' : '♡  Save for later'}</Text>
      </Pressable>
      <Text style={styles.demoNote}>Preview experience · sample content</Text>
    </RecipientShell>
  );
}

function InfoRow({ icon, title, value }: { icon: string; title: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}><Text style={styles.infoGlyph}>{icon}</Text></View>
      <View style={styles.infoCopy}><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoValue}>{value}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 195, borderRadius: 23, alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 18 },
  foodEmoji: { fontSize: 90 },
  availableTag: { position: 'absolute', left: 14, top: 14, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: palette.white, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.green },
  availableText: { color: palette.green, fontSize: 10, fontWeight: '800' },
  expiringTag: { position: 'absolute', left: 14, bottom: 14, color: '#795513', fontSize: 11, fontWeight: '800', backgroundColor: '#FFF1C9', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  titleBlock: { marginBottom: 17 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 9 },
  name: { flex: 1, color: palette.ink, fontSize: 22, lineHeight: 28, fontWeight: '900', letterSpacing: -0.4 },
  category: { backgroundColor: palette.orangePale, borderRadius: 15, paddingVertical: 6, paddingHorizontal: 9, marginTop: 4 },
  categoryText: { color: palette.orangeDark, fontSize: 10, fontWeight: '800' },
  description: { color: palette.muted, fontSize: 13, lineHeight: 20, marginTop: 7 },
  quantityCard: { flexDirection: 'row', alignItems: 'center', padding: 17, borderRadius: 18, backgroundColor: palette.white, borderColor: palette.line, borderWidth: 1, marginBottom: 12 },
  smallLabel: { color: '#9299A2', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  quantity: { color: palette.ink, fontSize: 22, fontWeight: '900', marginTop: 4 },
  unit: { color: palette.muted, fontSize: 12, fontWeight: '600' },
  quantityDivider: { width: 1, height: 38, backgroundColor: palette.line, marginHorizontal: 20 },
  distance: { color: palette.ink, fontSize: 12, fontWeight: '700', marginTop: 8 },
  infoCard: { paddingHorizontal: 14, backgroundColor: palette.white, borderRadius: 18, borderColor: palette.line, borderWidth: 1, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', minHeight: 65, borderBottomColor: '#F0F1F3', borderBottomWidth: 1 },
  infoIcon: { height: 36, width: 36, borderRadius: 12, backgroundColor: palette.orangePale, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  infoGlyph: { color: palette.orangeDark, fontSize: 17, fontWeight: '700' },
  infoCopy: { flex: 1 },
  infoTitle: { color: palette.muted, fontSize: 10, fontWeight: '600' },
  infoValue: { color: palette.ink, fontSize: 12, fontWeight: '700', marginTop: 3 },
  donorCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 17, backgroundColor: palette.white, borderColor: palette.line, borderWidth: 1, padding: 13, marginBottom: 12 },
  donorAvatar: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#FFE5D2', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  donorInitials: { color: palette.orangeDark, fontSize: 12, fontWeight: '900' },
  donorDetails: { flex: 1 },
  donorLabel: { color: '#9CA3AB', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  donorName: { color: palette.ink, fontSize: 13, fontWeight: '800', marginTop: 3 },
  verified: { width: 22, height: 22, textAlign: 'center', textAlignVertical: 'center', color: palette.green, fontWeight: '900', borderRadius: 11, backgroundColor: palette.greenPale, overflow: 'hidden' },
  pickupNote: { flexDirection: 'row', gap: 8, marginBottom: 16, padding: 12, backgroundColor: '#F1F5F9', borderRadius: 14 },
  noteIcon: { color: '#627083', fontSize: 15 },
  noteText: { flex: 1, color: '#647184', fontSize: 11, lineHeight: 17 },
  saveButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: palette.orangeDark, fontSize: 12, fontWeight: '800' },
  demoNote: { color: '#A5ABB2', fontSize: 10, textAlign: 'center', marginTop: 6 },
  missing: { color: palette.muted, textAlign: 'center', padding: 35 },
});
