/**
 * DeliveryDetails
 *
 * Compositing component used by /volunteer/deliveries/[id].
 * Assembles: DeliveryMap + DeliveryStatusBar + FoodDonationCard +
 * ContactCard (donor + recipient) + action button.
 *
 * All network calls and state live in the parent page; this component
 * is purely presentational and receives data + callbacks as props.
 */

import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
} from "react-native";

import DeliveryMap       from "./DeliveryMap";
import DeliveryStatusBar from "./DeliveryStatusBar";
import FoodDonationCard  from "./FoodDonationCard";
import ContactCard       from "./ContactCard";

import type { Delivery, DeliveryStatus } from "../../types/volunteer";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ActionType = "pickup" | "transit" | "delivered";

interface DeliveryDetailsProps {
    delivery: Delivery;
    /** Called when the volunteer taps the primary action button */
    onAction: (action: ActionType) => Promise<void>;
    isActionLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Derive which action button to show (or null) based on current status */
function resolveAction(
    status: DeliveryStatus
): { action: ActionType; label: string; confirmMessage: string } | null {
    switch (status) {
        case "ACCEPTED":
            return {
                action: "pickup",
                label: "Confirm Pickup",
                confirmMessage:
                    "Confirm that you have picked up the food from the donor?",
            };
        case "PICKED_UP":
            return {
                action: "transit",
                label: "Start Delivery",
                confirmMessage:
                    "Confirm that you are now on the way to the recipient?",
            };
        case "IN_TRANSIT":
            return {
                action: "delivered",
                label: "Confirm Drop-off",
                confirmMessage:
                    "Confirm that you have successfully delivered the food to the recipient?",
            };
        default:
            return null; // DELIVERED, CANCELLED, AVAILABLE — no action button
    }
}

/** Human-readable status banner text */
function statusBannerConfig(status: DeliveryStatus): {
    text: string;
    bg: string;
    color: string;
} {
    switch (status) {
        case "ACCEPTED":
            return { text: "Head to pickup location", bg: "#EBF4FF", color: "#007AFF" };
        case "PICKED_UP":
            return { text: "Food collected — ready to deliver", bg: "#FFF5E6", color: "#FF9500" };
        case "IN_TRANSIT":
            return { text: "On the way to recipient", bg: "#EDFAF1", color: "#34C759" };
        case "DELIVERED":
            return { text: "Delivery completed!", bg: "#EDFAF1", color: "#34C759" };
        case "CANCELLED":
            return { text: "This delivery was cancelled", bg: "#FFF0EF", color: "#FF3B30" };
        default:
            return { text: "", bg: "transparent", color: "#8E8E93" };
    }
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({
    delivery,
    onAction,
    isActionLoading = false,
}) => {
    const actionConfig = resolveAction(delivery.status);
    const banner       = statusBannerConfig(delivery.status);

    const handleActionPress = () => {
        if (!actionConfig || isActionLoading) return;

        Alert.alert(
            actionConfig.label,
            actionConfig.confirmMessage,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    style: "default",
                    onPress: () => onAction(actionConfig.action),
                },
            ]
        );
    };

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Status banner ───────────────────────────── */}
            {banner.text ? (
                <View style={[styles.bannerCard, { backgroundColor: banner.bg }]}>
                    <Text style={[styles.bannerText, { color: banner.color }]}>
                        {banner.text}
                    </Text>
                </View>
            ) : null}

            {/* ── Progress stepper ────────────────────────── */}
            <View style={styles.statusCard}>
                <Text style={styles.sectionLabel}>Delivery Progress</Text>
                <DeliveryStatusBar status={delivery.status} />
            </View>

            {/* ── Map ─────────────────────────────────────── */}
            <DeliveryMap
                pickupAddress={delivery.pickupAddress}
                dropOffAddress={delivery.dropOffAddress}
                distanceKm={delivery.distanceKm}
                etaMinutes={delivery.etaMinutes}
            />

            {/* ── Food / donation details ──────────────────── */}
            <FoodDonationCard donation={delivery.donation} />

            {/* ── Donor contact ────────────────────────────── */}
            <ContactCard
                label="Donor"
                contact={delivery.donor}
                address={
                    delivery.pickupAddress.fullAddress ??
                    delivery.pickupAddress.street
                }
            />

            {/* ── Recipient contact ────────────────────────── */}
            <ContactCard
                label="Recipient"
                contact={delivery.recipient}
                address={
                    delivery.dropOffAddress.fullAddress ??
                    delivery.dropOffAddress.street
                }
            />

            {/* ── Timestamps (collapsed info) ──────────────── */}
            <TimestampRow delivery={delivery} />

            {/* ── Primary action button ────────────────────── */}
            {actionConfig ? (
                <TouchableOpacity
                    style={[
                        styles.actionBtn,
                        isActionLoading && styles.actionBtnDisabled,
                    ]}
                    onPress={handleActionPress}
                    disabled={isActionLoading}
                    activeOpacity={0.8}
                >
                    {isActionLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.actionBtnText}>
                            {actionConfig.label}
                        </Text>
                    )}
                </TouchableOpacity>
            ) : null}

            {/* Bottom spacer so action button is never clipped */}
            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

// ─────────────────────────────────────────────────────────────
// Small sub-component: timestamps row
// ─────────────────────────────────────────────────────────────

function formatTs(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const TimestampRow: React.FC<{ delivery: Delivery }> = ({ delivery }) => {
    const rows = [
        { label: "Claimed",      value: formatTs(delivery.claimedAt) },
        { label: "Picked Up",    value: formatTs(delivery.pickedUpAt) },
        { label: "In Transit",   value: formatTs(delivery.inTransitAt) },
        { label: "Delivered",    value: formatTs(delivery.deliveredAt) },
    ].filter((r) => r.value !== "—");

    if (rows.length === 0) return null;

    return (
        <View style={styles.tsCard}>
            <Text style={styles.sectionLabel}>Timeline</Text>
            {rows.map((r, i) => (
                <View
                    key={r.label}
                    style={[
                        styles.tsRow,
                        i < rows.length - 1 && styles.tsRowBorder,
                    ]}
                >
                    <Text style={styles.tsLabel}>{r.label}</Text>
                    <Text style={styles.tsValue}>{r.value}</Text>
                </View>
            ))}
        </View>
    );
};

export default DeliveryDetails;

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    // ── Banner ────────────────────────────────────────────────
    bannerCard: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        alignItems: "center",
    },
    bannerText: {
        fontSize: 15,
        fontWeight: "600",
        letterSpacing: -0.2,
    },

    // ── Status card ───────────────────────────────────────────
    statusCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 8,
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
        marginBottom: 4,
    },

    // ── Timestamps ────────────────────────────────────────────
    tsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 4,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    tsRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA",
    },
    tsLabel: {
        fontSize: 14,
        color: "#1C1C1E",
        fontWeight: "400",
    },
    tsValue: {
        fontSize: 14,
        color: "#8E8E93",
        fontWeight: "400",
    },

    // ── Action button ─────────────────────────────────────────
    actionBtn: {
        height: 56,
        borderRadius: 16,
        backgroundColor: "#FF6B00",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
        shadowColor: "#FF6B00",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    actionBtnDisabled: {
        backgroundColor: "#FFBA8A",
        shadowOpacity: 0,
        elevation: 0,
    },
    actionBtnText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: -0.3,
    },

    bottomSpacer: {
        height: 32,
    },
});
