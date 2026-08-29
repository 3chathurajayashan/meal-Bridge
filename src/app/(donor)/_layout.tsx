import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

export default function DonorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#1C1C1E',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView 
              name={focused ? 'house.fill' : 'house'} 
              tintColor={color} 
              size={24} 
              fallback={null}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: 'Tracking',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView 
              name={focused ? 'location.fill' : 'location'} 
              tintColor={color} 
              size={24} 
              fallback={null}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Donate',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.donateButton}>
              <SymbolView 
                name="plus" 
                tintColor="#FFFFFF" 
                size={24} 
                fallback={null}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView 
              name={focused ? 'clock.fill' : 'clock'} 
              tintColor={color} 
              size={24} 
              fallback={null}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView 
              name={focused ? 'person.fill' : 'person'} 
              tintColor={color} 
              size={24} 
              fallback={null}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  donateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
