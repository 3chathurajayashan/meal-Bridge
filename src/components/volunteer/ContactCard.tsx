import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
} from "react-native";
import type { ContactInfo } from "../../types/volunteer";

interface ContactCardProps {
    label: string;       // e.g. "Donor" or "Recipient"
    contact: ContactInfo;
    address?: string;    // optional address line shown below the contact
}

const ContactCard: React.FC<ContactCardProps> = ({
    label,
    contact,
    address,
}) => {
    const handleCall = () => {
        if (contact.phone) {
            Linking.openURL(`tel:${contact.phone}`);
        }
    };

    const handleEmail = () => {
        if (contact.email) {
            Linking.openURL(`mailto:${contact.email}`);
        }
    };

    // Initials avatar
    const initials = contact.name
        ? contact.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "?";

    return (
        <View style={styles.card}>
            {/* Role label */}
            <Text style={styles.roleLabel}>{label}</Text>

            <View style={styles.row}>
                {/* Avatar */}
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>

                {/* Name + address */}
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {contact.name}
                    </Text>
                    {address ? (
                        <Text style={styles.address} numberOfLines={2}>
                            {address}
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
                {contact.phone ? (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={handleCall}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.actionIcon}>📞</Text>
                        <Text style={styles.actionLabel}>Call</Text>
                    </TouchableOpacity>
                ) : null}

                {contact.email ? (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnSecondary]}
                        onPress={handleEmail}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.actionIcon}>✉️</Text>
                        <Text style={[styles.actionLabel, styles.actionLabelSecondary]}>
                            Email
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
};

export default ContactCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    roleLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FF6B00",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1C1C1E",
        letterSpacing: -0.3,
    },
    address: {
        fontSize: 13,
        color: "#8E8E93",
        marginTop: 2,
        lineHeight: 18,
    },
    actions: {
        flexDirection: "row",
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 40,
        borderRadius: 10,
        backgroundColor: "#FF6B00",
        gap: 6,
    },
    actionBtnSecondary: {
        backgroundColor: "#F2F2F7",
    },
    actionIcon: {
        fontSize: 14,
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    actionLabelSecondary: {
        color: "#1C1C1E",
    },
});
