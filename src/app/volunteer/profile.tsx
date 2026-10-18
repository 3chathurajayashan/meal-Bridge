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
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { volunteerApi, apiRequest } from "../../services/api";

const C = {
    bg: "#F8F9FA",
    surface: "#F1F3F5",
    card: "#FFFFFF",
    border: "#E9ECEF",
    accent: "#FF6B00",
    accentLight: "rgba(255, 107, 0, 0.08)",
    accentBorder: "rgba(255, 107, 0, 0.25)",
    green: "#10B981",
    greenLight: "rgba(16, 185, 129, 0.10)",
    red: "#EF4444",
    redLight: "rgba(239, 68, 68, 0.08)",
    blue: "#3B82F6",
    text: "#111827",
    muted: "#6B7280",
    dim: "#E5E7EB",
};

type TransportOption = {
    key: string;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
};

const TRANSPORT_OPTIONS: TransportOption[] = [
    { key: "foot", label: "Foot", iconName: "walk-outline" },
    { key: "bike", label: "Bike", iconName: "bicycle-outline" },
    { key: "scooter", label: "Scooter", iconName: "speedometer-outline" },
    { key: "car", label: "Car", iconName: "car-outline" },
    { key: "van", label: "Van", iconName: "bus-outline" },
];

// ─── Metric Card ──────────────────────────────────────────────
const MetricCard: React.FC<{
    value: string | number;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    color?: string;
}> = ({ value, label, iconName, color = C.accent }) => (
    <View style={metricS.card}>
        <View style={[metricS.iconWrap, { backgroundColor: `${color}14` }]}>
            <Ionicons name={iconName} size={20} color={color} />
        </View>
        <Text style={[metricS.value, { color }]}>{value}</Text>
        <Text style={metricS.label}>{label}</Text>
    </View>
);

const metricS = StyleSheet.create({
    card: {
        width: "48%",
        backgroundColor: C.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.border,
        padding: 16,
        marginBottom: 12,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    value: {
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    label: {
        fontSize: 12,
        color: C.muted,
        fontWeight: "600",
    },
});

// ─── Main Screen Component ─────────────────────────────────────
export default function VolunteerProfile() {
    const router = useRouter();
    const { user, accessToken, logout } = useAuth();

    const [summary, setSummary] = useState<{
        completedDeliveries: number;
        totalDeliveries: number;
        averageRating?: number;
    } | null>(null);
    const [cancelledCount, setCancelledCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Edit Form State
    const [editMode, setEditMode] = useState(false);
    const [fullName, setFullName] = useState(user?.fullName ?? "");
    const [phone, setPhone] = useState(user?.phoneNumber ?? "");
    const [transport, setTransport] = useState("car");
    const [available, setAvailable] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Sync input values when user profile updates
    useEffect(() => {
        if (user) {
            setFullName(user.fullName ?? "");
            setPhone(user.phoneNumber ?? "");
        }
    }, [user]);

    const fetchData = useCallback(async () => {
        if (!accessToken) return;
        try {
            const s = await volunteerApi.getSummary(accessToken);
            setSummary({
                completedDeliveries: s.completedDeliveries,
                totalDeliveries: s.totalDeliveries,
                averageRating: s.averageRating,
            });
            const history = await volunteerApi.getDeliveryHistory(accessToken);
            setCancelledCount(history.filter((d) => d.status === "CANCELLED").length);
        } catch (_) {
            // Silently fail — profile renders with existing state
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        if (!accessToken) return;
        if (!fullName.trim()) {
            setSaveError("Full Name cannot be empty.");
            return;
        }

        setSaving(true);
        setSaveError(null);
        try {
            await apiRequest(
                "/api/volunteers/profile",
                {
                    method: "PUT",
                    body: JSON.stringify({
                        fullName: fullName.trim(),
                        phoneNumber: phone.trim(),
                    }),
                },
                accessToken
            );
            setEditMode(false);
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "Failed to save profile changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/auth/signIn");
    };

    const initial = fullName?.charAt(0)?.toUpperCase() || user?.fullName?.charAt(0)?.toUpperCase() || "V";

    return (
        <SafeAreaView style={s.safeArea}>
            <ScrollView
                contentContainerStyle={s.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchData();
                        }}
                        tintColor={C.accent}
                    />
                }
            >
                {/* ── Modern Hero Profile Header ───────────────────────── */}
                <View style={s.heroCard}>
                    <View style={s.avatarContainer}>
                        <View style={s.avatar}>
                            <Text style={s.avatarText}>{initial}</Text>
                        </View>
                        <View style={[s.statusDot, { backgroundColor: available ? C.green : C.muted }]} />
                    </View>

                    <View style={s.heroInfo}>
                        <View style={s.nameRow}>
                            <Text style={s.name} numberOfLines={1}>
                                {user?.fullName ?? "Volunteer"}
                            </Text>
                            <View style={s.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={13} color={C.green} />
                                <Text style={s.verifiedText}>Verified</Text>
                            </View>
                        </View>

                        <Text style={s.email} numberOfLines={1}>
                            {user?.email ?? ""}
                        </Text>

                        <View style={s.heroMetaRow}>
                            <View style={s.transportBadge}>
                                <Ionicons
                                    name={
                                        TRANSPORT_OPTIONS.find((t) => t.key === transport)?.iconName ??
                                        "car-outline"
                                    }
                                    size={12}
                                    color={C.accent}
                                />
                                <Text style={s.transportBadgeText}>
                                    {TRANSPORT_OPTIONS.find((t) => t.key === transport)?.label ?? "Car"}
                                </Text>
                            </View>

                            <View
                                style={[
                                    s.availChip,
                                    { backgroundColor: available ? C.greenLight : "rgba(107,114,128,0.12)" },
                                ]}
                            >
                                <Text style={[s.availText, { color: available ? C.green : C.muted }]}>
                                    {available ? "Active" : "Unavailable"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[s.editToggleBtn, editMode && s.editToggleBtnActive]}
                        onPress={() => setEditMode(!editMode)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={editMode ? "close" : "pencil"}
                            size={16}
                            color={editMode ? C.red : C.accent}
                        />
                    </TouchableOpacity>
                </View>

                {/* ── Edit Profile Section ────────────────────────────── */}
                {editMode ? (
                    <View style={s.editCard}>
                        <Text style={s.sectionHeaderTitle}>Edit Details</Text>

                        {saveError ? (
                            <View style={s.errorBanner}>
                                <Ionicons name="alert-circle-outline" size={16} color={C.red} />
                                <Text style={s.errorText}>{saveError}</Text>
                            </View>
                        ) : null}

                        {/* Editable Name */}
                        <Text style={s.fieldLabel}>Full Name</Text>
                        <TextInput
                            style={s.textInput}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Your Full Name"
                            placeholderTextColor={C.muted}
                            autoCapitalize="words"
                        />

                        {/* Editable Phone */}
                        <Text style={s.fieldLabel}>Phone Number</Text>
                        <TextInput
                            style={s.textInput}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholder="Your phone number"
                            placeholderTextColor={C.muted}
                        />

                        {/* Transport Selection */}
                        <Text style={s.fieldLabel}>Transportation Vehicle</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={s.transportRow}
                        >
                            {TRANSPORT_OPTIONS.map((t) => (
                                <TouchableOpacity
                                    key={t.key}
                                    style={[
                                        s.transportChip,
                                        transport === t.key && s.transportChipActive,
                                    ]}
                                    onPress={() => setTransport(t.key)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={t.iconName}
                                        size={16}
                                        color={transport === t.key ? C.accent : C.muted}
                                    />
                                    <Text
                                        style={[
                                            s.transportChipText,
                                            transport === t.key && s.transportChipTextActive,
                                        ]}
                                    >
                                        {t.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Availability Toggle */}
                        <View style={s.toggleRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.toggleLabel}>Active Availability</Text>
                                <Text style={s.toggleSubLabel}>
                                    {available
                                        ? "Visible for new delivery dispatches"
                                        : "Hidden from delivery assignments"}
                                </Text>
                            </View>
                            <Switch
                                value={available}
                                onValueChange={setAvailable}
                                trackColor={{ false: C.dim, true: C.accentLight }}
                                thumbColor={available ? C.accent : C.muted}
                                ios_backgroundColor={C.dim}
                            />
                        </View>

                        {/* Save Button */}
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
                                    <Ionicons name="checkmark-sharp" size={18} color="#FFF" />
                                    <Text style={s.saveBtnText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* ── Performance Metrics ─────────────────────────────── */}
                <Text style={s.sectionHeaderTitle}>Performance</Text>
                {loading ? (
                    <View style={s.metricsLoading}>
                        <ActivityIndicator color={C.accent} />
                    </View>
                ) : (
                    <View style={s.metricsGrid}>
                        <MetricCard
                            value={summary?.completedDeliveries ?? 0}
                            label="Completed"
                            iconName="checkmark-circle-outline"
                            color={C.green}
                        />
                        <MetricCard
                            value={cancelledCount}
                            label="Cancelled"
                            iconName="close-circle-outline"
                            color={C.red}
                        />
                        <MetricCard
                            value={summary?.totalDeliveries ?? 0}
                            label="Total Orders"
                            iconName="car-outline"
                            color={C.blue}
                        />
                        <MetricCard
                            value={
                                summary?.averageRating != null
                                    ? summary.averageRating.toFixed(1)
                                    : "—"
                            }
                            label="Rating"
                            iconName="star-outline"
                            color="#F59E0B"
                        />
                    </View>
                )}

                {/* Rating Visual Breakdown */}
                {summary?.averageRating != null && (
                    <View style={s.ratingCard}>
                        <View style={s.ratingCardHeader}>
                            <Text style={s.ratingCardLabel}>OVERALL RATING</Text>
                            <Text style={s.ratingScore}>{summary.averageRating.toFixed(1)} / 5.0</Text>
                        </View>

                        <View style={s.ratingStarsRow}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Ionicons
                                    key={i}
                                    name={
                                        i < Math.round(summary.averageRating!)
                                            ? "star"
                                            : "star-outline"
                                    }
                                    size={22}
                                    color="#F59E0B"
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* ── Account Details Card ────────────────────────────── */}
                {!editMode && (
                    <View style={s.accountCard}>
                        <Text style={s.sectionHeaderTitle}>Account Details</Text>
                        {[
                            { label: "Phone", value: user?.phoneNumber ?? "—", icon: "call-outline" as keyof typeof Ionicons.glyphMap },
                            { label: "Address", value: user?.address ?? "—", icon: "location-outline" as keyof typeof Ionicons.glyphMap },
                            { label: "Role", value: user?.role ?? "—", icon: "shield-outline" as keyof typeof Ionicons.glyphMap },
                            {
                                label: "Status",
                                value: user?.isActive ? "Active" : "Inactive",
                                icon: "ellipse-outline" as keyof typeof Ionicons.glyphMap,
                                isStatus: true,
                            },
                        ].map((row, i, arr) => (
                            <View
                                key={row.label}
                                style={[
                                    s.accountRow,
                                    i < arr.length - 1 && s.accountRowBorder,
                                ]}
                            >
                                <View style={s.accountLabelRow}>
                                    <Ionicons
                                        name={row.icon}
                                        size={16}
                                        color={C.muted}
                                        style={{ marginRight: 10 }}
                                    />
                                    <Text style={s.accountLabel}>{row.label}</Text>
                                </View>
                                <Text
                                    style={[
                                        s.accountValue,
                                        row.isStatus && {
                                            color: user?.isActive ? C.green : C.red,
                                            fontWeight: "700",
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Logout Button */}
                <TouchableOpacity
                    style={s.logoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
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
    content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

    // Hero Profile Card
    heroCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.card,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: C.border,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 14,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: C.accent,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { color: "#FFF", fontSize: 24, fontWeight: "800" },
    statusDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        position: "absolute",
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: C.card,
    },
    heroInfo: { flex: 1, justifyContent: "center" },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
    name: { fontSize: 17, fontWeight: "800", color: C.text, letterSpacing: -0.3, flexShrink: 1 },
    verifiedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.greenLight,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        gap: 3,
    },
    verifiedText: { fontSize: 10, fontWeight: "700", color: C.green },
    email: { fontSize: 13, color: C.muted, marginBottom: 8 },
    heroMetaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    transportBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: C.accentLight,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    transportBadgeText: { fontSize: 11, fontWeight: "700", color: C.accent },
    availChip: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    availText: { fontSize: 11, fontWeight: "700" },

    editToggleBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: C.accentLight,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start",
    },
    editToggleBtnActive: {
        backgroundColor: C.redLight,
    },

    // Edit Section Card
    editCard: {
        backgroundColor: C.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        padding: 18,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeaderTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: C.muted,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: C.redLight,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },
    errorText: { fontSize: 13, color: C.red, fontWeight: "500", flex: 1 },
    fieldLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: C.muted,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 6,
        marginTop: 10,
    },
    textInput: {
        backgroundColor: C.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: C.text,
        fontWeight: "500",
    },
    transportRow: { gap: 8, paddingVertical: 4 },
    transportChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: C.surface,
        borderColor: C.border,
    },
    transportChipActive: {
        backgroundColor: C.accentLight,
        borderColor: C.accentBorder,
    },
    transportChipText: { fontSize: 13, fontWeight: "600", color: C.muted },
    transportChipTextActive: { color: C.accent },

    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
        marginBottom: 20,
    },
    toggleLabel: { fontSize: 14, fontWeight: "700", color: C.text },
    toggleSubLabel: { fontSize: 12, color: C.muted, marginTop: 2 },

    saveBtn: {
        height: 50,
        borderRadius: 14,
        backgroundColor: C.accent,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },

    // Metrics
    metricsLoading: { alignItems: "center", paddingVertical: 24 },
    metricsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    // Rating Breakdown Card
    ratingCard: {
        backgroundColor: C.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.border,
        padding: 16,
        marginBottom: 20,
    },
    ratingCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    ratingCardLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: C.muted,
        letterSpacing: 1.2,
    },
    ratingScore: { fontSize: 14, fontWeight: "800", color: "#F59E0B" },
    ratingStarsRow: { flexDirection: "row", gap: 4 },

    // Account Details
    accountCard: {
        backgroundColor: C.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 4,
        marginBottom: 20,
    },
    accountRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
    },
    accountRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.border,
    },
    accountLabelRow: { flexDirection: "row", alignItems: "center" },
    accountLabel: { fontSize: 14, color: C.text, fontWeight: "500" },
    accountValue: { fontSize: 14, color: C.muted, fontWeight: "500", maxWidth: "55%", textAlign: "right" },

    // Logout
    logoutBtn: {
        height: 50,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: C.redLight,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.2)",
    },
    logoutText: { color: C.red, fontSize: 15, fontWeight: "700" },
});