import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { volunteerApi } from "../../services/api";
import type { VolunteerSummary, Delivery } from "../../types/volunteer";
import LoadingState from "../../components/volunteer/LoadingState";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatRating(r?: number): string {
    if (r == null) return "—";
    return r.toFixed(1);
}

function shortAddress(d: Delivery): string {
    return (
        d.dropOffAddress.fullAddress ??
        [d.dropOffAddress.street, d.dropOffAddress.city]
            .filter(Boolean)
            .join(", ") ??
        "—"
    );
}

function statusColor(status: string): string {
    switch (status) {
        case "ACCEPTED":   return "#007AFF";
        case "PICKED_UP":  return "#5856D6";
        case "IN_TRANSIT": return "#FF9500";
        default:           return "#34C759";
    }
}

function statusLabel(status: string): string {
    switch (status) {
        case "ACCEPTED":   return "Accepted";
        case "PICKED_UP":  return "Picked Up";
        case "IN_TRANSIT": return "In Transit";
        default:           return status;
    }
}

// ─────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────

const StatCard: React.FC<{
    value: string | number;
    label: string;
    accent?: boolean;
}> = ({ value, label, accent = false }) => (
    <View style={styles.statCard}>
        <Text style={[styles.statValue, accent && styles.statValueAccent]}>
            {value}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

const VolunteerDashboard: React.FC = () => {
    const router          = useRouter();
    const { user, logout, accessToken } = useAuth();

    const [summary, setSummary]       = useState<VolunteerSummary | null>(null);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError]           = useState<string | null>(null);

    // ── Fetch summary ──────────────────────────────────────────

    const fetchSummary = useCallback(async () => {
        if (!accessToken) return;
        try {
            setError(null);
            const data = await volunteerApi.getSummary(accessToken) as VolunteerSummary;
            setSummary(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load summary.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchSummary();
    };

    // ── Logout ────────────────────────────────────────────────

    const handleLogout = async () => {
        await logout();
        router.replace("/auth/signIn");
    };

    // ── Profile initial ───────────────────────────────────────

    const initial = user?.fullName?.charAt(0)?.toUpperCase() ?? "V";

    // ─────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <LoadingState message="Loading dashboard…" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#FF6B00"
                    />
                }
            >
                {/* ── Header ──────────────────────────────────── */}
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.welcome}>Welcome back</Text>
                        <Text style={styles.title}>Dashboard</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.profileContainer}
                        activeOpacity={0.85}
                    >
                        {user?.profileImage?.url ? (
                            <Image
                                source={{ uri: user.profileImage.url }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.profilePlaceholder}>
                                <Text style={styles.profileInitial}>{initial}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* ── Error banner ─────────────────────────────── */}
                {error ? (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={fetchSummary}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* ── Stats grid ───────────────────────────────── */}
                <Text style={styles.sectionHeader}>Overview</Text>

                <View style={styles.statsGrid}>
                    <StatCard
                        value={summary?.availableDeliveries ?? 0}
                        label="Available"
                        accent
                    />
                    <StatCard
                        value={summary?.completedDeliveries ?? 0}
                        label="Completed"
                    />
                    <StatCard
                        value={summary?.totalDeliveries ?? 0}
                        label="Total"
                    />
                    <StatCard
                        value={
                            summary?.averageRating != null
                                ? `★ ${formatRating(summary.averageRating)}`
                                : "—"
                        }
                        label="Avg. Rating"
                    />
                </View>

                {/* ── Active delivery ──────────────────────────── */}
                {summary?.activeDelivery ? (
                    <>
                        <Text style={styles.sectionHeader}>Active Delivery</Text>
                        <TouchableOpacity
                            style={styles.activeCard}
                            onPress={() =>
                                router.push(
                                    `/volunteer/deliveries/${summary.activeDelivery!.id}`
                                )
                            }
                            activeOpacity={0.8}
                        >
                            {/* Food image */}
                            {summary.activeDelivery.donation.imageUrl ? (
                                <Image
                                    source={{ uri: summary.activeDelivery.donation.imageUrl }}
                                    style={styles.activeImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.activeImage, styles.activeImagePlaceholder]}>
                                    <Text style={styles.activeImagePlaceholderText}>🍱</Text>
                                </View>
                            )}

                            <View style={styles.activeInfo}>
                                <View style={styles.activeTopRow}>
                                    <Text style={styles.activeFoodName} numberOfLines={1}>
                                        {summary.activeDelivery.donation.foodName}
                                    </Text>
                                    <View
                                        style={[
                                            styles.activeBadge,
                                            {
                                                backgroundColor:
                                                    statusColor(summary.activeDelivery.status) + "20",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.activeBadgeText,
                                                { color: statusColor(summary.activeDelivery.status) },
                                            ]}
                                        >
                                            {statusLabel(summary.activeDelivery.status)}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.activeAddress} numberOfLines={1}>
                                    → {shortAddress(summary.activeDelivery)}
                                </Text>

                                <Text style={styles.activeCta}>Tap to view details →</Text>
                            </View>
                        </TouchableOpacity>
                    </>
                ) : null}

                {/* ── Quick nav ────────────────────────────────── */}
                <Text style={styles.sectionHeader}>Actions</Text>

                <View style={styles.navRow}>
                    <TouchableOpacity
                        style={[styles.navCard, styles.navCardPrimary]}
                        onPress={() => router.push("/volunteer/deliveries")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.navIcon}>🚚</Text>
                        <Text style={styles.navLabel}>Available{"\n"}Deliveries</Text>
                        {summary?.availableDeliveries ? (
                            <View style={styles.navBadge}>
                                <Text style={styles.navBadgeText}>
                                    {summary.availableDeliveries}
                                </Text>
                            </View>
                        ) : null}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navCard}
                        onPress={() => router.push("/volunteer/activity")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.navIcon}>📋</Text>
                        <Text style={styles.navLabel}>Previous{"\n"}Activity</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Account info ──────────────────────────────── */}
                <Text style={styles.sectionHeader}>Account</Text>

                <View style={styles.accountCard}>
                    {[
                        { label: "Name",   value: user?.fullName    ?? "—" },
                        { label: "Email",  value: user?.email       ?? "—" },
                        { label: "Phone",  value: user?.phoneNumber ?? "—" },
                        { label: "Role",   value: user?.role        ?? "—" },
                        {
                            label: "Status",
                            value: user?.isActive ? "Active" : "Inactive",
                            isStatus: true,
                            active: user?.isActive,
                        },
                    ].map((row, i, arr) => (
                        <View
                            key={row.label}
                            style={[
                                styles.accountRow,
                                i < arr.length - 1 && styles.accountRowBorder,
                            ]}
                        >
                            <Text style={styles.accountLabel}>{row.label}</Text>
                            <Text
                                style={[
                                    styles.accountValue,
                                    (row as any).isStatus &&
                                        ((row as any).active
                                            ? styles.activeStatus
                                            : styles.inactiveStatus),
                                ]}
                                numberOfLines={1}
                            >
                                {row.value}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ── Logout ───────────────────────────────────── */}
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.75}
                >
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default VolunteerDashboard;

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 40,
    },

    // ── Header ──────────────────────────────────────────────
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    headerText: {
        flex: 1,
        paddingRight: 12,
    },
    welcome: {
        fontSize: 12,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 2,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#FF6B00",
        letterSpacing: -0.8,
    },
    profileContainer: {
        width: 48,
        height: 48,
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E5E5EA",
    },
    profilePlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#FF6B00",
        alignItems: "center",
        justifyContent: "center",
    },
    profileInitial: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
    },

    // ── Error banner ─────────────────────────────────────────
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF0EF",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
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

    // ── Section header ───────────────────────────────────────
    sectionHeader: {
        fontSize: 13,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
        paddingHorizontal: 4,
    },

    // ── Stats grid ───────────────────────────────────────────
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statCard: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    statValue: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1C1C1E",
        letterSpacing: -0.5,
    },
    statValueAccent: {
        color: "#FF6B00",
    },
    statLabel: {
        fontSize: 13,
        fontWeight: "500",
        color: "#8E8E93",
        marginTop: 2,
    },

    // ── Active delivery card ──────────────────────────────────
    activeCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: "#FF6B00",
        shadowColor: "#FF6B00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    activeImage: {
        width: 64,
        height: 64,
        borderRadius: 10,
        backgroundColor: "#F2F2F7",
        marginRight: 12,
    },
    activeImagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },
    activeImagePlaceholderText: {
        fontSize: 26,
    },
    activeInfo: {
        flex: 1,
        justifyContent: "center",
    },
    activeTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    activeFoodName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: "#1C1C1E",
        letterSpacing: -0.3,
        marginRight: 8,
    },
    activeBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    activeBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    activeAddress: {
        fontSize: 13,
        color: "#8E8E93",
        marginBottom: 6,
    },
    activeCta: {
        fontSize: 12,
        color: "#FF6B00",
        fontWeight: "600",
    },

    // ── Nav cards ────────────────────────────────────────────
    navRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    navCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 18,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        position: "relative",
    },
    navCardPrimary: {
        backgroundColor: "#FF6B00",
        shadowColor: "#FF6B00",
        shadowOpacity: 0.25,
    },
    navIcon: {
        fontSize: 26,
        marginBottom: 10,
    },
    navLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1C1C1E",
        lineHeight: 19,
        letterSpacing: -0.2,
    },
    navBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
    },
    navBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FF6B00",
    },

    // ── Account card ──────────────────────────────────────────
    accountCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    accountRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 13,
    },
    accountRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#C6C6C8",
    },
    accountLabel: {
        fontSize: 15,
        color: "#1C1C1E",
        fontWeight: "400",
    },
    accountValue: {
        fontSize: 15,
        color: "#8E8E93",
        fontWeight: "400",
        maxWidth: "55%",
        textAlign: "right",
    },
    activeStatus: {
        color: "#34C759",
        fontWeight: "500",
    },
    inactiveStatus: {
        color: "#FF3B30",
        fontWeight: "500",
    },

    // ── Logout ────────────────────────────────────────────────
    logoutBtn: {
        height: 50,
        borderRadius: 12,
        backgroundColor: "#FF3B30",
        alignItems: "center",
        justifyContent: "center",
    },
    logoutText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
