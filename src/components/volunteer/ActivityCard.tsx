import React from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import type { ActivityItem, DeliveryStatus } from "../../types/volunteer";

interface ActivityCardProps {
    item: ActivityItem;
    onPress?: (id: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────

function formatDate(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatDistance(km?: number): string {
    if (km == null) return "—";
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function shortAddress(addr: {
    fullAddress?: string;
    street?: string;
    city?: string;
}): string {
    return addr.fullAddress ?? [addr.street, addr.city].filter(Boolean).join(", ") ?? "—";
}

type StatusConfig = {
    label: string;
    color: string;
    bg: string;
};

const STATUS_CONFIG: Record<DeliveryStatus, StatusConfig> = {
    AVAILABLE:  { label: "Available",   color: "#FF6B00", bg: "#FFF3E8" },
    ACCEPTED:   { label: "Accepted",    color: "#007AFF", bg: "#EBF4FF" },
    PICKED_UP:  { label: "Picked Up",   color: "#5856D6", bg: "#F0EFFE" },
    IN_TRANSIT: { label: "In Transit",  color: "#FF9500", bg: "#FFF5E6" },
    DELIVERED:  { label: "Delivered",   color: "#34C759", bg: "#EDFAF1" },
    CANCELLED:  { label: "Cancelled",   color: "#FF3B30", bg: "#FFF0EF" },
};

function renderStars(rating?: number) {
    if (!rating) return null;
    return (
        <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Text key={n} style={n <= rating ? styles.starFilled : styles.starEmpty}>
                    ★
                </Text>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────

const ActivityCard: React.FC<ActivityCardProps> = ({ item, onPress }) => {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.AVAILABLE;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress?.(item.id)}
            activeOpacity={onPress ? 0.75 : 1}
        >
            {/* Left: food image */}
            {item.donation.imageUrl ? (
                <Image
                    source={{ uri: item.donation.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                    <Text style={styles.imagePlaceholderText}>🍱</Text>
                </View>
            )}

            {/* Right: content */}
            <View style={styles.content}>
                {/* Header row: food name + status badge */}
                <View style={styles.headerRow}>
                    <Text style={styles.foodName} numberOfLines={1}>
                        {item.donation.foodName}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.statusText, { color: cfg.color }]}>
                            {cfg.label}
                        </Text>
                    </View>
                </View>

                {/* Quantity */}
                <Text style={styles.quantity}>{item.donation.quantity}</Text>

                {/* Locations */}
                <View style={styles.locationRow}>
                    <Text style={styles.locationDot}>●</Text>
                    <Text style={styles.locationText} numberOfLines={1}>
                        {shortAddress(item.pickupAddress)}
                    </Text>
                </View>
                <View style={styles.locationRow}>
                    <Text style={[styles.locationDot, styles.dotGreen]}>●</Text>
                    <Text style={styles.locationText} numberOfLines={1}>
                        {shortAddress(item.dropOffAddress)}
                    </Text>
                </View>

                {/* Footer: date, distance, rating */}
                <View style={styles.footer}>
                    <Text style={styles.metaText}>{formatDate(item.deliveredAt ?? item.createdAt)}</Text>

                    {item.distanceKm != null ? (
                        <Text style={styles.metaText}>
                            {formatDistance(item.distanceKm)}
                        </Text>
                    ) : null}

                    {renderStars(item.rating)}
                </View>

                {item.review ? (
                    <Text style={styles.review} numberOfLines={2}>
                        "{item.review}"
                    </Text>
                ) : null}
            </View>
        </TouchableOpacity>
    );
};

export default ActivityCard;

// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
    image: {
        width: 72,
        height: 72,
        borderRadius: 10,
        backgroundColor: "#F2F2F7",
        marginRight: 14,
    },
    imagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },
    imagePlaceholderText: {
        fontSize: 28,
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 3,
    },
    foodName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: "#1C1C1E",
        letterSpacing: -0.3,
        marginRight: 8,
    },
    statusBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.1,
    },
    quantity: {
        fontSize: 12,
        color: "#8E8E93",
        fontWeight: "500",
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    locationDot: {
        fontSize: 8,
        color: "#FF6B00",
        marginRight: 5,
    },
    dotGreen: {
        color: "#34C759",
    },
    locationText: {
        flex: 1,
        fontSize: 12,
        color: "#3C3C43",
        fontWeight: "400",
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 6,
    },
    metaText: {
        fontSize: 11,
        color: "#8E8E93",
        fontWeight: "500",
    },
    starsRow: {
        flexDirection: "row",
        gap: 1,
    },
    starFilled: {
        color: "#FF9500",
        fontSize: 12,
    },
    starEmpty: {
        color: "#D1D1D6",
        fontSize: 12,
    },
    review: {
        fontSize: 12,
        color: "#6C6C70",
        fontStyle: "italic",
        marginTop: 4,
        lineHeight: 17,
    },
});
