import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

interface EmptyStateProps {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
    /** Optional emoji / icon character shown above the title */
    icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    subtitle,
    actionLabel,
    onAction,
    icon = "📦",
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>

            <Text style={styles.title}>{title}</Text>

            {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
            ) : null}

            {actionLabel && onAction ? (
                <TouchableOpacity
                    style={styles.button}
                    onPress={onAction}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export default EmptyState;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingVertical: 60,
        backgroundColor: "#F2F2F7",
    },
    icon: {
        fontSize: 52,
        marginBottom: 18,
    },
    title: {
        fontSize: 19,
        fontWeight: "700",
        color: "#1C1C1E",
        textAlign: "center",
        letterSpacing: -0.4,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#8E8E93",
        textAlign: "center",
        lineHeight: 22,
        letterSpacing: -0.1,
    },
    button: {
        marginTop: 24,
        height: 48,
        paddingHorizontal: 28,
        borderRadius: 14,
        backgroundColor: "#FF6B00",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FF6B00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: -0.2,
    },
});
