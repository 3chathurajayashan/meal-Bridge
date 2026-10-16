import DonationCard from '@/components/DonationCard';
import { EmptyState, palette, RecipientShell, SectionHeading } from '@/components/RecipientUI';
import { donations, DonationCategory } from '@/data/recipientDemo';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const categories: ('All' | DonationCategory)[] = ['All', 'Meals', 'Bakery', 'Produce', 'Dairy'];

export default function BrowseDonationsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [expiringOnly, setExpiringOnly] = useState(false);
  const hasFilters = search.length > 0 || category !== 'All' || expiringOnly;
  const filtered = useMemo(() => donations.filter((donation) => {
    const matchesSearch = `${donation.name} ${donation.description} ${donation.donor}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesCategory = category === 'All' || donation.category === category;
    const matchesExpiry = !expiringOnly || donation.expiresIn.includes('hour');
    return donation.available && matchesSearch && matchesCategory && matchesExpiry;
  }), [category, expiringOnly, search]);

  return (
    <RecipientShell active="Browse" title="Browse donations" subtitle="Good food, shared nearby">
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Search donations"
          placeholder="Search meals, bakeries, donors..."
          placeholderTextColor="#A0A6AE"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {search.length > 0 ? <Pressable onPress={() => setSearch('')}><Text style={styles.clear}>×</Text></Pressable> : null}
      </View>

      <Pressable onPress={() => setExpiringOnly((value) => !value)} style={[styles.expiryToggle, expiringOnly && styles.expiryToggleActive]}>
        <Text style={styles.expiryIcon}>⏳</Text>
        <Text style={[styles.expiryText, expiringOnly && styles.expiryTextActive]}>Expiring soon</Text>
        <View style={[styles.toggleTrack, expiringOnly && styles.toggleTrackActive]}>
          <View style={[styles.toggleDot, expiringOnly && styles.toggleDotActive]} />
        </View>
      </Pressable>

      <View style={styles.categoryWrap}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.categoryChip, category === item && styles.categoryChipSelected]}>
            <Text style={[styles.categoryText, category === item && styles.categoryTextSelected]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeading
        title="Available nearby"
        action={hasFilters ? 'Clear filters' : undefined}
        onAction={() => { setSearch(''); setCategory('All'); setExpiringOnly(false); }}
      />
      <Text style={styles.locationLabel}>⌖  Around Colombo, Sri Lanka</Text>
      <Text style={styles.resultCount}>{filtered.length} donations to brighten your day</Text>
      {filtered.length ? filtered.map((donation) => (
        <DonationCard
          key={donation.id}
          donation={donation}
          onPress={() => router.push({ pathname: '/recipient/donation/[id]', params: { id: donation.id } })}
        />
      )) : (
        <EmptyState emoji="🔎" title="No matches just yet" message="Try a different search or remove a filter to see more food nearby." />
      )}
      <Text style={styles.demoNote}>Preview experience · sample content</Text>
    </RecipientShell>
  );
}

const styles = StyleSheet.create({
  searchBox: { minHeight: 49, borderRadius: 15, backgroundColor: palette.white, borderColor: palette.line, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, marginBottom: 11 },
  searchIcon: { color: palette.orange, fontSize: 24, marginRight: 8 },
  searchInput: { flex: 1, color: palette.ink, fontSize: 13, paddingVertical: 10 },
  clear: { color: palette.muted, fontSize: 23, paddingLeft: 8 },
  expiryToggle: { minHeight: 44, borderRadius: 14, backgroundColor: '#FFF7E3', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 13 },
  expiryToggleActive: { backgroundColor: '#FFEBC1' },
  expiryIcon: { fontSize: 16, marginRight: 8 },
  expiryText: { flex: 1, color: '#8D641A', fontSize: 12, fontWeight: '700' },
  expiryTextActive: { color: '#704B0B' },
  toggleTrack: { width: 37, height: 22, borderRadius: 12, backgroundColor: '#E1D3B0', justifyContent: 'center', paddingHorizontal: 3 },
  toggleTrackActive: { backgroundColor: palette.orange },
  toggleDot: { height: 16, width: 16, borderRadius: 8, backgroundColor: palette.white },
  toggleDotActive: { alignSelf: 'flex-end' },
  categoryWrap: { flexDirection: 'row', gap: 8, marginBottom: 22, flexWrap: 'wrap' },
  categoryChip: { paddingVertical: 8, paddingHorizontal: 13, backgroundColor: palette.white, borderRadius: 20, borderColor: palette.line, borderWidth: 1 },
  categoryChipSelected: { backgroundColor: palette.orange, borderColor: palette.orange },
  categoryText: { color: '#68717C', fontSize: 11, fontWeight: '700' },
  categoryTextSelected: { color: palette.white },
  resultCount: { color: palette.muted, fontSize: 11, marginTop: -7, marginBottom: 13 },
  locationLabel: { color: '#9BA2AB', fontSize: 10, marginTop: -7, marginBottom: 11 },
  demoNote: { color: '#A5ABB2', fontSize: 10, textAlign: 'center', marginTop: 7 },
});
