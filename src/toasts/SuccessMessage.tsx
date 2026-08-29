import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface SuccessMessageProps {
    visible: boolean;
    message: string;
    onHide?: () => void;
    duration?: number;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
    visible,
    message,
    onHide,
    duration = 2500,
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.85)).current;
    const translateY = useRef(new Animated.Value(-30)).current;

    useEffect(() => {
        if (visible) {
            // Apple-style snappy spring entry
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    },),
                    Animated.timing(scale, {
                        toValue: 0.9,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: -20,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    onHide?.();
                });
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible, duration, onHide, opacity, scale, translateY]);

    if (!visible) {
        return null;
    }

    return (
        <View style={styles.wrapper} pointerEvents="box-none">
            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity,
                        transform: [{ translateY }, { scale }],
                    },
                ]}
            >
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>✓</Text>
                </View>

                <Text style={styles.message} numberOfLines={2}>
                    {message}
                </Text>
            </Animated.View>
        </View>
    );
};

export default SuccessMessage;

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 9999,
    },
    container: {
        // Pill-shaped floating design characteristic of Apple UI
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        maxWidth: "90%",
        
        // Dark translucent aesthetic (similar to iOS system alerts/Dynamic Island)
        backgroundColor: "rgba(30, 30, 30, 0.92)",
        borderRadius: 30,

        // Soft shadows
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },

    iconContainer: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#34C759",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },

    icon: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "800",
    },

    message: {
        fontSize: 14,
        fontWeight: "500",
        color: "#F2F2F7",
        letterSpacing: -0.2,
    },
});