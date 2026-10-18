import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import type { Delivery } from "../../types/volunteer";

interface DeliveryCardProps {
    delivery: Delivery;
    onClaim: (id: string) => void;
    isClaiming?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────

function formatDistance(km?: number): string {
    if (km == null) return "—";
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function formatWindow(from?: string, until?: string): string {
    if (!from && !until) return "Anytime";
    const fmt = (iso: string) =>
        new Date(iso).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    if (from && until) return `${fmt(from)} – ${fmt(until)}`;
    if (from) return `From ${fmt(from)}`;
    return `Until ${fmt(until!)}`;
}

function shortAddress(addr: {
    fullAddress?: string;
    street?: string;
    city?: string;
}): string {
    return addr.fullAddress ?? [addr.street, addr.city].filter(Boolean).join(", ") ?? "—";
}

// ─────────────────────────────────────────────────────────────

const DeliveryCard: React.FC<DeliveryCardProps> = ({
    delivery,
    onClaim,
    isClaiming = false,
}) => {
    const { donation, pickupAddress, dropOffAddress } = delivery;

    return (
        <View style={styles.card}>
            {/* Food image + info row */}
            <View style={styles.topRow}>
                {donation.imageUrl ? (
                    <Image
                        source={{ uri: donation.imageUrl }}
                        style={styles.foodImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.foodImage, styles.imagePlaceholder]}>
                        <Text style={styles.imagePlaceholderText}>🍱</Text>
                    </View>
                )}

                <View style={styles.foodInfo}>
                    <Text style={styles.foodName} numberOfLines={2}>
                        {donation.foodName}
                    </Text>

                    <Text style={styles.quantity}>
                        {donation.quantity}
                    </Text>

                    {donation.category ? (
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>
                                {donation.category}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Location block */}
            <View style={styles.locationBlock}>
                {/* Pickup */}
                <View style={styles.locationRow}>
                    <View style={[styles.dot, styles.dotPickup]} />
                    <View style={styles.locationText}>
                        <Text style={styles.locationLabel}>Pickup</Text>
                        <Text style={styles.locationValue} numberOfLines={1}>
                            {shortAddress(pickupAddress)}
                        </Text>
                    </View>
                </View>

                {/* Dashed vertical connector */}
                <View style={styles.dashedLine} />

                {/* Drop-off */}
                <View style={styles.locationRow}>
                    <View style={[styles.dot, styles.dotDropoff]} />
                    <View style={styles.locationText}>
                        <Text style={styles.locationLabel}>Drop-off</Text>
                        <Text style={styles.locationValue} numberOfLines={1}>
                            {shortAddress(dropOffAddress)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Meta chips row */}
            <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                    <Text style={styles.metaIcon}>📍</Text>
                    <Text style={styles.metaText}>
                        {formatDistance(delivery.distanceKm)}
                    </Text>
                </View>

                <View style={styles.metaChip}>
                    <Text style={styles.metaIcon}>🕐</Text>
                    <Text style={styles.metaText}>
                        {formatWindow(delivery.availableFrom, delivery.availableUntil)}
                    </Text>
                </View>

                {delivery.etaMinutes != null ? (
                    <View style={styles.metaChip}>
                        <Text style={styles.metaIcon}>⏱</Text>
                        <Text style={styles.metaText}>
                            ~{delivery.etaMinutes} min
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* Claim button */}
            <TouchableOpacity
                style={[styles.claimBtn, isClaiming && styles.claimBtnDisabled]}
                onPress={() => onClaim(delivery.id)}
                disabled={isClaiming}
                activeOpacity={0.8}
            >
                {isClaiming ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <Text style={styles.claimBtnText}>Claim Delivery</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default DeliveryCard;

// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },

    // ── Top row ──────────────────────────────────────────
    topRow: {
        flexDirection: "row",
        marginBottom: 14,
    },
    foodImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 14,
        backgroundColor: "#F2F2F7",
    },
    imagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },
    imagePlaceholderText: {
        fontSize: 32,
    },
    foodInfo: {
        flex: 1,
        justifyContent: "center",
    },
    foodName: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1C1C1E",
        letterSpacing: -0.4,
        marginBottom: 4,
    },
    quantity: {
        fontSize: 14,
        color: "#8E8E93",
        fontWeight: "500",
        marginBottom: 6,
    },
    categoryBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#FFF3E8",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: "#FFD5A8",
    },
    categoryText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#FF6B00",
        letterSpacing: 0.2,
    },

    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#E5E5EA",
        marginBottom: 14,
    },

    // ── Location ──────────────────────────────────────────
    locationBlock: {
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 3,
        marginRight: 10,
    },
    dotPickup: {
        backgroundColor: "#FF6B00",
    },
    dotDropoff: {
        backgroundColor: "#34C759",
    },
    dashedLine: {
        width: 1.5,
        height: 12,
        marginLeft: 4,
        backgroundColor: "#C7C7CC",
        marginVertical: 3,
    },
    locationText: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 1,
    },
    locationValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1C1C1E",
    },

    // ── Meta chips ──────────────────────────────────────────
    metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    metaChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 4,
    },
    metaIcon: {
        fontSize: 12,
    },
    metaText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#3C3C43",
    },

    // ── Claim button ──────────────────────────────────────────
    claimBtn: {
        height: 48,
        borderRadius: 14,
        backgroundColor: "#FF6B00",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FF6B00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 4,
    },
    claimBtnDisabled: {
        backgroundColor: "#FFBA8A",
        shadowOpacity: 0,
        elevation: 0,
    },
    claimBtnText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
});
