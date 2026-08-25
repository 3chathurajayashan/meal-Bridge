/**
 * Delivery Detail Page — Light UI
 *
 * Shows full delivery info + "Accept Delivery" button when PENDING.
 * On accept success → navigates to the Ongoing tab.
 * DELIVERED status circle is green.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { volunteerApi } from "../../../services/api";
import type { Delivery } from "../../../types/volunteer";
import DeliveryDetails from "../../../components/volunteer/DeliveryDetails";
import LoadingState    from "../../../components/volunteer/LoadingState";
import EmptyState      from "../../../components/volunteer/EmptyState";

type ActionType = "pickup" | "transit" | "delivered";

export default function DeliveryDetailsPage() {
    const router          = useRouter();
    const { id }          = useLocalSearchParams<{ id: string }>();
    const { accessToken } = useAuth();

    const [delivery, setDelivery]           = useState<Delivery | null>(null);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [accepting, setAccepting]         = useState(false);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const scaleAnim = new Animated.Value(0.6);

    const fetchDelivery = useCallback(async () => {
        if (!accessToken || !id) return;
        try {
            setError(null);

            // First try the single-delivery endpoint (works when the volunteer
            // is already assigned to the delivery).
            let data: Delivery | null = null;
            try {
                data = await volunteerApi.getDelivery(id, accessToken);
            } catch {
                // The single-delivery endpoint returns 403 for PENDING deliveries
                // because no volunteer is assigned yet. Fall back to the available
                // list and find the matching entry so the volunteer can still view
                // and accept.
                const available = await volunteerApi.getAvailableDeliveries(accessToken);
                data = available.find((d) => d.id === id) ?? null;
            }

            if (!data) {
                setError("Delivery not found or no longer available.");
            } else {
                setDelivery(data);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load delivery details.");
        } finally {
            setLoading(false);
        }
    }, [accessToken, id]);

    useEffect(() => {
        fetchDelivery();
    }, [fetchDelivery]);

    // ── Accept delivery ──────────────────────────────────────
    const handleAccept = async () => {
        if (!accessToken || !id || accepting) return;
        setAccepting(true);
        try {
            const updated = await volunteerApi.claimDelivery(id, accessToken);
            setDelivery(updated);

            setShowSuccessModal(true);
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 80,
                friction: 8,
            }).start();

            setTimeout(() => {
                setShowSuccessModal(false);
                router.replace("/volunteer/deliveries/ongoing");
            }, 1800);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not accept delivery.");
        } finally {
            setAccepting(false);
        }
    };

    // ── In-progress status actions ───────────────────────────
    const handleAction = async (action: ActionType) => {
        if (!accessToken || !id || actionLoading) return;
        setActionLoading(true);
        try {
            let updated: Delivery;
            switch (action) {
                case "pickup":
                    updated = await volunteerApi.confirmPickup(id, accessToken);
                    break;
                case "transit":
                    updated = await volunteerApi.startTransit(id, accessToken);
                    break;
                case "delivered":
                    updated = await volunteerApi.confirmDelivered(id, accessToken);
                    break;
            }
            setDelivery(updated!);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Action failed.");
        } finally {
            setActionLoading(false);
        }
    };

    // Show Accept button only when PENDING (no volunteer assigned yet)
    const showAcceptButton =
        delivery !== null &&
        (delivery.status as string) === "PENDING";

    // Delivered status uses green circle
    const isDelivered = delivery?.status === "DELIVERED";

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ── Header ───────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Ionicons name="chevron-back" size={28} color="#FF6B00" />
                </TouchableOpacity>

                <Text style={styles.headerTitle} numberOfLines={1}>
                    {delivery ? delivery.donation.foodName : "Delivery Details"}
                </Text>

                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={fetchDelivery}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Ionicons name="refresh-outline" size={22} color="#FF6B00" />
                </TouchableOpacity>
            </View>

            {/* ── Error banner ─────────────────────────── */}
            {error ? (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => setError(null)}>
                        <Ionicons name="close" size={18} color="#8E8E93" />
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* ── Content ──────────────────────────────── */}
            {loading ? (
                <View style={styles.centerState}>
                    <LoadingState message="Loading delivery…" />
                </View>
            ) : error && !delivery ? (
                <EmptyState
                    icon="warning-outline"
                    title="Something went wrong"
                    subtitle={error ?? ""}
                    actionLabel="Try Again"
                    onAction={fetchDelivery}
                />
            ) : delivery ? (
                <>
                    {/* Delivered status banner */}
                    {isDelivered && (
                        <View style={styles.deliveredBanner}>
                            <View style={styles.deliveredIconCircle}>
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            </View>
                            <Text style={styles.deliveredBannerText}>Delivery Completed</Text>
                        </View>
                    )}

                    {/* Accept button — shown when PENDING */}
                    {showAcceptButton && (
                        <View style={styles.acceptBar}>
                            <TouchableOpacity
                                style={[styles.acceptBtn, accepting && styles.acceptBtnDisabled]}
                                onPress={handleAccept}
                                disabled={accepting}
                                activeOpacity={0.85}
                            >
                                {accepting ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="car-outline" size={20} color="#FFF" />
                                        <Text style={styles.acceptBtnText}>Accept Delivery</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    <DeliveryDetails
                        delivery={delivery}
                        onAction={handleAction}
                        isActionLoading={actionLoading}
                    />
                </>
            ) : (
                <EmptyState
                    icon="cube-outline"
                    title="Delivery not found"
                    subtitle="This delivery may have been removed or already claimed."
                    actionLabel="Go Back"
                    onAction={() => router.back()}
                />
            )}

            {/* ── Accept success modal ─────────────────── */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                statusBarTranslucent
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}
                    >
                        <Ionicons name="happy-outline" size={52} color="#FF6B00" style={{ marginBottom: 16 }} />
                        <Text style={styles.modalTitle}>Delivery Accepted!</Text>
                        <Text style={styles.modalSubtitle}>
                            Heading to your Ongoing screen…
                        </Text>
                        <ActivityIndicator color="#FF6B00" style={{ marginTop: 4 }} />
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea:    { flex: 1, backgroundColor: "#F2F2F7" },
    centerState: { flex: 1, backgroundColor: "#F2F2F7" },

    // Header
    header: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 14,
        backgroundColor: "#F2F2F7",
    },
    backBtn:     { marginRight: 8 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.4 },
    refreshBtn:  { marginLeft: 8 },

    // Error banner
    errorBanner: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 16, marginTop: 8,
        backgroundColor: "#FFF0EF", borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 10,
        borderWidth: 1, borderColor: "rgba(255,59,48,0.25)",
    },
    errorText:    { flex: 1, fontSize: 13, color: "#FF3B30", fontWeight: "500" },
    errorDismiss: { fontSize: 14, color: "#8E8E93", marginLeft: 10 },

    // Delivered banner (green)
    deliveredBanner: {
        flexDirection: "row", alignItems: "center",
        marginHorizontal: 16, marginTop: 8, marginBottom: 4,
        backgroundColor: "#EDFAF1", borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 12,
        borderWidth: 1, borderColor: "rgba(52,199,89,0.3)",
        gap: 10,
    },
    deliveredIconCircle: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: "#34C759",
        alignItems: "center", justifyContent: "center",
    },
    deliveredIconText:   { color: "#FFF", fontSize: 14, fontWeight: "800" },
    deliveredBannerText: { fontSize: 15, fontWeight: "700", color: "#34C759" },

    // Accept bar
    acceptBar: {
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA",
    },
    acceptBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        height: 54, borderRadius: 16, backgroundColor: "#FF6B00", gap: 8,
        shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
    },
    acceptBtnDisabled: { backgroundColor: "#FFBA8A", shadowOpacity: 0, elevation: 0 },
    acceptIcon:        { fontSize: 20 },
    acceptBtnText:     { fontSize: 17, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.3 },

    // Success modal
    modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center", justifyContent: "center",
    },
    modalCard: {
        width: 280, backgroundColor: "#FFFFFF",
        borderRadius: 24, padding: 32, alignItems: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    },
    modalIcon:     { fontSize: 52, marginBottom: 16 },
    modalTitle:    { fontSize: 22, fontWeight: "800", color: "#1C1C1E", marginBottom: 8, letterSpacing: -0.5 },
    modalSubtitle: { fontSize: 14, color: "#8E8E93", textAlign: "center", marginBottom: 20, lineHeight: 20 },
});
