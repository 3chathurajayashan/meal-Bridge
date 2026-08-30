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
import { useAuth } from "../../context/AuthContext";
import { volunteerApi } from "../../services/api";
import type { ActivityItem, DeliveryStatus } from "../../types/volunteer";
import { extractList } from "../../types/volunteer";
import ActivityCard from "../../components/volunteer/ActivityCard";
import LoadingState from "../../components/volunteer/LoadingState";
import EmptyState   from "../../components/volunteer/EmptyState";

// ─────────────────────────────────────────────────────────────
// Filter types
// ─────────────────────────────────────────────────────────────

type FilterKey = "ALL" | "DELIVERED" | "CANCELLED";

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "ALL",       label: "All" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
];

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const PreviousActivity: React.FC = () => {
    const router          = useRouter();
    const { accessToken } = useAuth();

    const [items, setItems]             = useState<ActivityItem[]>([]);
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const [error, setError]             = useState<string | null>(null);
    const [filter, setFilter]           = useState<FilterKey>("ALL");

    // ── Fetch history ────────────────────────────────────────

    const fetchHistory = useCallback(async () => {
        if (!accessToken) return;
        try {
            setError(null);
            const raw = await volunteerApi.getDeliveryHistory(accessToken);
            setItems(extractList<ActivityItem>(raw as any));
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to load activity."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    // ── Filter ───────────────────────────────────────────────

    const filtered = items.filter((i) => {
        if (filter === "ALL") return true;
        return i.status === (filter as DeliveryStatus);
    });

    // ── Render ───────────────────────────────────────────────

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerBar}>
                    <Text style={styles.pageTitle}>Previous Activity</Text>
                </View>
                <LoadingState message="Loading your history…" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.headerBar}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.pageTitle}>Previous Activity</Text>
            </View>

            {/* Filter chips */}
            <View style={styles.filterRow}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[
                            styles.filterChip,
                            filter === f.key && styles.filterChipActive,
                        ]}
                        onPress={() => setFilter(f.key)}
                        activeOpacity={0.75}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                filter === f.key && styles.filterChipTextActive,
                            ]}
                        >
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Error banner */}
            {error ? (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchHistory}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ActivityCard
                        item={item}
                        onPress={(id) =>
                            router.push(`/volunteer/deliveries/${id}`)
                        }
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
                ListHeaderComponent={
                    filtered.length > 0 ? (
                        <Text style={styles.countLabel}>
                            {filtered.length} delivery
                            {filtered.length !== 1 ? "s" : ""}
                        </Text>
                    ) : null
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="📋"
                        title={
                            filter === "ALL"
                                ? "No activity yet"
                                : `No ${filter.toLowerCase()} deliveries`
                        }
                        subtitle={
                            filter === "ALL"
                                ? "Your completed deliveries will appear here."
                                : `You have no ${filter.toLowerCase()} deliveries to show.`
                        }
                    />
                }
            />
        </SafeAreaView>
    );
};

export default PreviousActivity;

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

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

    // ── Filter chips ──────────────────────────────────────────
    filterRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    filterChipActive: {
        backgroundColor: "#FF6B00",
        borderColor: "#FF6B00",
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#8E8E93",
    },
    filterChipTextActive: {
        color: "#FFFFFF",
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
