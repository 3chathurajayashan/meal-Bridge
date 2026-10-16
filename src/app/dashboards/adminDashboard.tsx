import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        console.log("LOGOUT BUTTON PRESSED");

        try {
            await logout();
            console.log("LOGOUT SUCCESS");
            router.replace("/auth/signIn");
            console.log("NAVIGATION CALLED");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleUpdateProfilePic = () => {
        // Implement your image picker logic here (e.g., expo-image-picker)
        console.log("Update profile picture tapped");
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.welcome}>Welcome back</Text>
                        <Text style={styles.title}>Dashboard</Text>
                    </View>

                    {/* Profile Image Container with Plus Button */}
                    <TouchableOpacity 
                        style={styles.profileContainer} 
                        onPress={handleUpdateProfilePic}
                        activeOpacity={0.9}
                    >
                        {user?.profileImage?.url ? (
                            <Image
                                source={{ uri: user.profileImage.url }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.profilePlaceholder}>
                                <Text style={styles.profilePlaceholderText}>
                                    {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                                </Text>
                            </View>
                        )}
                        
                        {/* The Plus Badge Icon */}
                        <View style={styles.plusBadge}>
                            <Text style={styles.plusIcon}>+</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* System Status Banner */}
                <View style={styles.bannerCard}>
                    <View style={styles.bannerTextContainer}>
                        <Text style={styles.bannerTitle}>System Operational</Text>
                        <Text style={styles.bannerSubtitle}>All services and databases are running smoothly.</Text>
                    </View>
                </View>

                {/* Overview */}
                <Text style={styles.sectionHeader}>Overview & Requests</Text>

                <View style={styles.statsContainer}>
                    {/* Donor Requests */}
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Donor Requests</Text>
                    </View>

                    {/* User Requests */}
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>User Requests</Text>
                    </View>

                    {/* Recipient Assigns */}
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Recipient Assigns</Text>
                    </View>

                    {/* Delivery Requests */}
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Delivery Requests</Text>
                    </View>
                </View>

                {/* Quick Analytics Row */}
                <Text style={styles.sectionHeader}>Performance Metrics</Text>
                
                <View style={styles.metricsContainer}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricValue}>100%</Text>
                        <Text style={styles.metricLabel}>Uptime</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricValue}>0ms</Text>
                        <Text style={styles.metricLabel}>Latency</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricValue}>v2.4</Text>
                        <Text style={styles.metricLabel}>Build</Text>
                    </View>
                </View>

                {/* Account Information Section */}
                <Text style={styles.sectionHeader}>Account Information</Text>

                <View style={styles.profileCard}>
                    {/* Full Name */}
                    <View style={styles.profileRow}>
                        <Text style={styles.label}>Full Name</Text>
                        <Text style={styles.value} numberOfLines={1}>
                            {user?.fullName || "N/A"}
                        </Text>
                    </View>

                    {/* Email */}
                    <View style={styles.profileRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value} numberOfLines={1}>
                            {user?.email || "N/A"}
                        </Text>
                    </View>

                    {/* Phone Number */}
                    <View style={styles.profileRow}>
                        <Text style={styles.label}>Phone Number</Text>
                        <Text style={styles.value}>{user?.phoneNumber || "N/A"}</Text>
                    </View>

                    {/* Address */}
                    <View style={styles.profileRow}>
                        <Text style={styles.label}>Address</Text>
                        <Text style={styles.value} numberOfLines={1}>
                            {user?.address || "N/A"}
                        </Text>
                    </View>

                    {/* Role */}
                    <View style={styles.profileRow}>
                        <Text style={styles.label}>Role</Text>
                        <Text style={styles.role}>{user?.role || "N/A"}</Text>
                    </View>

                    {/* Account Status */}
                    <View style={[styles.profileRow, styles.lastRow]}>
                        <Text style={styles.label}>Account Status</Text>
                        <Text
                            style={[
                                styles.status,
                                !user?.isActive && styles.inactiveStatus,
                            ]}
                        >
                            {user?.isActive ? "Active" : "Inactive"}
                        </Text>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    activeOpacity={0.7}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminDashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },

    content: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 40,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingHorizontal: 4,
    },

    headerTextContainer: {
        flex: 1,
        paddingRight: 12,
    },

    welcome: {
        fontSize: 12,
        fontWeight: "600",
        color: "#000000",
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
        marginRight: 4,
    },

    profileImage: {
        width: "100%",
        height: "100%",
        borderRadius: 24,
        backgroundColor: "#E5E5EA",
    },

    profilePlaceholder: {
        width: "100%",
        height: "100%",
        borderRadius: 24,
        backgroundColor: "#007AFF",
        alignItems: "center",
        justifyContent: "center",
    },

    profilePlaceholderText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },

    plusBadge: {
        position: "absolute",
        right: -4,
        bottom: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        borderWidth: 1.5,
        borderColor: "#F2F2F7",
    },

    plusIcon: {
        color: "#007AFF",
        fontSize: 12,
        fontWeight: "700",
        marginTop: -1,
    },

    bannerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },

    bannerTextContainer: {
        flex: 1,
    },

    bannerTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1C1C1E",
        marginBottom: 1,
    },

    bannerSubtitle: {
        fontSize: 12,
        color: "#8E8E93",
        fontWeight: "400",
    },

    sectionHeader: {
        fontSize: 13,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
        paddingHorizontal: 4,
    },

    statsContainer: {
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

    statNumber: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1C1C1E",
        letterSpacing: -0.4,
    },

    statLabel: {
        fontSize: 13,
        fontWeight: "500",
        color: "#8E8E93",
        marginTop: 2,
    },

    metricsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },

    metricCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: "center",
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },

    metricValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1C1C1E",
        marginBottom: 2,
    },

    metricLabel: {
        fontSize: 11,
        fontWeight: "500",
        color: "#8E8E93",
        textTransform: "uppercase",
    },

    profileCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },

    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 13,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#C6C6C8",
    },

    lastRow: {
        borderBottomWidth: 0,
    },

    label: {
        fontSize: 15,
        color: "#1C1C1E",
        fontWeight: "400",
    },

    value: {
        fontSize: 15,
        fontWeight: "400",
        color: "#8E8E93",
        maxWidth: "55%",
        textAlign: "right",
    },

    role: {
        fontSize: 15,
        fontWeight: "500",
        color: "#007AFF",
    },

    status: {
        fontSize: 15,
        fontWeight: "500",
        color: "#34C759",
    },

    inactiveStatus: {
        color: "#FF3B30",
    },

    logoutButton: {
        height: 50,
        borderRadius: 12,
        backgroundColor: "#FF3B30",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#E5E5EA",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },

    logoutText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});