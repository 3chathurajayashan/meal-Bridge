import { palette, PrimaryButton, RecipientShell } from '@/components/RecipientUI';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RecipientProfileScreen() {
  const [name, setName] = useState('Sarah Fernando');
  const [email, setEmail] = useState('sarah.fernando@email.com');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [location, setLocation] = useState('Colombo 03, Sri Lanka');
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState('');

  const save = () => {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.trim().length < 7) {
      setSaved(false);
      setFormError('Enter your name, a valid email address, and a phone number.');
      return;
    }
    setFormError('');
    setSaved(true);
  };

  return (
    <RecipientShell active="Profile" title="My profile" subtitle="Your details and preferences">
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>SF</Text><View style={styles.editBadge}><Text style={styles.editIcon}>✎</Text></View></View>
        <Text style={styles.profileName}>{name || 'Your name'}</Text>
        <Text style={styles.memberSince}>MealBridge community member</Text>
        <View style={styles.profileStats}><Text style={styles.profileStatValue}>03</Text><Text style={styles.profileStatLabel}>FOOD REQUESTS</Text><View style={styles.statDivider} /><Text style={styles.profileStatValue}>01</Text><Text style={styles.profileStatLabel}>MEALS RECEIVED</Text></View>
      </View>

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Personal information</Text><Text style={styles.editHint}>Edit details below</Text></View>
      <Field label="FULL NAME" value={name} onChange={(value) => { setName(value); setSaved(false); }} />
      <Field label="EMAIL ADDRESS" value={email} onChange={(value) => { setEmail(value); setSaved(false); }} keyboardType="email-address" />
      <Field label="PHONE NUMBER" value={phone} onChange={(value) => { setPhone(value); setSaved(false); }} keyboardType="phone-pad" />
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Pickup preferences</Text></View>
      <Field label="PREFERRED AREA" value={location} onChange={(value) => { setLocation(value); setSaved(false); }} />
      <View style={styles.preference}><View style={styles.preferenceIcon}><Text style={{ fontSize: 17 }}>🔔</Text></View><View style={{ flex: 1 }}><Text style={styles.preferenceTitle}>Donation expiry alerts</Text><Text style={styles.preferenceHint}>See food that should be collected soon</Text></View><View style={styles.switch}><View style={styles.switchDot} /></View></View>

      <PrimaryButton label={saved ? 'Changes saved ✓' : 'Save changes'} onPress={save} />
      {formError ? <Text accessibilityLiveRegion="polite" style={styles.formError}>{formError}</Text> : null}
      {saved ? <Text accessibilityLiveRegion="polite" style={styles.savedMessage}>Your profile has been updated in this preview.</Text> : null}
      <Pressable onPress={() => Alert.alert('Sign out', 'Sign out is not connected in this UI preview.')} style={styles.logoutButton}><Text style={styles.logoutText}>↪  Sign out</Text></Pressable>
      <Text style={styles.demoNote}>Preview experience · profile changes are not persisted</Text>
    </RecipientShell>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'} style={styles.fieldInput} />
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', backgroundColor: palette.white, borderColor: palette.line, borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 23 },
  avatar: { width: 76, height: 76, borderRadius: 27, backgroundColor: '#FFE5D2', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarText: { color: palette.orangeDark, fontSize: 24, fontWeight: '900' },
  editBadge: { position: 'absolute', width: 24, height: 24, borderRadius: 9, backgroundColor: palette.orange, borderWidth: 2, borderColor: palette.white, alignItems: 'center', justifyContent: 'center', right: -4, bottom: -2 },
  editIcon: { color: palette.white, fontSize: 12, fontWeight: '800' },
  profileName: { color: palette.ink, fontSize: 17, fontWeight: '900', marginTop: 10 },
  memberSince: { color: palette.muted, fontSize: 10, marginTop: 4 },
  profileStats: { width: '100%', borderTopWidth: 1, borderTopColor: palette.line, marginTop: 15, paddingTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  profileStatValue: { color: palette.orangeDark, fontSize: 16, fontWeight: '900' },
  profileStatLabel: { color: palette.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.3 },
  statDivider: { height: 22, width: 1, backgroundColor: palette.line, marginHorizontal: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11, marginTop: 2 },
  sectionTitle: { color: palette.ink, fontSize: 14, fontWeight: '800' },
  editHint: { color: '#9BA2AB', fontSize: 10 },
  field: { padding: 12, borderRadius: 14, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, marginBottom: 9 },
  fieldLabel: { color: '#949CA5', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  fieldInput: { color: palette.ink, fontSize: 12, fontWeight: '600', padding: 0, marginTop: 5, minHeight: 23 },
  preference: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 14, marginBottom: 17 },
  preferenceIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: '#FFF4D8', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  preferenceTitle: { color: palette.ink, fontSize: 11, fontWeight: '800' },
  preferenceHint: { color: palette.muted, fontSize: 9, marginTop: 3 },
  switch: { width: 37, height: 21, borderRadius: 12, backgroundColor: palette.orange, justifyContent: 'center', paddingHorizontal: 3 },
  switchDot: { width: 15, height: 15, borderRadius: 8, backgroundColor: palette.white, alignSelf: 'flex-end' },
  savedMessage: { color: palette.green, fontSize: 11, textAlign: 'center', marginTop: 9, fontWeight: '700' },
  formError: { color: palette.red, fontSize: 11, textAlign: 'center', marginTop: 9, fontWeight: '700' },
  logoutButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  logoutText: { color: palette.red, fontSize: 12, fontWeight: '800' },
  demoNote: { color: '#A5ABB2', fontSize: 10, textAlign: 'center', marginTop: 10 },
});
