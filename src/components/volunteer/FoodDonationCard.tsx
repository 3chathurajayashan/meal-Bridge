import React from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
} from "react-native";
import type { FoodDonation } from "../../types/volunteer";

interface FoodDonationCardProps {
    donation: FoodDonation;
}

function formatExpiry(iso?: string): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffH = Math.round(diffMs / (1000 * 60 * 60));

    if (diffH < 0)  return "Expired";
    if (diffH < 1)  return "Expires in < 1 hr";
    if (diffH < 24) return `Expires in ${diffH} hr${diffH !== 1 ? "s" : ""}`;

    const diffDays = Math.round(diffH / 24);
    return `Expires in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}

const FoodDonationCard: React.FC<FoodDonationCardProps> = ({ donation }) => {
    const expiry = formatExpiry(donation.expiresAt);
    const isExpired = expiry === "Expired";

    return (
        <View style={styles.card}>
            <Text style={styles.sectionLabel}>Donation Details</Text>

            <View style={styles.row}>
                {/* Image */}
                {donation.imageUrl ? (
                    <Image
                        source={{ uri: donation.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                        <Text style={styles.imagePlaceholderText}>🍱</Text>
                    </View>
                )}

                {/* Details */}
                <View style={styles.details}>
                    <Text style={styles.foodName} numberOfLines={2}>
                        {donation.foodName}
                    </Text>

                    <View style={styles.tagsRow}>
                        <View style={styles.quantityBadge}>
                            <Text style={styles.quantityText}>{donation.quantity}</Text>
                        </View>

                        {donation.category ? (
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{donation.category}</Text>
                            </View>
                        ) : null}
                    </View>

                    {expiry ? (
                        <Text
                            style={[
                                styles.expiry,
                                isExpired && styles.expiryExpired,
                            ]}
                        >
                            {expiry}
                        </Text>
                    ) : null}
                </View>
            </View>

            {donation.description ? (
                <>
                    <View style={styles.divider} />
                    <Text style={styles.description}>{donation.description}</Text>
                </>
            ) : null}
        </View>
    );
};

export default FoodDonationCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
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
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
    },
    image: {
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
        fontSize: 30,
    },
    details: {
        flex: 1,
        justifyContent: "center",
    },
    foodName: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1C1C1E",
        letterSpacing: -0.4,
        marginBottom: 8,
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 8,
    },
    quantityBadge: {
        backgroundColor: "#FFF3E8",
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: "#FFD5A8",
    },
    quantityText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FF6B00",
    },
    categoryBadge: {
        backgroundColor: "#F2F2F7",
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 3,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#6C6C70",
    },
    expiry: {
        fontSize: 12,
        fontWeight: "500",
        color: "#FF9500",
    },
    expiryExpired: {
        color: "#FF3B30",
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#E5E5EA",
        marginVertical: 12,
    },
    description: {
        fontSize: 14,
        color: "#3C3C43",
        lineHeight: 20,
    },
});
