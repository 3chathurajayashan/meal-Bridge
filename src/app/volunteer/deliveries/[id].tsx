import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { volunteerApi } from "../../../services/api";
import type { Delivery } from "../../../types/volunteer";
import DeliveryDetails from "../../../components/volunteer/DeliveryDetails";
import LoadingState    from "../../../components/volunteer/LoadingState";
import EmptyState      from "../../../components/volunteer/EmptyState";
import SuccessMessage  from "../../../toasts/SuccessMessage";
import ErrorMessage    from "../../../toasts/ErrorMessage";

type ActionType = "pickup" | "transit" | "delivered";

const DeliveryDetailsPage: React.FC = () => {
    const router                = useRouter();
    const { id }                = useLocalSearchParams<{ id: string }>();
    const { accessToken }       = useAuth();

    const [delivery, setDelivery]       = useState<Delivery | null>(null);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [successVisible, setSuccessVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorVisible, setErrorVisible]     = useState(false);
    const [errorMessage, setErrorMessage]     = useState("");

    // ── Fetch delivery ───────────────────────────────────────

    const fetchDelivery = useCallback(async () => {
        if (!accessToken || !id) return;
        try {
            setError(null);
            const data = await volunteerApi.getDelivery(id, accessToken) as Delivery;
            setDelivery(data);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to load delivery details."
            );
        } finally {
            setLoading(false);
        }
    }, [accessToken, id]);

    useEffect(() => {
        fetchDelivery();
    }, [fetchDelivery]);

    // ── Actions ──────────────────────────────────────────────

    const handleAction = async (action: ActionType) => {
        if (!accessToken || !id || actionLoading) return;

        setActionLoading(true);
        setErrorVisible(false);

        try {
            let updated: Delivery;

            switch (action) {
                case "pickup":
                    updated = await volunteerApi.confirmPickup(id, accessToken) as Delivery;
                    setSuccessMessage("Pickup confirmed!");
                    break;
                case "transit":
                    updated = await volunteerApi.startTransit(id, accessToken) as Delivery;
                    setSuccessMessage("Delivery started!");
                    break;
                case "delivered":
                    updated = await volunteerApi.confirmDelivered(id, accessToken) as Delivery;
                    setSuccessMessage("Delivery completed! Great work.");
                    break;
            }

            // Update local state with the new status returned by the API
            setDelivery(updated!);
            setSuccessVisible(true);
        } catch (e) {
            const msg =
                e instanceof Error ? e.message : "Action failed. Please try again.";
            setErrorMessage(msg);
            setErrorVisible(true);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Render ───────────────────────────────────────────────

    const headerTitle = delivery
        ? delivery.donation.foodName
        : "Delivery Details";

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

            {/* Header bar */}
            <View style={styles.headerBar}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.pageTitle} numberOfLines={1}>
                    {headerTitle}
                </Text>

                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={fetchDelivery}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.refreshIcon}>↺</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
                <LoadingState message="Loading delivery details…" />
            ) : error ? (
                <EmptyState
                    icon="⚠️"
                    title="Something went wrong"
                    subtitle={error}
                    actionLabel="Try Again"
                    onAction={fetchDelivery}
                />
            ) : delivery ? (
                <DeliveryDetails
                    delivery={delivery}
                    onAction={handleAction}
                    isActionLoading={actionLoading}
                />
            ) : (
                <EmptyState
                    icon="📦"
                    title="Delivery not found"
                    subtitle="This delivery may have been removed or already claimed."
                    actionLabel="Go Back"
                    onAction={() => router.back()}
                />
            )}
        </SafeAreaView>
    );
};

export default DeliveryDetailsPage;

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
        fontSize: 18,
        fontWeight: "700",
        color: "#1C1C1E",
        letterSpacing: -0.4,
    },
    refreshBtn: {
        marginLeft: 8,
    },
    refreshIcon: {
        fontSize: 22,
        color: "#FF6B00",
        fontWeight: "600",
    },
});
