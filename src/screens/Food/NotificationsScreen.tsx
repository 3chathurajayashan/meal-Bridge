import { EmptyState, palette, RecipientShell } from '@/components/RecipientUI';
import { useRecipientDemo } from '@/context/RecipientDemoContext';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const notifications = [
  { id: 'n1', icon: '✓', color: '#E8F7EF', title: 'Request accepted!', message: 'Green Basket Market accepted your request for a Seasonal Fruit Box.', time: 'Today · 9:24 AM', route: '/recipient/requests' as Href },
  { id: 'n2', icon: '⏳', color: '#FFF4D8', title: 'Fresh food, almost gone', message: 'Fresh Homemade Lunch is best collected within the next 2 hours.', time: 'Today · 8:50 AM', route: '/recipient/browse' as Href },
  { id: 'n3', icon: '♡', color: '#FFF0E5', title: 'Welcome to MealBridge', message: 'Find good food nearby and make your next meal a little easier.', time: 'Yesterday · 10:15 AM', route: '/food-recipient' as Href },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { markNotificationRead, markAllNotificationsRead, isNotificationRead } = useRecipientDemo();
  const unread = notifications.filter((item) => !isNotificationRead(item.id)).length;
  return (
    <RecipientShell
      active="Alerts"
      title="Notifications"
      subtitle={unread ? `${unread} new updates` : 'You’re all caught up'}
      trailing={unread ? <Pressable onPress={markAllNotificationsRead}><Text style={styles.markAll}>Read all</Text></Pressable> : null}
    >
      {notifications.length ? notifications.map((notification) => {
        const read = isNotificationRead(notification.id);
        return (
          <Pressable
            key={notification.id}
            onPress={() => {
              markNotificationRead(notification.id);
              router.push(notification.route);
            }}
            style={[styles.card, !read && styles.unreadCard]}
          >
            <View style={[styles.icon, { backgroundColor: notification.color }]}><Text style={styles.iconText}>{notification.icon}</Text></View>
            <View style={styles.copy}>
              <View style={styles.titleRow}><Text style={styles.title}>{notification.title}</Text>{!read ? <View style={styles.unreadDot} /> : null}</View>
              <Text style={styles.message}>{notification.message}</Text>
              <Text style={styles.time}>{notification.time}</Text>
            </View>
          </Pressable>
        );
      }) : (
        <EmptyState emoji="🔔" title="All quiet for now" message="We’ll let you know when there’s an update about your food requests." />
      )}
      <Text style={styles.demoNote}>Preview experience · sample notifications</Text>
    </RecipientShell>
  );
}

const styles = StyleSheet.create({
  markAll: { color: palette.orangeDark, fontSize: 11, fontWeight: '800', paddingVertical: 10, paddingLeft: 8 },
  card: { flexDirection: 'row', backgroundColor: palette.white, borderRadius: 17, borderColor: palette.line, borderWidth: 1, padding: 13, marginBottom: 11 },
  unreadCard: { backgroundColor: '#FFFCF9', borderColor: '#F8DDC9' },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  iconText: { color: palette.orangeDark, fontSize: 18, fontWeight: '800' },
  copy: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, color: palette.ink, fontSize: 12, fontWeight: '800' },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.orange },
  message: { color: palette.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  time: { color: '#9BA2AB', fontSize: 9, fontWeight: '600', marginTop: 7 },
  demoNote: { color: '#A5ABB2', fontSize: 10, textAlign: 'center', marginTop: 8 },
});
