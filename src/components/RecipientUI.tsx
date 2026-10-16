import React, { PropsWithChildren } from 'react';
import type { Href } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export const palette = {
  orange: '#F97316',
  orangeDark: '#E65F0B',
  orangePale: '#FFF3E9',
  ink: '#1F2937',
  muted: '#7B8491',
  line: '#ECEEF1',
  canvas: '#F8F9FB',
  white: '#FFFFFF',
  green: '#178A58',
  greenPale: '#E8F7EF',
  amber: '#A96300',
  amberPale: '#FFF4D8',
  red: '#C44545',
  redPale: '#FCECEC',
};

export type RecipientTab = 'Home' | 'Browse' | 'Requests' | 'Alerts' | 'Profile';

const tabs: { label: RecipientTab; icon: string; route: Href }[] = [
  { label: 'Home', icon: '⌂', route: '/food-recipient' },
  { label: 'Browse', icon: '⌕', route: '/recipient/browse' },
  { label: 'Requests', icon: '▤', route: '/recipient/requests' },
  { label: 'Alerts', icon: '♧', route: '/recipient/notifications' },
  { label: 'Profile', icon: '◉', route: '/recipient/profile' },
];

export function RecipientBottomNav({ active }: { active: RecipientTab }) {
  const router = useRouter();
  return (
    <View style={styles.nav}>
      {tabs.map((tab) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tab.label}
          key={tab.label}
          onPress={() => router.replace(tab.route)}
          style={styles.navItem}
        >
          <Text style={[styles.navIcon, active === tab.label && styles.navActive]}>{tab.icon}</Text>
          <Text style={[styles.navLabel, active === tab.label && styles.navActive]}>{tab.label}</Text>
          {active === tab.label && <View style={styles.navMark} />}
        </Pressable>
      ))}
    </View>
  );
}

export function RecipientShell({
  title,
  subtitle,
  active,
  children,
  back,
  trailing,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  active: RecipientTab;
  back?: () => void;
  trailing?: React.ReactNode;
}>) {
  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <View style={styles.topRow}>
          {back ? (
            <Pressable onPress={back} style={styles.backButton} accessibilityLabel="Go back">
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
          ) : (
            <View style={styles.brandMark}><Text style={styles.brandGlyph}>M</Text></View>
          )}
          <View style={styles.topText}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {trailing}
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>{children}</View>
      </ScrollView>
      <RecipientBottomNav active={active} />
    </View>
  );
}

export function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({
  emoji,
  title,
  message,
}: {
  emoji: string;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.canvas, alignSelf: 'center', width: '100%', maxWidth: 900 },
  topBar: { backgroundColor: palette.white, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: palette.line },
  topRow: { flexDirection: 'row', alignItems: 'center', minHeight: 46 },
  brandMark: { width: 40, height: 40, borderRadius: 14, backgroundColor: palette.orange, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  brandGlyph: { color: palette.white, fontSize: 19, fontWeight: '800' },
  topText: { flex: 1 },
  title: { fontSize: 19, lineHeight: 24, fontWeight: '800', color: palette.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: palette.muted, marginTop: 2 },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: palette.canvas, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  backIcon: { color: palette.ink, fontSize: 32, lineHeight: 34, marginTop: -4 },
  scrollContent: { flexGrow: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  nav: { minHeight: 68, borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.white, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, paddingTop: 8, paddingBottom: 6 },
  navItem: { minWidth: 54, alignItems: 'center', justifyContent: 'center' },
  navIcon: { color: '#9AA1AA', fontSize: 22, fontWeight: '600', height: 26 },
  navLabel: { color: '#9299A2', fontSize: 10, fontWeight: '600', marginTop: 1 },
  navActive: { color: palette.orange },
  navMark: { position: 'absolute', width: 4, height: 4, borderRadius: 2, bottom: -4, backgroundColor: palette.orange },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: palette.ink, letterSpacing: -0.2 },
  sectionAction: { fontSize: 12, fontWeight: '700', color: palette.orange },
  primaryButton: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.orange, paddingHorizontal: 18 },
  disabledButton: { backgroundColor: '#E9B18D' },
  pressedButton: { backgroundColor: palette.orangeDark },
  primaryButtonText: { color: palette.white, fontSize: 15, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingHorizontal: 28, paddingVertical: 42, borderRadius: 20, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: palette.ink, fontSize: 16, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  emptyMessage: { color: palette.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 280 },
});
