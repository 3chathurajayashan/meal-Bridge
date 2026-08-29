import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import SafeIcon from '../common/SafeIcon';

interface MapPreviewProps {
  locationName: string;
  address: string;
  distanceText: string;
  latitude: number;
  longitude: number;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  locationName,
  address,
  distanceText,
  latitude,
  longitude,
}) => {
  const openExternalMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) => console.error('Could not open map URL', err));
  };

  return (
    <View style={[styles.container, SHADOWS.card]}>
      {/* Map visual canvas simulation */}
      <View style={styles.mapCanvas}>
        {/* Decorative map grid lines */}
        <View style={styles.gridLineHorizontal1} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical1} />
        <View style={styles.gridLineVertical2} />
        <View style={styles.routePath} />

        {/* Origin Pin (Donor) */}
        <View style={styles.donorPin}>
          <View style={styles.pinCircle}>
            <SafeIcon name="restaurant" size={12} color={COLORS.white} />
          </View>
          <View style={styles.pinCallout}>
            <Text style={styles.pinCalloutText} numberOfLines={1}>
              {locationName}
            </Text>
          </View>
        </View>

        {/* Destination Pin (Recipient) */}
        <View style={styles.recipientPin}>
          <View style={[styles.pinCircle, { backgroundColor: COLORS.black }]}>
            <SafeIcon name="person" size={12} color={COLORS.white} />
          </View>
        </View>

        {/* Distance Badge */}
        <View style={styles.distanceBadge}>
          <SafeIcon name="location" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.distanceBadgeText}>{distanceText}</Text>
        </View>
      </View>

      {/* Location Details Footer */}
      <View style={styles.detailsRow}>
        <View style={styles.textContainer}>
          <Text style={styles.locationTitle}>{locationName}</Text>
          <Text style={styles.addressText} numberOfLines={2}>
            {address}
          </Text>
        </View>

        <Pressable
          onPress={openExternalMap}
          style={styles.directionsBtn}
          accessibilityRole="button"
          accessibilityLabel="Open in Google Maps"
        >
          <SafeIcon name="navigate" size={16} color={COLORS.primary} />
          <Text style={styles.directionsBtnText}>Directions</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapCanvas: {
    height: 140,
    backgroundColor: '#F4F7F6',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLineHorizontal1: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  gridLineVertical1: {
    position: 'absolute',
    left: '35%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  gridLineVertical2: {
    position: 'absolute',
    left: '70%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  routePath: {
    position: 'absolute',
    top: 50,
    left: 70,
    width: 130,
    height: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 20,
    transform: [{ rotate: '-12deg' }],
  },
  donorPin: {
    position: 'absolute',
    top: 30,
    left: 45,
    alignItems: 'center',
  },
  recipientPin: {
    position: 'absolute',
    bottom: 25,
    right: 50,
  },
  pinCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary, // Orange 500
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  pinCallout: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginTop: 4,
  },
  pinCalloutText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
  },
  distanceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  distanceBadgeText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  detailsRow: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  locationTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.black,
  },
  addressText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  directionsBtnText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDark,
    marginLeft: 4,
  },
});

export default MapPreview;
