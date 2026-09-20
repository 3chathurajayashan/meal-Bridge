import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    RefreshControl,
    TouchableOpacity,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { volunteerApi } from "../../services/api";
import type { ActivityItem, DeliveryStatus } from "../../types/volunteer";
import LoadingState from "../../components/volunteer/LoadingState";

const C = {
    bg:      "#F2F2F7",
    surface: "#FFFFFF",
    card:    "#FFFFFF",
    border:  "#E5E5EA",
    accent:  "#FF6B00",
    green:   "#34C759",
    red:     "#FF3B30",
    text:    "#1C1C1E",
    muted:   "#8E8E93",
    dim:     "#C7C7CC",
};

type FilterKey = "ALL" | "DELIVERED" | "CANCELLED";

type FilterDef = {
    key: FilterKey;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
};

const FILTERS: FilterDef[] = [
    { key: "ALL",       label: "All",       iconName: "list-outline",      iconColor: C.muted  },
    { key: "DELIVERED", label: "Delivered", iconName: "checkmark-circle-outline", iconColor: C.green  },
    { key: "CANCELLED", label: "Cancelled", iconName: "close-circle-outline",     iconColor: C.red    },
];

function formatDate(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
        day: "numeric", month: "short", year: "numeric",
    });
}

function shortAddr(addr: { fullAddress?: string; street?: string; city?: string }): string {
    return addr.fullAddress ?? [addr.street, addr.city].filter(Boolean).join(", ") ?? "—";
}

// ─── Activity card ───────────────────────────────────────────
const ActivityCard: React.FC<{
    item: ActivityItem;
    onPress: (id: string) => void;
}> = ({ item, onPress }) => {
    const isDelivered = item.status === "DELIVERED";
    const statusColor = isDelivered ? C.green : C.red;
    const statusBg    = isDelivered ? "rgba(52,199,89,0.12)" : "rgba(255,59,48,0.10)";
    const statusLabel = isDelivered ? "DELIVERED" : "CANCELLED";

    return (
        <TouchableOpacity style={cardS.card} onPress={() => onPress(item.id)} activeOpacity={0.8}>
            <View style={[cardS.accentBar, { backgroundColor: statusColor }]} />

            <View style={cardS.body}>
                {/* Top row */}
                <View style={cardS.topRow}>
                    {item.donation.imageUrl ? (
                        <Image source={{ uri: item.donation.imageUrl }} style={cardS.image} resizeMode="cover" />
                    ) : (
                        <View style={cardS.imagePlaceholder}>
                            <Ionicons name="fast-food-outline" size={28} color={C.muted} />
                        </View>
                    )}

                    <View style={cardS.info}>
                        <View style={cardS.titleRow}>
                            <Text style={cardS.foodName} numberOfLines={1}>{item.donation.foodName}</Text>
                            <View style={[cardS.statusBadge, { backgroundColor: statusBg }]}>
                                <Text style={[cardS.statusText, { color: statusColor }]}>{statusLabel}</Text>
                            </View>
                        </View>

                        <Text style={cardS.qty}>{item.donation.quantity}</Text>

                        <View style={cardS.routeBlock}>
                            <View style={cardS.routeRow}>
                                <View style={[cardS.dot, { backgroundColor: C.accent }]} />
                                <Text style={cardS.routeText} numberOfLines={1}>{shortAddr(item.pickupAddress)}</Text>
                            </View>
                            <View style={cardS.routeConnector} />
                            <View style={cardS.routeRow}>
                                <View style={[cardS.dot, { backgroundColor: C.green }]} />
                                <Text style={cardS.routeText} numberOfLines={1}>{shortAddr(item.dropOffAddress)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={cardS.footer}>
                    <Ionicons name="calendar-outline" size={12} color={C.muted} style={cardS.footerIcon} />
                    <Text style={cardS.footerText}>{formatDate(item.deliveredAt ?? item.createdAt)}</Text>

                    {item.distanceKm != null && (
                        <>
                            <Ionicons name="location-outline" size={12} color={C.muted} style={[cardS.footerIcon, { marginLeft: 10 }]} />
                            <Text style={cardS.footerText}>{item.distanceKm.toFixed(1)} km</Text>
                        </>
                    )}

                    {item.rating != null && (
                        <View style={cardS.ratingChip}>
                            <Ionicons name="star" size={11} color="#FF9500" />
                            <Text style={cardS.ratingText}>{item.rating.toFixed(1)}</Text>
                        </View>
                    )}

                    <View style={cardS.viewDetail}>
                        <Text style={cardS.viewDetailText}>View</Text>
                        <Ionicons name="chevron-forward" size={13} color={C.accent} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const cardS = StyleSheet.create({
    card: { flexDirection: "row", backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 12, overflow: "hidden" },
    accentBar: { width: 3, borderRadius: 2 },
    body: { flex: 1, padding: 14 },
    topRow: { flexDirection: "row", marginBottom: 12 },
    image: { width: 68, height: 68, borderRadius: 10, backgroundColor: C.dim, marginRight: 12 },
    imagePlaceholder: { width: 68, height: 68, borderRadius: 10, backgroundColor: "#F2F2F7", marginRight: 12, alignItems: "center", justifyContent: "center" },
    info: { flex: 1 },
    titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
    foodName: { flex: 1, fontSize: 14, fontWeight: "700", color: C.text, letterSpacing: -0.2, marginRight: 8 },
    statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
    statusText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
    qty: { fontSize: 12, color: C.muted, marginBottom: 8 },
    routeBlock: {},
    routeRow: { flexDirection: "row", alignItems: "center" },
    dot: { width: 7, height: 7, borderRadius: 4, marginRight: 7 },
    routeConnector: { width: 1, height: 8, backgroundColor: C.dim, marginLeft: 3, marginVertical: 1 },
    routeText: { flex: 1, fontSize: 11, color: C.muted },
    footer: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border, paddingTop: 10 },
    footerIcon: { marginRight: 3 },
    footerText: { fontSize: 11, color: C.muted, fontWeight: "500" },
    ratingChip: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(255,149,0,0.12)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 10 },
    ratingText: { fontSize: 11, color: "#FF9500", fontWeight: "700" },
    viewDetail: { flexDirection: "row", alignItems: "center", marginLeft: "auto" as any },
    viewDetailText: { fontSize: 12, color: C.accent, fontWeight: "700" },
});

// ─── Main screen ─────────────────────────────────────────────
export default function PreviousActivity() {
    const router          = useRouter();
    const { accessToken } = useAuth();

    const [items, setItems]           = useState<ActivityItem[]>([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError]           = useState<string | null>(null);
    const [filter, setFilter]         = useState<FilterKey>("ALL");

    const fetchHistory = useCallback(async () => {
        if (!accessToken) return;
        try {
            setError(null);
            const data = await volunteerApi.getDeliveryHistory(accessToken);
            setItems(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load activity.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [accessToken]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const filtered = items.filter((i) => {
        if (filter === "ALL") return true;
        return i.status === (filter as DeliveryStatus);
    });

    if (loading) {
        return (
            <SafeAreaView style={s.safeArea}>
                <View style={s.header}>
                    <Text style={s.headerTitle}>Activity</Text>
                </View>
                <LoadingState message="Loading your history…" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.safeArea}>
            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={s.headerLabel}>HISTORY</Text>
                    <Text style={s.headerTitle}>Activity</Text>
                </View>
                <View style={s.headerBadge}>
                    <Text style={s.headerBadgeText}>{items.length}</Text>
                </View>
            </View>

            {/* Filter chips */}
            <View style={s.filterRow}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[s.filterChip, filter === f.key && s.filterChipActive]}
                        onPress={() => setFilter(f.key)}
                        activeOpacity={0.75}
                    >
                        <Ionicons
                            name={f.iconName}
                            size={14}
                            color={filter === f.key ? C.accent : C.muted}
                        />
                        <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Error */}
            {error ? (
                <View style={s.errorBanner}>
                    <Text style={s.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchHistory}>
                        <Text style={s.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ActivityCard item={item} onPress={(id) => router.push(`/volunteer/deliveries/${id}`)} />
                )}
                contentContainerStyle={s.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchHistory(); }}
                        tintColor={C.accent}
                    />
                }
                ListHeaderComponent={
                    filtered.length > 0 ? (
                        <Text style={s.countLabel}>
                            {filtered.length} {filter === "ALL" ? "total" : filter.toLowerCase()} deliveries
                        </Text>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={s.emptyContainer}>
                        <Ionicons
                            name={filter === "DELIVERED" ? "checkmark-circle-outline" : filter === "CANCELLED" ? "close-circle-outline" : "document-text-outline"}
                            size={56}
                            color={C.dim}
                            style={s.emptyIconView}
                        />
                        <Text style={s.emptyTitle}>
                            {filter === "ALL" ? "No activity yet" : `No ${filter.toLowerCase()} deliveries`}
                        </Text>
                        <Text style={s.emptySubtitle}>
                            {filter === "ALL"
                                ? "Your completed deliveries will show up here."
                                : `You have no ${filter.toLowerCase()} deliveries to show.`}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
    headerLabel: { fontSize: 10, fontWeight: "700", color: C.accent, letterSpacing: 1.5, marginBottom: 2 },
    headerTitle: { fontSize: 26, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
    headerBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,107,0,0.12)", borderWidth: 1, borderColor: "rgba(255,107,0,0.3)", alignItems: "center", justifyContent: "center" },
    headerBadgeText: { fontSize: 14, fontWeight: "700", color: C.accent },
    filterRow: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
    filterChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 5, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    filterChipActive: { backgroundColor: "rgba(255,107,0,0.10)", borderColor: "rgba(255,107,0,0.35)" },
    filterText: { fontSize: 13, fontWeight: "600", color: C.muted },
    filterTextActive: { color: C.accent },
    errorBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 8, backgroundColor: "#FFF0EF", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255,59,48,0.2)" },
    errorText:  { flex: 1, fontSize: 12, color: C.red, fontWeight: "500" },
    retryText:  { fontSize: 12, color: C.accent, fontWeight: "700", marginLeft: 8 },
    listContent: { paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 },
    countLabel: { fontSize: 12, fontWeight: "600", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14, paddingHorizontal: 2 },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 },
    emptyIconView: { marginBottom: 16 },
    emptyTitle:    { fontSize: 19, fontWeight: "700", color: C.text, marginBottom: 8, letterSpacing: -0.4 },
    emptySubtitle: { fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 20 },
});
