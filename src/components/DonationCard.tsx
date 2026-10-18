import { Donation } from '@/data/recipientDemo';
import { palette } from '@/components/RecipientUI';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function DonationCard({
  donation,
  onPress,
  compact = false,
}: {
  donation: Donation;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.art, { backgroundColor: donation.color }, compact && styles.compactArt]}>
        <Text style={styles.emoji}>{donation.emoji}</Text>
        <View style={styles.expiry}><Text style={styles.expiryText}>{donation.expiresIn}</Text></View>
      </View>
      <View style={styles.details}>
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={1}>{donation.name}</Text>
          <Text style={styles.arrow}>›</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{donation.description}</Text>
        <View style={styles.metadata}>
          <Text style={styles.metaText}>◉ {donation.distance}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{donation.quantity} {donation.unit} left</Text>
        </View>
        <View style={styles.donorRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{donation.donorInitials}</Text></View>
          <Text style={styles.donorName} numberOfLines={1}>{donation.donor}</Text>
          <Text style={styles.category}>{donation.category}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.white, borderRadius: 19, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: palette.line },
  pressed: { opacity: 0.88 },
  art: { height: 132, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  compactArt: { height: 112 },
  emoji: { fontSize: 52 },
  expiry: { position: 'absolute', left: 12, top: 12, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  expiryText: { color: palette.amber, fontSize: 10, fontWeight: '800' },
  details: { padding: 14 },
  topLine: { flexDirection: 'row', alignItems: 'center' },
  name: { flex: 1, color: palette.ink, fontSize: 15, fontWeight: '800' },
  arrow: { color: '#A5ABB3', fontSize: 24, lineHeight: 26, marginLeft: 8 },
  description: { color: palette.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  metadata: { flexDirection: 'row', alignItems: 'center', marginTop: 11 },
  metaText: { color: '#606A76', fontSize: 11, fontWeight: '600' },
  metaDot: { color: '#AEB4BC', paddingHorizontal: 7 },
  donorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 11, borderTopColor: '#F1F2F4', borderTopWidth: 1 },
  avatar: { width: 25, height: 25, borderRadius: 9, backgroundColor: palette.orangePale, alignItems: 'center', justifyContent: 'center', marginRight: 7 },
  avatarText: { color: palette.orangeDark, fontSize: 9, fontWeight: '800' },
  donorName: { flex: 1, color: '#57616D', fontSize: 11, fontWeight: '700' },
  category: { color: palette.orangeDark, fontSize: 10, fontWeight: '700', backgroundColor: palette.orangePale, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
});
