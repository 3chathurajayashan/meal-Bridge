import { Tabs } from "expo-router";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const C = {
  bg: "#FFFFFF",
  accent: "#FF6B00",
  inactive: "#8E8E93",
  border: "#E5E5EA",
};

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focusedName: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
}

function TabIcon({ name, focusedName, label, focused }: TabIconProps) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      <Ionicons
        name={focused ? focusedName : name}
        size={22}
        color={focused ? C.accent : C.inactive}
        style={styles.tabIcon}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  );
}

export default function VolunteerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="map-outline"
              focusedName="map"
              label="Dashboard"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="deliveries/ongoing"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="bicycle-outline"
              focusedName="bicycle"
              label="Ongoing"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="clipboard-outline"
              focusedName="clipboard"
              label="Activity"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="person-outline"
              focusedName="person"
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />

      {/* Hidden route — completely omitted from navigation bar */}
      <Tabs.Screen
        name="deliveries/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: C.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
    height: 72,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 64,
  },
  tabItemFocused: {
    backgroundColor: "rgba(255,107,0,0.10)",
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: C.inactive,
    letterSpacing: 0.3,
  },
  tabLabelFocused: {
    color: C.accent,
    fontWeight: "700",
  },
});