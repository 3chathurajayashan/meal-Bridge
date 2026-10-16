import React from "react";
import {
    View,
    ActivityIndicator,
    Text,
    StyleSheet,
} from "react-native";

interface LoadingStateProps {
    message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
    message = "Loading...",
}) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

export default LoadingState;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        backgroundColor: "#F2F2F7",
    },
    message: {
        marginTop: 14,
        fontSize: 15,
        fontWeight: "500",
        color: "#8E8E93",
        letterSpacing: -0.2,
    },
});
