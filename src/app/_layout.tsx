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