import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    withSpring,
    interpolateColor,
    useSharedValue,
} from "react-native-reanimated";

type UserRole = "DONOR" | "RECIPIENT" | "VOLUNTEER";

const { width } = Dimensions.get("window");

// Sub-component for individual cards to handle smooth per-card animations
const RoleCard = ({
    item,
    isSelected,
    onSelect,
}: {
    item: { role: UserRole; title: string; description: string };
    isSelected: boolean;
    onSelect: () => void;
}) => {
    // Shared value for smooth Apple-style spring scaling
    const scale = useSharedValue(1);

    const animatedCardStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    return (
        <Animated.View style={[animatedCardStyle]}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onSelect}
                style={[
                    styles.roleCard,
                    isSelected && styles.selectedCard,
                ]}
            >
                {/* Text Block */}
                <View style={styles.textContainer}>
                    <Text style={[styles.roleTitle, isSelected && styles.selectedRoleTitle]}>
                        {item.title}
                    </Text>
                    <Text style={styles.roleDescription}>
                        {item.description}
                    </Text>
                </View>

                {/* Apple-style minimalist Radio Indicator */}
                <View
                    style={[
                        styles.radio,
                        isSelected && styles.radioSelected,
                    ]}
                >
                    {isSelected && <View style={styles.radioDot} />}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const RoleSelectionScreen = () => {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    const roles = [
        {
            role: "DONOR" as UserRole,
            title: "I want to Donate",
            description: "Share surplus food with people in need seamlessly",
        },
        {
            role: "RECIPIENT" as UserRole,
            title: "I need Food",
            description: "Find available fresh food donations near your location",
        },
        {
            role: "VOLUNTEER" as UserRole,
            title: "I'm a Volunteer",
            description: "Help transport and deliver contributions safely",
        },
    ];

    const handleContinue = () => {
        if (!selectedRole) return;
        router.replace('/main' as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>

                {/* Header with staggered entrance animation */}
                <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
                    <Text style={styles.logo}>MealBridge</Text>
                    <Text style={styles.title}>
                        How would you like{"\n"}to use MealBridge?
                    </Text>
                    <Text style={styles.subtitle}>
                        Select your path to personalize your experience.
                    </Text>
                </Animated.View>

                {/* Role Cards List */}
                <View style={styles.rolesContainer}>
                    {roles.map((item, index) => (
                        <Animated.View 
                            key={item.role} 
                            entering={FadeInDown.delay(150 + index * 100).duration(500).springify()}
                        >
                            <RoleCard
                                item={item}
                                isSelected={selectedRole === item.role}
                                onSelect={() => setSelectedRole(item.role)}
                            />
                        </Animated.View>
                    ))}
                </View>

                {/* Dynamic Continue Button that slides/fades smoothly */}
                {selectedRole && (
                    <Animated.View entering={FadeInDown.duration(400).springify()}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleContinue}
                            style={styles.continueButton}
                        >
                            <Text style={styles.continueText}>Continue</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

            </View>
        </SafeAreaView>
    );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        justifyContent: "space-between",
    },
    header: {
        alignItems: "center",
        marginTop: 20,
    },
    logo: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FF6B00",
        letterSpacing: -0.5,
        marginBottom: 24,
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
        color: "#111827",
        textAlign: "center",
        lineHeight: 38,
        letterSpacing: -0.8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 12,
        letterSpacing: -0.2,
    },
    rolesContainer: {
        gap: 14,
        marginVertical: 20,
    },
    roleCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 20,
        padding: 20,
    },
    selectedCard: {
        borderColor: "#FF6B00",
        backgroundColor: "#FFF9F5", // Soft subtle orange tinted background
        shadowColor: "#FF6B00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    textContainer: {
        flex: 1,
        marginRight: 10,
    },
    roleTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    selectedRoleTitle: {
        color: "#D95B00", // Darker accent tone for selection heading clarity
    },
    roleDescription: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
        letterSpacing: -0.1,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        alignItems: "center",
        justifyContent: "center",
    },
    radioSelected: {
        borderColor: "#FF6B00",
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#FF6B00",
    },
    continueButton: {
        height: 56,
        borderRadius: 18,
        backgroundColor: "#FF6B00",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FF6B00",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 10,
    },
    continueText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "600",
        letterSpacing: -0.2,
    },
});