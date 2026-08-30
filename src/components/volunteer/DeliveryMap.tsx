/**
 * DeliveryMap
 *
 * No map library (react-native-maps / expo-maps / mapbox) is present in
 * package.json, so this component renders a clean static map placeholder
 * that visually communicates the pickup → drop-off route without any
 * native map SDK.
 *
 * SWAP NOTE: When a map library is added, replace the inner <MapPlaceholder>
 * section with the real map view. The outer card shell, address rows, and
 * distance/ETA strip can stay as-is.
 */

import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Platform,
} from "react-native";
import type { AddressInfo, Coordinates } from "../../types/volunteer";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface DeliveryMapProps {
    pickupAddress: AddressInfo;
    dropOffAddress: AddressInfo;
    currentLocation?: Coordinates;
    distanceKm?: number;
    etaMinutes?: number;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function shortAddress(addr: AddressInfo): string {
    return (
        addr.fullAddress ??
        [addr.street, addr.city].filter(Boolean).join(", ") ??
        "—"
    );
}

function formatDistance(km?: number): string {
    if (km == null) return "—";
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function openMapsWithDirections(destination: AddressInfo) {
    const query = encodeURIComponent(
        destination.fullAddress ??
            [destination.street, destination.city, destination.state]
                .filter(Boolean)
                .join(", ")
    );
    const url =
        Platform.OS === "ios"
            ? `maps://?daddr=${query}`
            : `geo:0,0?q=${query}`;
    Linking.openURL(url).catch(() => {
        // Fall back to Google Maps web
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
}

// ─────────────────────────────────────────────────────────────
// Sub-component: static map visual placeholder
// ─────────────────────────────────────────────────────────────

const MapPlaceholder: React.FC<{
    hasPickupCoords: boolean;
    hasDropoffCoords: boolean;
}> = ({ hasPickupCoords, hasDropoffCoords }) => (
    <View style={styles.mapPlaceholder}>
        {/* Grid overlay that mimics a map tile */}
        <View style={styles.gridRow}>
            {[0, 1, 2, 3].map((c) => (
                <View key={c} style={styles.gridCell} />
            ))}
        </View>
        <View style={styles.gridRow}>
            {[0, 1, 2, 3].map((c) => (
                <View key={c} style={styles.gridCell} />
            ))}
        </View>
        <View style={styles.gridRow}>
            {[0, 1, 2, 3].map((c) => (
                <View key={c} style={styles.gridCell} />
            ))}
        </View>

        {/* Dashed route line */}
        <View style={styles.routeLine} />

        {/* Pickup marker — top-left area */}
        <View style={[styles.marker, styles.markerPickup, styles.markerPickupPos]}>
            <View style={styles.markerDot} />
        </View>
        <Text style={[styles.markerLabel, styles.markerLabelPickup]}>Pickup</Text>

        {/* Drop-off marker — bottom-right area */}
        <View style={[styles.marker, styles.markerDropoff, styles.markerDropoffPos]}>
            <View style={[styles.markerDot, styles.markerDotDropoff]} />
        </View>
        <Text style={[styles.markerLabel, styles.markerLabelDropoff]}>Drop-off</Text>

        {/* "No map SDK" notice */}
        <View style={styles.notice}>
            <Text style={styles.noticeText}>Map preview — tap Navigate to open maps</Text>
        </View>
    </View>
);

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

const DeliveryMap: React.FC<DeliveryMapProps> = ({
    pickupAddress,
    dropOffAddress,
    currentLocation,
    distanceKm,
    etaMinutes,
}) => {
    return (
        <View style={styles.card}>
            <Text style={styles.sectionLabel}>Route</Text>

            {/* Map area */}
            <MapPlaceholder
                hasPickupCoords={!!pickupAddress.coordinates}
                hasDropoffCoords={!!dropOffAddress.coordinates}
            />

            {/* Distance / ETA strip */}
            <View style={styles.statsStrip}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {formatDistance(distanceKm)}
                    </Text>
                    <Text style={styles.statLabel}>Distance</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {etaMinutes != null ? `~${etaMinutes} min` : "—"}
                    </Text>
                    <Text style={styles.statLabel}>Est. Travel</Text>
                </View>

                <View style={styles.statDivider} />

                {/* Navigate CTA */}
                <TouchableOpacity
                    style={styles.navigateBtn}
                    onPress={() => openMapsWithDirections(dropOffAddress)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.navigateIcon}>🗺</Text>
                    <Text style={styles.navigateText}>Navigate</Text>
                </TouchableOpacity>
            </View>

            {/* Address rows */}
            <View style={styles.addressBlock}>
                {/* Pickup */}
                <View style={styles.addressRow}>
                    <View style={[styles.addrDot, styles.addrDotPickup]} />
                    <View style={styles.addrTextBlock}>
                        <Text style={styles.addrRoleLabel}>Pickup Location</Text>
                        <Text style={styles.addrValue} numberOfLines={2}>
                            {shortAddress(pickupAddress)}
                        </Text>
                        {pickupAddress.coordinates ? (
                            <Text style={styles.coordText}>
                                {pickupAddress.coordinates.latitude.toFixed(5)},{" "}
                                {pickupAddress.coordinates.longitude.toFixed(5)}
                            </Text>
                        ) : null}
                    </View>
                    <TouchableOpacity
                        style={styles.addrBtn}
                        onPress={() => openMapsWithDirections(pickupAddress)}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.addrBtnText}>Go</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.addrConnector} />

                {/* Drop-off */}
                <View style={styles.addressRow}>
                    <View style={[styles.addrDot, styles.addrDotDropoff]} />
                    <View style={styles.addrTextBlock}>
                        <Text style={styles.addrRoleLabel}>Drop-off Location</Text>
                        <Text style={styles.addrValue} numberOfLines={2}>
                            {shortAddress(dropOffAddress)}
                        </Text>
                        {dropOffAddress.coordinates ? (
                            <Text style={styles.coordText}>
                                {dropOffAddress.coordinates.latitude.toFixed(5)},{" "}
                                {dropOffAddress.coordinates.longitude.toFixed(5)}
                            </Text>
                        ) : null}
                    </View>
                    <TouchableOpacity
                        style={styles.addrBtn}
                        onPress={() => openMapsWithDirections(dropOffAddress)}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.addrBtnText}>Go</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default DeliveryMap;

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const MAP_HEIGHT = 180;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
    },

    // ── Map placeholder ──────────────────────────────────────
    mapPlaceholder: {
        height: MAP_HEIGHT,
        backgroundColor: "#EAF0F8",
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        marginBottom: 12,
    },
    gridRow: {
        flexDirection: "row",
        flex: 1,
    },
    gridCell: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: "#D4DDE8",
    },

    // Diagonal dashed route line drawn via absolute positioning
    routeLine: {
        position: "absolute",
        top: 40,
        left: 60,
        width: 120,
        height: 2,
        backgroundColor: "#FF6B00",
        transform: [{ rotate: "30deg" }],
        opacity: 0.7,
    },

    // Pickup marker (orange pin)
    marker: {
        position: "absolute",
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    markerPickup: {
        backgroundColor: "#FF6B00",
    },
    markerDropoff: {
        backgroundColor: "#34C759",
    },
    markerPickupPos: {
        top: 28,
        left: 44,
    },
    markerDropoffPos: {
        bottom: 28,
        right: 44,
    },
    markerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#FFFFFF",
    },
    markerDotDropoff: {
        backgroundColor: "#FFFFFF",
    },
    markerLabel: {
        position: "absolute",
        fontSize: 10,
        fontWeight: "700",
        color: "#1C1C1E",
        backgroundColor: "rgba(255,255,255,0.85)",
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },
    markerLabelPickup: {
        top: 60,
        left: 30,
    },
    markerLabelDropoff: {
        bottom: 60,
        right: 22,
    },

    notice: {
        position: "absolute",
        bottom: 6,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    noticeText: {
        fontSize: 10,
        color: "#8E8E93",
        backgroundColor: "rgba(255,255,255,0.75)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },

    // ── Stats strip ──────────────────────────────────────────
    statsStrip: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 16,
        paddingBottom: 14,
    },
    stat: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1C1C1E",
        letterSpacing: -0.3,
    },
    statLabel: {
        fontSize: 11,
        color: "#8E8E93",
        fontWeight: "500",
        marginTop: 2,
    },
    statDivider: {
        width: StyleSheet.hairlineWidth,
        height: 32,
        backgroundColor: "#E5E5EA",
    },
    navigateBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6B00",
        borderRadius: 10,
        paddingVertical: 8,
        marginLeft: 8,
        gap: 5,
    },
    navigateIcon: {
        fontSize: 14,
    },
    navigateText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    // ── Address rows ──────────────────────────────────────────
    addressBlock: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    addrDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
        marginRight: 10,
    },
    addrDotPickup: {
        backgroundColor: "#FF6B00",
    },
    addrDotDropoff: {
        backgroundColor: "#34C759",
    },
    addrTextBlock: {
        flex: 1,
    },
    addrRoleLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 1,
    },
    addrValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1C1C1E",
        lineHeight: 19,
    },
    coordText: {
        fontSize: 10,
        color: "#C7C7CC",
        marginTop: 1,
    },
    addrBtn: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: "#F2F2F7",
        borderRadius: 8,
        marginLeft: 8,
        alignSelf: "center",
    },
    addrBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FF6B00",
    },
    addrConnector: {
        width: 1.5,
        height: 14,
        backgroundColor: "#C7C7CC",
        marginLeft: 5,
        marginVertical: 3,
    },
});
