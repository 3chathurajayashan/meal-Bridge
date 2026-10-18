import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { volunteerApi } from "../../../services/api";
import type { Delivery } from "../../../types/volunteer";
import { extractList } from "../../../types/volunteer";
import DeliveryCard  from "../../../components/volunteer/DeliveryCard";
import LoadingState  from "../../../components/volunteer/LoadingState";
import EmptyState    from "../../../components/volunteer/EmptyState";
import SuccessMessage from "../../../toasts/SuccessMessage";
import ErrorMessage   from "../../../toasts/ErrorMessage";

const AvailableDeliveries: React.FC = () => {
    const router                = useRouter();
    const { accessToken }       = useAuth();

    const [deliveries, setDeliveries]   = useState<Delivery[]>([]);
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const [error, setError]             = useState<string | null>(null);
    const [claimingId, setClaimingId]   = useState<string | null>(null);

    const [successVisible, setSuccessVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorVisible, setErrorVisible]     = useState(false);
    const [errorMessage, setErrorMessage]     = useState("");

    // ── Fetch ────────────────────────────────────────────────

    const fetchDeliveries = useCallback(async () => {
        if (!accessToken) return;
        try {
            setError(null);
            const raw = await volunteerApi.getAvailableDeliveries(accessToken);
            setDeliveries(extractList<Delivery>(raw as any));
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to load deliveries."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchDeliveries();
    }, [fetchDeliveries]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDeliveries();
    };

    // ── Claim ────────────────────────────────────────────────

    const handleClaim = async (id: string) => {
        if (!accessToken || claimingId) return;
        setClaimingId(id);
        setErrorVisible(false);

        try {
            await volunteerApi.claimDelivery(id, accessToken);

            setSuccessMessage("Delivery claimed! Redirecting…");
            setSuccessVisible(true);

            // Navigate to delivery details after a short delay so the
            // success toast is briefly visible
            setTimeout(() => {
                router.push(`/volunteer/deliveries/${id}`);
            }, 1000);
        } catch (e) {
            const msg =
                e instanceof Error ? e.message : "Could not claim delivery.";
            setErrorMessage(msg);
            setErrorVisible(true);
        } finally {
            setClaimingId(null);
        }
    };

    // ── Render ───────────────────────────────────────────────

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerBar}>
                    <Text style={styles.pageTitle}>Available Deliveries</Text>
                </View>
                <LoadingState message="Finding deliveries near you…" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Toasts */}
            <SuccessMessage
                visible={successVisible}
                message={successMessage}
                onHide={() => setSuccessVisible(false)}
            />
            <ErrorMessage
                visible={errorVisible}
                message={errorMessage}
                onHide={() => setErrorVisible(false)}
            />

            {/* Header */}
            <View style={styles.headerBar}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.pageTitle}>Available Deliveries</Text>

                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={handleRefresh}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.refreshIcon}>↺</Text>
                </TouchableOpacity>
            </View>

            {/* Error banner */}
            {error ? (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchDeliveries}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* List */}
            <FlatList
                data={deliveries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <DeliveryCard
                        delivery={item}
                        onClaim={handleClaim}
                        isClaiming={claimingId === item.id}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#FF6B00"
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="🚚"
                        title="No deliveries available"
                        subtitle="Check back soon — new donations are listed regularly."
                        actionLabel="Refresh"
                        onAction={handleRefresh}
                    />
                }
                ListHeaderComponent={
                    deliveries.length > 0 ? (
                        <Text style={styles.countLabel}>
                            {deliveries.length} delivery
                            {deliveries.length !== 1 ? "s" : ""} near you
                        </Text>
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

export default AvailableDeliveries;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },

    // ── Header bar ───────────────────────────────────────────
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#F2F2F7",
    },
    backBtn: {
        marginRight: 8,
    },
    backIcon: {
        fontSize: 28,
        color: "#FF6B00",
        fontWeight: "300",
        lineHeight: 30,
    },
    pageTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: "700",
        color: "#1C1C1E",
        letterSpacing: -0.5,
    },
    refreshBtn: {
        marginLeft: 8,
    },
    refreshIcon: {
        fontSize: 22,
        color: "#FF6B00",
        fontWeight: "600",
    },

    // ── Error ────────────────────────────────────────────────
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF0EF",
        marginHorizontal: 16,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#FF3B3030",
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: "#FF3B30",
        fontWeight: "500",
    },
    retryText: {
        fontSize: 13,
        color: "#FF6B00",
        fontWeight: "600",
        marginLeft: 10,
    },

    // ── List ─────────────────────────────────────────────────
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
        flexGrow: 1,
    },
    countLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
});
