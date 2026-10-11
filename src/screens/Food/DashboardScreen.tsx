import DonationCard from '@/components/DonationCard';
import { palette, RecipientShell, SectionHeading } from '@/components/RecipientUI';
import { donations } from '@/data/recipientDemo';
import { useRecipientDemo } from '@/context/RecipientDemoContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { requests, unreadCount } = useRecipientDemo();
  const pendingCount = requests.filter((request) => request.status === 'Pending').length;
  const openDonation = (id: string) => router.push({ pathname: '/recipient/donation/[id]', params: { id } });

  return (
    <RecipientShell active="Home" title="MealBridge" subtitle="A little kindness, served daily">
      <View style={styles.greeting}>
        <View style={styles.greetingCopy}>
          <Text style={styles.eyebrow}>SUNDAY, OCTOBER 11</Text>
          <Text style={styles.greetingTitle}>Good morning, Sarah <Text style={styles.wave}>☀️</Text></Text>
          <Text style={styles.greetingHint}>A good meal is closer than you think.</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statOrange]}>
          <Text style={styles.statIcon}>🥗</Text>
          <Text style={styles.statNumber}>{donations.length}</Text>
          <Text style={styles.statLabel}>Available nearby</Text>
        </View>
        <View style={[styles.statCard, styles.statWhite]}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Requests pending</Text>
        </View>
      </View>

      <View style={styles.shortcutRow}>
        <Shortcut icon="⌕" title="Browse food" onPress={() => router.push('/recipient/browse')} />
        <Shortcut icon="▤" title="My requests" onPress={() => router.push('/recipient/requests')} />
        <Shortcut icon="♧" title="Notifications" badge={unreadCount} onPress={() => router.push('/recipient/notifications')} />
      </View>

      <View style={styles.expiringBanner}>
        <View style={styles.expiringIcon}><Text style={{ fontSize: 20 }}>⏳</Text></View>
        <View style={styles.expiringText}>
          <Text style={styles.expiringTitle}>Fresh finds, before they’re gone</Text>
          <Text style={styles.expiringHint}>2 nearby donations are expiring soon.</Text>
        </View>
        <Text style={styles.expiringArrow}>›</Text>
      </View>

      <SectionHeading title="Fresh near you" action="See all" onAction={() => router.push('/recipient/browse')} />
      {donations.slice(0, 3).map((donation) => (
        <DonationCard key={donation.id} donation={donation} compact onPress={() => openDonation(donation.id)} />
      ))}
      <Pressable onPress={() => router.push('/recipient/requests')} style={styles.requestLink}>
        <Text style={styles.requestLinkText}>View all my requests</Text>
        <Text style={styles.expiringArrow}>›</Text>
      </Pressable>
      <Text style={styles.demoNote}>Preview experience · sample content</Text>
    </RecipientShell>
  );
}

function Shortcut({
  icon,
  title,
  badge,
  onPress,
}: {
  icon: string;
  title: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.shortcut}>
      <View style={styles.shortcutIcon}>
        <Text style={styles.shortcutGlyph}>{icon}</Text>
        {badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}
      </View>
      <Text style={styles.shortcutTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  greeting: { borderRadius: 22, backgroundColor: palette.orange, padding: 20, marginBottom: 14, overflow: 'hidden' },
  greetingCopy: { maxWidth: 290 },
  eyebrow: { color: 'rgba(255,255,255,0.78)', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  greetingTitle: { color: palette.white, fontSize: 22, lineHeight: 29, fontWeight: '800', marginTop: 8 },
  wave: { fontSize: 20 },
  greetingHint: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 5 },
  statsRow: { flexDirection: 'row', gap: 11, marginBottom: 14 },
  statCard: { flex: 1, minHeight: 118, borderRadius: 18, padding: 15, justifyContent: 'center' },
  statOrange: { backgroundColor: '#FFF0E5' },
  statWhite: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  statIcon: { fontSize: 17 },
  statNumber: { fontSize: 25, lineHeight: 30, fontWeight: '900', color: palette.ink, marginTop: 3 },
  statLabel: { fontSize: 11, color: palette.muted, marginTop: 1, fontWeight: '600' },
  shortcutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, marginBottom: 14, backgroundColor: palette.white, borderRadius: 18, borderWidth: 1, borderColor: palette.line },
  shortcut: { flex: 1, alignItems: 'center', paddingHorizontal: 3 },
  shortcutIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: palette.orangePale, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  shortcutGlyph: { color: palette.orangeDark, fontSize: 24, fontWeight: '700' },
  badge: { position: 'absolute', top: -4, right: -4, width: 17, height: 17, borderRadius: 9, backgroundColor: '#E34F45', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: palette.white, fontSize: 9, fontWeight: '800' },
  shortcutTitle: { color: '#525D69', fontSize: 10, fontWeight: '700', marginTop: 7, textAlign: 'center' },
  expiringBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4D8', padding: 13, borderRadius: 17, marginBottom: 23, borderWidth: 1, borderColor: '#F9E5AD' },
  expiringIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#FFE8AB', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  expiringText: { flex: 1 },
  expiringTitle: { color: '#704B0B', fontSize: 12, fontWeight: '800' },
  expiringHint: { color: '#997426', fontSize: 10, marginTop: 3 },
  expiringArrow: { color: '#AA7A17', fontSize: 24, lineHeight: 27, marginLeft: 6 },
  requestLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white, borderRadius: 15, padding: 13, borderColor: palette.line, borderWidth: 1 },
  requestLinkText: { color: palette.orangeDark, fontSize: 12, fontWeight: '800' },
  demoNote: { color: '#A5ABB2', fontSize: 10, textAlign: 'center', marginTop: 17 },
});
