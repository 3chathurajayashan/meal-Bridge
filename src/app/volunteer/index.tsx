import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { volunteerApi } from "../../services/api";
import type { Delivery } from "../../types/volunteer";

// ─── Mini delivery card ──────────────────────────────────────
const DeliveryCard: React.FC<{
    delivery: Delivery;
    onPress: (id: string) => void;
}> = ({ delivery, onPress }) => {
    const { donation, pickupAddress, dropOffAddress } = delivery;
    const pickup  = pickupAddress.fullAddress  ?? pickupAddress.street  ?? "—";
    const dropoff = dropOffAddress.fullAddress ?? dropOffAddress.street ?? "—";

    return (
        <View style={cardS.card}>
            {/* Top row */}
            <View style={cardS.topRow}>
                {donation.imageUrl ? (
                    <Image source={{ uri: donation.imageUrl }} style={cardS.image} resizeMode="cover" />
                ) : (
                    <View style={cardS.imagePlaceholder}>
                        <Ionicons name="fast-food-outline" size={36} color="#8E8E93" />
                    </View>
                )}
                <View style={cardS.foodInfo}>
                    <Text style={cardS.foodName} numberOfLines={2}>{donation.foodName}</Text>
                    <Text style={cardS.qty}>{donation.quantity}</Text>
                    {donation.category ? (
                        <View style={cardS.categoryBadge}>
                            <Text style={cardS.categoryText}>{donation.category}</Text>
                        </View>
                    ) : null}
                </View>
            </View>

            <View style={cardS.divider} />

            {/* Route */}
            <View style={cardS.routeBlock}>
                <View style={cardS.routeRow}>
                    <View style={[cardS.dot, { backgroundColor: "#FF6B00" }]} />
                    <View style={cardS.routeText}>
                        <Text style={cardS.routeLabel}>Pickup</Text>
                        <Text style={cardS.routeAddr} numberOfLines={1}>{pickup}</Text>
                    </View>
                </View>
                <View style={cardS.routeConnector} />
                <View style={cardS.routeRow}>
                    <View style={[cardS.dot, { backgroundColor: "#34C759" }]} />
                    <View style={cardS.routeText}>
                        <Text style={cardS.routeLabel}>Drop-off</Text>
                        <Text style={cardS.routeAddr} numberOfLines={1}>{dropoff}</Text>
                    </View>
                </View>
            </View>

            <View style={cardS.divider} />

            {/* Meta chips */}
            <View style={cardS.metaRow}>
                {delivery.distanceKm != null && (
                    <View style={cardS.chip}>
                        <Ionicons name="location-outline" size={13} color="#3C3C43" style={cardS.chipIcon} />
                        <Text style={cardS.chipText}>
                            {delivery.distanceKm < 1
                                ? `${Math.round(delivery.distanceKm * 1000)} m`
                                : `${delivery.distanceKm.toFixed(1)} km`}
                        </Text>
                    </View>
                )}
                {(delivery.availableFrom || delivery.availableUntil) ? (
                    <View style={cardS.chip}>
                        <Ionicons name="time-outline" size={13} color="#3C3C43" style={cardS.chipIcon} />
                        <Text style={cardS.chipText}>
                            {delivery.availableFrom
                                ? new Date(delivery.availableFrom).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : ""}
                            {delivery.availableFrom && delivery.availableUntil ? " – " : ""}
                            {delivery.availableUntil
                                ? new Date(delivery.availableUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : ""}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* CTA */}
            <TouchableOpacity style={cardS.cta} onPress={() => onPress(delivery.id)} activeOpacity={0.8}>
                <Text style={cardS.ctaText}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

const cardS = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, marginBottom: 14,
        shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
    },
    topRow: { flexDirection: "row", marginBottom: 14 },
    image: { width: 80, height: 80, borderRadius: 12, marginRight: 14, backgroundColor: "#F2F2F7" },
    imagePlaceholder: {
        width: 80, height: 80, borderRadius: 12, backgroundColor: "#F2F2F7",
        marginRight: 14, alignItems: "center", justifyContent: "center",
    },
    foodInfo: { flex: 1, justifyContent: "center" },
    foodName: { fontSize: 17, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.4, marginBottom: 4 },
    qty: { fontSize: 14, color: "#8E8E93", fontWeight: "500", marginBottom: 6 },
    categoryBadge: {
        alignSelf: "flex-start", backgroundColor: "#FFF3E8", borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "#FFD5A8",
    },
    categoryText: { fontSize: 11, fontWeight: "600", color: "#FF6B00" },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E5EA", marginBottom: 14 },
    routeBlock: { marginBottom: 14, paddingHorizontal: 4 },
    routeRow: { flexDirection: "row", alignItems: "flex-start" },
    dot: { width: 10, height: 10, borderRadius: 5, marginTop: 3, marginRight: 10 },
    routeConnector: { width: 1.5, height: 12, marginLeft: 4, backgroundColor: "#C7C7CC", marginVertical: 3 },
    routeText: { flex: 1 },
    routeLabel: { fontSize: 11, fontWeight: "600", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 1 },
    routeAddr: { fontSize: 14, fontWeight: "500", color: "#1C1C1E" },
    metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    chip: { flexDirection: "row", alignItems: "center", backgroundColor: "#F2F2F7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    chipIcon: { marginRight: 4 },
    chipText: { fontSize: 12, fontWeight: "500", color: "#3C3C43" },
    cta: {
        height: 48, borderRadius: 14, backgroundColor: "#FF6B00",
        alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6,
        shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
    },
    ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});

// ─── Main dashboard ──────────────────────────────────────────
export default function VolunteerDashboard() {
    const router              = useRouter();
    const { user, accessToken } = useAuth();

    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError]           = useState<string | null>(null);

    const fetchDeliveries = useCallback(async () => {
        if (!accessToken) return;
        try {
            setError(null);
            const list = await volunteerApi.getAvailableDeliveries(accessToken);
            setDeliveries(list);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load deliveries.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [accessToken]);

    useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

    const initial = user?.fullName?.charAt(0)?.toUpperCase() ?? "V";

    return (
        <SafeAreaView style={s.safeArea}>
            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={s.welcome}>Welcome back</Text>
                    <Text style={s.title}>Dashboard</Text>
                </View>
                <View style={s.headerRight}>
                    <TouchableOpacity
                        style={s.refreshBtn}
                        onPress={() => { setRefreshing(true); fetchDeliveries(); }}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Ionicons name="refresh-outline" size={20} color="#FF6B00" />
                    </TouchableOpacity>
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>{initial}</Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color="#FF6B00" />
                    <Text style={s.loadingText}>Finding deliveries…</Text>
                </View>
            ) : (
                <FlatList
                    data={deliveries}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <DeliveryCard delivery={item} onPress={(id) => router.push(`/volunteer/deliveries/${id}`)} />
                    )}
                    contentContainerStyle={s.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchDeliveries(); }}
                            tintColor="#FF6B00"
                        />
                    }
                    ListHeaderComponent={
                        <>
                            {error ? (
                                <View style={s.errorBanner}>
                                    <Text style={s.errorText}>{error}</Text>
                                    <TouchableOpacity onPress={fetchDeliveries}>
                                        <Text style={s.retryText}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                            {deliveries.length > 0 ? (
                                <Text style={s.countLabel}>
                                    {deliveries.length} deliver{deliveries.length !== 1 ? "ies" : "y"} available
                                </Text>
                            ) : null}
                        </>
                    }
                    ListEmptyComponent={
                        !error ? (
                            <View style={s.emptyContainer}>
                                <Ionicons name="mail-open-outline" size={56} color="#C7C7CC" style={s.emptyIconView} />
                                <Text style={s.emptyTitle}>No deliveries available</Text>
                                <Text style={s.emptySubtitle}>Check back soon — new donations are listed regularly.</Text>
                                <TouchableOpacity
                                    style={s.emptyBtn}
                                    onPress={() => { setRefreshing(true); fetchDeliveries(); }}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="refresh" size={16} color="#FFFFFF" />
                                    <Text style={s.emptyBtnText}>Refresh</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F2F2F7" },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: "#F2F2F7",
    },
    welcome: { fontSize: 12, fontWeight: "600", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 },
    title: { fontSize: 32, fontWeight: "700", color: "#FF6B00", letterSpacing: -0.8 },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
    refreshBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFFFFF",
        borderWidth: 1, borderColor: "#E5E5EA", alignItems: "center", justifyContent: "center",
    },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FF6B00", alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { color: "#8E8E93", fontSize: 14, marginTop: 12 },
    listContent: { paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 },
    countLabel: { fontSize: 13, fontWeight: "600", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 12, paddingHorizontal: 4 },
    errorBanner: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#FFF0EF", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
        marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,59,48,0.2)",
    },
    errorText: { flex: 1, fontSize: 13, color: "#FF3B30", fontWeight: "500" },
    retryText: { fontSize: 13, color: "#FF6B00", fontWeight: "600", marginLeft: 10 },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80, paddingHorizontal: 32 },
    emptyIconView: { marginBottom: 16 },
    emptyTitle: { fontSize: 19, fontWeight: "700", color: "#1C1C1E", marginBottom: 8, letterSpacing: -0.4 },
    emptySubtitle: { fontSize: 15, color: "#8E8E93", textAlign: "center", lineHeight: 22, marginBottom: 24 },
    emptyBtn: {
        height: 48, paddingHorizontal: 28, borderRadius: 14, backgroundColor: "#FF6B00",
        alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6,
        shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
    },
    emptyBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
