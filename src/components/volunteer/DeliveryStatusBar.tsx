import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { DeliveryStatus } from "../../types/volunteer";

// ============================================================
// The four active progress steps shown on the detail screen.
// AVAILABLE is pre-claim and not shown in the progress bar.
// CANCELLED is shown as a standalone badge, not as a step.
// ============================================================

type Step = {
    key: DeliveryStatus;
    label: string;
    shortLabel: string;
};

const STEPS: Step[] = [
    { key: "ACCEPTED",   label: "Accepted",   shortLabel: "Accepted" },
    { key: "PICKED_UP",  label: "Picked Up",  shortLabel: "Picked Up" },
    { key: "IN_TRANSIT", label: "In Transit", shortLabel: "Transit" },
    { key: "DELIVERED",  label: "Delivered",  shortLabel: "Delivered" },
];

const STATUS_ORDER: DeliveryStatus[] = [
    "ACCEPTED",
    "PICKED_UP",
    "IN_TRANSIT",
    "DELIVERED",
];

interface DeliveryStatusBarProps {
    status: DeliveryStatus;
}

const DeliveryStatusBar: React.FC<DeliveryStatusBarProps> = ({ status }) => {
    if (status === "CANCELLED") {
        return (
            <View style={styles.cancelledWrapper}>
                <View style={styles.cancelledBadge}>
                    <Text style={styles.cancelledText}>Cancelled</Text>
                </View>
            </View>
        );
    }

    const currentIndex = STATUS_ORDER.indexOf(status);

    return (
        <View style={styles.container}>
            {STEPS.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isActive    = index === currentIndex;
                const isPending   = index > currentIndex;

                return (
                    <React.Fragment key={step.key}>
                        {/* Step node */}
                        <View style={styles.stepWrapper}>
                            <View
                                style={[
                                    styles.circle,
                                    isCompleted && styles.circleCompleted,
                                    isActive    && styles.circleActive,
                                    isPending   && styles.circlePending,
                                ]}
                            >
                                {isCompleted ? (
                                    <Text style={styles.checkmark}>✓</Text>
                                ) : (
                                    <View
                                        style={[
                                            styles.innerDot,
                                            isActive  && styles.innerDotActive,
                                            isPending && styles.innerDotPending,
                                        ]}
                                    />
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.stepLabel,
                                    isActive    && styles.stepLabelActive,
                                    isCompleted && styles.stepLabelCompleted,
                                    isPending   && styles.stepLabelPending,
                                ]}
                                numberOfLines={1}
                            >
                                {step.shortLabel}
                            </Text>
                        </View>

                        {/* Connector line (not after last step) */}
                        {index < STEPS.length - 1 ? (
                            <View
                                style={[
                                    styles.connector,
                                    index < currentIndex
                                        ? styles.connectorFilled
                                        : styles.connectorEmpty,
                                ]}
                            />
                        ) : null}
                    </React.Fragment>
                );
            })}
        </View>
    );
};

export default DeliveryStatusBar;

// ============================================================
// Colours
// ============================================================
const ORANGE  = "#FF6B00";
const GREEN   = "#34C759";
const GRAY_BG = "#E5E5EA";
const GRAY_TXT = "#8E8E93";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
        paddingHorizontal: 4,
    },

    // ── Step node ──────────────────────────────────────────
    stepWrapper: {
        alignItems: "center",
        width: 60,
    },
    circle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 5,
    },
    circleCompleted: {
        backgroundColor: GREEN,
    },
    circleActive: {
        backgroundColor: ORANGE,
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 3,
    },
    circlePending: {
        backgroundColor: GRAY_BG,
    },

    innerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    innerDotActive: {
        backgroundColor: "#FFFFFF",
    },
    innerDotPending: {
        backgroundColor: "#C7C7CC",
    },

    checkmark: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "800",
    },

    stepLabel: {
        fontSize: 10,
        fontWeight: "500",
        textAlign: "center",
    },
    stepLabelActive: {
        color: ORANGE,
        fontWeight: "700",
    },
    stepLabelCompleted: {
        color: GREEN,
        fontWeight: "600",
    },
    stepLabelPending: {
        color: GRAY_TXT,
    },

    // ── Connector ──────────────────────────────────────────
    connector: {
        flex: 1,
        height: 2,
        borderRadius: 1,
        marginTop: 13,   // vertically align with circle centre
    },
    connectorFilled: {
        backgroundColor: GREEN,
    },
    connectorEmpty: {
        backgroundColor: GRAY_BG,
    },

    // ── Cancelled badge ────────────────────────────────────
    cancelledWrapper: {
        alignItems: "center",
        paddingVertical: 8,
    },
    cancelledBadge: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#FF3B3020",
        borderWidth: 1,
        borderColor: "#FF3B30",
    },
    cancelledText: {
        color: "#FF3B30",
        fontSize: 14,
        fontWeight: "600",
        letterSpacing: -0.2,
    },
});
