import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SymbolView } from 'expo-symbols';

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface NotificationCardProps {
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead?: boolean;
  onPress?: () => void;
  actionText?: string;
  onActionPress?: () => void;
}

export default function NotificationCard({
  type,
  title,
  message,
  time,
  isRead = false,
  onPress,
  actionText,
  onActionPress,
}: NotificationCardProps) {
  const getConfig = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark.circle.fill', bg: '#E8F5E9', color: '#34C759' };
      case 'warning':
        return { icon: 'exclamationmark.triangle.fill', bg: '#FFF0E5', color: '#FF6B00' };
      case 'error':
        return { icon: 'xmark.circle.fill', bg: '#FFF5F5', color: '#FF3B30' };
      case 'info':
      default:
        return { icon: 'info.circle.fill', bg: '#E3F2FD', color: '#007AFF' };
    }
  };

  const config = getConfig(type);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.container, isRead && styles.readContainer]}
    >
      {!isRead && <View style={styles.unreadIndicator} />}
      
      <View style={styles.contentWrapper}>
        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
          <SymbolView name={config.icon as any} tintColor={config.color} size={24} fallback={null} />
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, isRead && styles.readText]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
          
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>

          {actionText && onActionPress && (
            <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: config.color }]}>{actionText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    position: 'relative',
    overflow: 'hidden',
  },
  readContainer: {
    backgroundColor: '#F9F9FB',
    borderColor: '#E5E5EA',
    shadowOpacity: 0,
    elevation: 0,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#FF6B00',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  readText: {
    color: '#8E8E93',
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  message: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
