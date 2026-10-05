import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { volunteerApi } from "../../services/api";
import { apiRequest } from "../../services/api";

const C = {
    bg:       "#F2F2F7",
    surface:  "#F2F2F7",
    card:     "#FFFFFF",
    border:   "#E5E5EA",
    accent:   "#FF6B00",
    green:    "#34C759",
    red:      "#FF3B30",
    blue:     "#3B82F6",
    text:     "#1C1C1E",
    muted:    "#8E8E93",
    dim:      "#C7C7CC",
};

type TransportOption = {
    key: string;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
};

const TRANSPORT_OPTIONS: TransportOption[] = [
    { key: "foot",    label: "Foot",    iconName: "walk-outline"      },
    { key: "bike",    label: "Bike",    iconName: "bicycle-outline"   },
    { key: "scooter", label: "Scooter", iconName: "speedometer-outline" },
    { key: "car",     label: "Car",     iconName: "car-outline"       },
    { key: "van",     label: "Van",     iconName: "bus-outline"       },
];

// ─── Metric card ─────────────────────────────────────────────
const MetricCard: React.FC<{
    value: string | number;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    color?: string;
}> = ({ value, label, iconName, color = C.accent }) => (
    <View style={[metricS.card, { borderColor: `${color}30` }]}>
        <View style={[metricS.iconWrap, { backgroundColor: `${color}18` }]}>
            <Ionicons name={iconName} size={20} color={color} />
        </View>
        <Text style={[metricS.value, { color }]}>{value}</Text>
        <Text style={metricS.label}>{label}</Text>
    </View>
);

const metricS = StyleSheet.create({
    card: { width: "47%", backgroundColor: C.card, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, alignItems: "flex-start" },
    iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    value: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginBottom: 4 },
    label: { fontSize: 12, color: C.muted, fontWeight: "500" },
});

// ─── Rating bar ──────────────────────────────────────────────
const RatingBar: React.FC<{ rating?: number }> = ({ rating }) => {
    if (rating == null) return null;
    const pct = (rating / 5) * 100;
    return (
        <View style={ratingS.container}>
            <View style={ratingS.track}>
                <View style={[ratingS.fill, { width: `${pct}%` as any }]} />
            </View>
            <Text style={ratingS.label}>{rating.toFixed(1)} / 5.0</Text>
        </View>
    );
};

const ratingS = StyleSheet.create({
    container: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
    track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: C.dim, overflow: "hidden" },
    fill: { height: "100%", borderRadius: 3, backgroundColor: "#FF9500" },
    label: { fontSize: 13, fontWeight: "700", color: "#FF9500" },
});

// ─── Main screen ─────────────────────────────────────────────
export default function VolunteerProfile() {
    const router              = useRouter();
    const { user, accessToken, logout } = useAuth();

    const [summary, setSummary] = useState<{
        completedDeliveries: number;
        totalDeliveries: number;
        averageRating?: number;
    } | null>(null);
    const [cancelledCount, setCancelledCount] = useState(0);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [editMode, setEditMode]   = useState(false);
    const [phone, setPhone]         = useState(user?.phoneNumber ?? "");
    const [transport, setTransport] = useState("car");
    const [available, setAvailable] = useState(true);
    const [saving, setSaving]       = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!accessToken) return;
        try {
            const s = await volunteerApi.getSummary(accessToken);
            setSummary({
                completedDeliveries: s.completedDeliveries,
                totalDeliveries:     s.totalDeliveries,
                averageRating:       s.averageRating,
            });
            const history = await volunteerApi.getDeliveryHistory(accessToken);
            setCancelledCount(history.filter((d) => d.status === "CANCELLED").length);
        } catch (_) {
            // Silently fail — profile still renders with user data
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [accessToken]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async () => {
        if (!accessToken) return;
        setSaving(true);
        setSaveError(null);
        try {
            await apiRequest(
                "/api/volunteers/profile",
                { method: "PUT", body: JSON.stringify({ phoneNumber: phone }) },
                accessToken
            );
            setEditMode(false);
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/auth/signIn");
    };

    const initial = user?.fullName?.charAt(0)?.toUpperCase() ?? "V";

    return (
        <SafeAreaView style={s.safeArea}>
            <ScrollView
                contentContainerStyle={s.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchData(); }}
                        tintColor={C.accent}
                    />
                }
            >
                {/* Profile card */}
                <View style={s.profileCard}>
                    <View style={s.avatarGlow} />
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>{initial}</Text>
                    </View>

                    <View style={s.profileInfo}>
                        <View style={s.nameRow}>
                            <Text style={s.name}>{user?.fullName ?? "Volunteer"}</Text>
                            <View style={s.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={12} color={C.green} style={{ marginRight: 3 }} />
                                <Text style={s.verifiedText}>Verified</Text>
                            </View>
                        </View>
                        <Text style={s.email}>{user?.email ?? ""}</Text>
                        <View style={[s.availChip, { backgroundColor: available ? "rgba(52,199,89,0.12)" : "rgba(142,142,147,0.12)" }]}>
                            <View style={[s.availDot, { backgroundColor: available ? C.green : C.muted }]} />
                            <Text style={[s.availText, { color: available ? C.green : C.muted }]}>
                                {available ? "Available" : "Unavailable"}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={s.editBtn} onPress={() => setEditMode(!editMode)} activeOpacity={0.8}>
                        <Ionicons name={editMode ? "close-outline" : "pencil-outline"} size={14} color={C.accent} style={{ marginRight: 4 }} />
                        <Text style={s.editBtnText}>{editMode ? "Cancel" : "Edit"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Metrics */}
                <Text style={s.sectionLabel}>Performance</Text>
                {loading ? (
                    <View style={s.metricsLoading}>
                        <ActivityIndicator color={C.accent} />
                    </View>
                ) : (
                    <View style={s.metricsGrid}>
                        <MetricCard value={summary?.completedDeliveries ?? 0} label="Completed"       iconName="checkmark-circle-outline" color={C.green}   />
                        <MetricCard value={cancelledCount}                    label="Cancelled"        iconName="close-circle-outline"     color={C.red}     />
                        <MetricCard value={summary?.totalDeliveries ?? 0}     label="Total Deliveries" iconName="car-outline"               color={C.blue}    />
                        <MetricCard
                            value={summary?.averageRating != null ? summary.averageRating.toFixed(1) : "—"}
                            label="Avg. Rating"
                            iconName="star-outline"
                            color="#FF9500"
                        />
                    </View>
                )}

                {/* Rating bar */}
                {summary?.averageRating != null && (
                    <View style={s.ratingCard}>
                        <Text style={s.ratingCardLabel}>OVERALL RATING</Text>
                        <View style={s.ratingStarsRow}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Ionicons
                                    key={i}
                                    name={i < Math.round(summary.averageRating!) ? "star" : "star-outline"}
                                    size={24}
                                    color="#FF9500"
                                />
                            ))}
                        </View>
                        <RatingBar rating={summary.averageRating} />
                    </View>
                )}

                {/* Edit mode */}
                {editMode && (
                    <View style={s.editCard}>
                        <Text style={s.sectionLabel}>Edit Profile</Text>

                        {saveError ? (
                            <View style={s.errorBanner}>
                                <Text style={s.errorText}>{saveError}</Text>
                            </View>
                        ) : null}

                        <Text style={s.fieldLabel}>Phone Number</Text>
                        <TextInput
                            style={s.textInput}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor={C.muted}
                            placeholder="Your phone number"
                        />

                        <Text style={s.fieldLabel}>Transportation Mode</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.transportRow}>
                            {TRANSPORT_OPTIONS.map((t) => (
                                <TouchableOpacity
                                    key={t.key}
                                    style={[s.transportChip, transport === t.key && s.transportChipActive]}
                                    onPress={() => setTransport(t.key)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={t.iconName}
                                        size={16}
                                        color={transport === t.key ? C.accent : C.muted}
                                    />
                                    <Text style={[s.transportChipText, transport === t.key && s.transportChipTextActive]}>
                                        {t.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={s.toggleRow}>
                            <View>
                                <Text style={s.toggleLabel}>Availability Status</Text>
                                <Text style={s.toggleSubLabel}>
                                    {available ? "You are visible to the system" : "You are hidden from deliveries"}
                                </Text>
                            </View>
                            <Switch
                                value={available}
                                onValueChange={setAvailable}
                                trackColor={{ false: C.dim, true: `${C.green}60` }}
                                thumbColor={available ? C.green : C.muted}
                                ios_backgroundColor={C.dim}
                            />
                        </View>

                        <TouchableOpacity
                            style={[s.saveBtn, saving && s.saveBtnDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                            activeOpacity={0.85}
                        >
                            {saving ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-outline" size={18} color="#FFF" />
                                    <Text style={s.saveBtnText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Account info */}
                {!editMode && (
                    <View style={s.accountCard}>
                        <Text style={s.sectionLabel}>Account</Text>
                        {[
                            { label: "Phone",   value: user?.phoneNumber ?? "—", icon: "call-outline"   as keyof typeof Ionicons.glyphMap },
                            { label: "Address", value: user?.address     ?? "—", icon: "location-outline" as keyof typeof Ionicons.glyphMap },
                            { label: "Role",    value: user?.role        ?? "—", icon: "shield-outline"  as keyof typeof Ionicons.glyphMap },
                            { label: "Status",  value: user?.isActive ? "Active" : "Inactive", icon: "ellipse-outline" as keyof typeof Ionicons.glyphMap, isStatus: true },
                        ].map((row, i, arr) => (
                            <View key={row.label} style={[s.accountRow, i < arr.length - 1 && s.accountRowBorder]}>
                                <View style={s.accountLabelRow}>
                                    <Ionicons name={row.icon} size={16} color={C.muted} style={{ marginRight: 8 }} />
                                    <Text style={s.accountLabel}>{row.label}</Text>
                                </View>
                                <Text
                                    style={[
                                        s.accountValue,
                                        (row as any).isStatus && { color: user?.isActive ? C.green : C.red },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Logout */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={18} color={C.red} style={{ marginRight: 8 }} />
                    <Text style={s.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.bg },
    content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
    profileCard: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 24 },
    avatarGlow: { position: "absolute", left: 14, width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,107,0,0.15)" },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,107,0,0.4)", marginRight: 14 },
    avatarText: { color: "#FFF", fontSize: 22, fontWeight: "800" },
    profileInfo: { flex: 1 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
    name: { fontSize: 16, fontWeight: "800", color: C.text, letterSpacing: -0.3 },
    verifiedBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(52,199,89,0.12)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(52,199,89,0.3)" },
    verifiedText: { fontSize: 10, fontWeight: "700", color: C.green },
    email: { fontSize: 12, color: C.muted, marginBottom: 8 },
    availChip: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, gap: 5 },
    availDot: { width: 6, height: 6, borderRadius: 3 },
    availText: { fontSize: 11, fontWeight: "700" },
    editBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,107,0,0.10)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
    editBtnText: { fontSize: 13, fontWeight: "700", color: C.accent },
    sectionLabel: { fontSize: 10, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 },
    metricsLoading: { alignItems: "center", paddingVertical: 32 },
    metricsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 16 },
    ratingCard: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 24 },
    ratingCardLabel: { fontSize: 10, fontWeight: "700", color: C.muted, letterSpacing: 1.2, marginBottom: 10 },
    ratingStarsRow: { flexDirection: "row", gap: 4, marginBottom: 8 },
    editCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 20 },
    errorBanner: { backgroundColor: "#FFF0EF", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255,59,48,0.25)", marginBottom: 12 },
    errorText: { fontSize: 12, color: C.red, fontWeight: "500" },
    fieldLabel: { fontSize: 11, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginTop: 12 },
    textInput: { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.text },
    transportRow: { gap: 8, paddingVertical: 4 },
    transportChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, backgroundColor: C.surface, borderColor: C.border },
    transportChipActive: { backgroundColor: "rgba(255,107,0,0.10)", borderColor: "rgba(255,107,0,0.35)" },
    transportChipText: { fontSize: 13, fontWeight: "600", color: C.muted },
    transportChipTextActive: { color: C.accent },
    toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 20 },
    toggleLabel: { fontSize: 15, fontWeight: "600", color: C.text, marginBottom: 3 },
    toggleSubLabel: { fontSize: 12, color: C.muted },
    saveBtn: { height: 52, borderRadius: 16, backgroundColor: C.accent, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6, shadowColor: C.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
    saveBtnDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
    saveBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
    accountCard: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, marginBottom: 20 },
    accountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13 },
    accountRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
    accountLabelRow: { flexDirection: "row", alignItems: "center" },
    accountLabel: { fontSize: 14, color: C.text, fontWeight: "400" },
    accountValue: { fontSize: 14, color: C.muted, fontWeight: "400", maxWidth: "55%", textAlign: "right" },
    logoutBtn: { height: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,59,48,0.08)", borderWidth: 1, borderColor: "rgba(255,59,48,0.25)" },
    logoutText: { color: C.red, fontSize: 16, fontWeight: "700" },
});
