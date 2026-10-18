import React from 'react';
import { Stack } from 'expo-router';
import { AppProvider } from '../context/AppContext';
import { RecipientDemoProvider } from '@/context/RecipientDemoContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <RecipientDemoProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </RecipientDemoProvider>
    </AppProvider>
  );
}
 
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            />
        </AuthProvider>
    );
}
 
