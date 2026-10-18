import React from 'react';
import { AppProvider } from '../context/AppContext';
import AppNavigator from '../navigation/AppNavigator';

export default function RecipientApp() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
