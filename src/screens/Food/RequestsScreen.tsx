import { EmptyState, palette, RecipientShell } from '@/components/RecipientUI';
import { useRecipientDemo } from '@/context/RecipientDemoContext';
import { RequestStatus } from '@/data/recipientDemo';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const filters: ('All' | RequestStatus)[] = ['All', 'Pending', 'Accepted', 'Completed', 'Rejected'];

export default function RequestsScreen() {
  const { requests } = useRecipientDemo();
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const filtered = useMemo(() => filter === 'All' ? requests : requests.filter((request) => request.status === filter), [filter, requests]);
  const pending = requests.filter((request) => request.status === 'Pending').length;

  return (
    <RecipientShell active="Requests" title="My requests" subtitle={`${pending} awaiting donor confirmation`}>
      <View style={styles.summaryStrip}>
        <View style={styles.summaryIcon}><Text style={{ fontSize: 21 }}>📬</Text></View>
        <View style={{ flex: 1 }}><Text style={styles.summaryTitle}>Your food journey</Text><Text style={styles.summaryHint}>{requests.length} requests in your preview history</Text></View>
        <Text style={styles.summaryArrow}>›</Text>
      </View>
      <View style={styles.filterRow}>
        {filters.map((item) => {
          const count = item === 'All' ? requests.length : requests.filter((request) => request.status === item).length;
          return (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterChip, filter === item && styles.filterChipSelected]}>
              <Text style={[styles.filterText, filter === item && styles.filterTextSelected]}>{item} <Text style={[styles.filterCount, filter === item && styles.filterTextSelected]}>{count}</Text></Text>
            </Pressable>
          );
        })}
      </View>
      {filtered.length ? filtered.map((request, index) => (
        <View key={request.id} style={styles.requestCard}>
          <View style={styles.requestTop}>
            <View style={[styles.foodArt, { backgroundColor: request.color }]}><Text style={styles.foodEmoji}>{request.emoji}</Text></View>
            <View style={styles.requestCopy}>
              <Text style={styles.foodName} numberOfLines={1}>{request.donationName}</Text>
              <Text style={styles.requestMeta}>{request.quantity} {request.unit} · {request.submitted}</Text>
            </View>
            <StatusPill status={request.status} />
          </View>
          <View style={styles.divider} />
          <Text style={styles.idText}>REQUEST ID <Text style={styles.idValue}>{request.id}</Text></Text>
          {request.status === 'Accepted' ? (
            <View style={styles.statusMessage}><Text style={styles.statusMessageIcon}>✓</Text><Text style={styles.statusMessageText}>Accepted! Please check pickup details with the donor.</Text></View>
          ) : request.status === 'Pending' ? (
            <View style={styles.timeline}><View style={styles.timelineDot} /><View style={styles.timelineLine} /><View style={styles.timelineHollow} /><Text style={styles.timelineText}>Sent to donor</Text><Text style={styles.timelineNext}>Awaiting confirmation</Text></View>
          ) : request.status === 'Rejected' ? (
            <View style={[styles.statusMessage, styles.rejectedMessage]}><Text style={styles.statusMessageIcon}>!</Text><Text style={styles.statusMessageText}>This request was not available. Browse for another meal.</Text></View>
          ) : (
            <View style={[styles.statusMessage, styles.completedMessage]}><Text style={styles.statusMessageIcon}>✓</Text><Text style={styles.statusMessageText}>Collection completed. Thank you for being part of the community.</Text></View>
          )}
          {request.note ? <Text style={styles.noteLine}>Your note: “{request.note}”</Text> : null}
          {request.status === 'Pending' ? <Text style={styles.cancelText}>Cancellation is unavailable in this preview</Text> : null}
          {index === 0 && request.status === 'Pending' ? <Text style={styles.demoHint}>Status is a visual preview and does not update from a donor.</Text> : null}
        </View>
      )) : (
        <EmptyState emoji="📦" title={filter === 'All' ? 'No requests yet' : `No ${filter.toLowerCase()} requests`} message="When you request a donation, you’ll find its status and pickup details here." />
      )}
      <Text style={styles.demoNote}>Preview experience · sample request history</Text>
    </RecipientShell>
  );
}

function StatusPill({ status }: { status: RequestStatus }) {
  const statusStyle = status === 'Accepted' ? styles.accepted : status === 'Pending' ? styles.pending : status === 'Rejected' ? styles.rejected : styles.completed;
  return <View style={[styles.pill, statusStyle]}><Text style={[styles.pillText, statusStyle]}>{status}</Text></View>;
}

const styles = StyleSheet.create({
  summaryStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF1E5', padding: 13, borderRadius: 17, marginBottom: 17 },
  summaryIcon: { width: 41, height: 41, borderRadius: 14, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  summaryTitle: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  summaryHint: { color: palette.muted, fontSize: 10, marginTop: 3 },
  summaryArrow: { color: palette.orangeDark, fontSize: 24 },
  filterRow: { flexDirection: 'row', gap: 7, marginBottom: 15, flexWrap: 'wrap' },
  filterChip: { borderRadius: 18, borderWidth: 1, borderColor: palette.line, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.white },
  filterChipSelected: { backgroundColor: palette.ink, borderColor: palette.ink },
  filterText: { color: '#65707C', fontSize: 10, fontWeight: '700' },
  filterCount: { color: '#929AA4', fontWeight: '600' },
  filterTextSelected: { color: palette.white },
  requestCard: { backgroundColor: palette.white, borderRadius: 18, borderColor: palette.line, borderWidth: 1, padding: 13, marginBottom: 12 },
  requestTop: { flexDirection: 'row', alignItems: 'center' },
  foodArt: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  foodEmoji: { fontSize: 25 },
  requestCopy: { flex: 1, paddingRight: 8 },
  foodName: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  requestMeta: { color: palette.muted, fontSize: 10, marginTop: 5 },
  pill: { borderRadius: 14, paddingVertical: 5, paddingHorizontal: 8 },
  pillText: { fontSize: 9, fontWeight: '800' },
  accepted: { backgroundColor: palette.greenPale, color: palette.green },
  pending: { backgroundColor: palette.amberPale, color: palette.amber },
  rejected: { backgroundColor: palette.redPale, color: palette.red },
  completed: { backgroundColor: '#EEF1F5', color: '#687483' },
  divider: { height: 1, backgroundColor: '#F0F1F3', marginVertical: 11 },
  idText: { color: '#99A0A8', fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  idValue: { color: '#68727E', fontWeight: '800' },
  statusMessage: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF9F3', padding: 9, borderRadius: 11, marginTop: 10 },
  statusMessageIcon: { color: palette.green, fontSize: 13, fontWeight: '900', marginRight: 8 },
  statusMessageText: { flex: 1, color: '#397254', fontSize: 10, lineHeight: 15, fontWeight: '600' },
  rejectedMessage: { backgroundColor: palette.redPale },
  completedMessage: { backgroundColor: '#F1F3F6' },
  timeline: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 36, marginTop: 3 },
  timelineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: palette.orange, marginRight: 6 },
  timelineLine: { width: 22, height: 2, backgroundColor: '#F3D1B7', marginRight: 6 },
  timelineHollow: { width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: '#E6A22A', marginRight: 6 },
  timelineText: { color: palette.ink, fontSize: 9, fontWeight: '700', marginRight: 5 },
  timelineNext: { color: palette.amber, fontSize: 9, fontWeight: '700' },
  noteLine: { color: palette.muted, fontSize: 10, marginTop: 9, fontStyle: 'italic' },
  cancelText: { color: '#A1A8B0', fontSize: 9, fontWeight: '600', marginTop: 9 },
  demoHint: { color: '#9AA1AA', fontSize: 9, marginTop: 7, lineHeight: 13 },
  demoNote: { color: '#A5ABB2', fontSize: 10, textAlign: 'center', marginTop: 7 },
});
