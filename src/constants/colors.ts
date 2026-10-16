/**
 * Community Food Connect - Color Theme
 * Strict adherence to Orange 500 (#F97316) + White (#FFFFFF) + Black (#000000)
 */

export const COLORS = {
  // Brand / Primary
  primary: '#F97316',       // Orange 500 (Primary brand color)
  primaryDark: '#EA580C',   // Orange 600
  primaryDarker: '#C2410C', // Orange 700
  primaryLight: '#FB923C',  // Orange 400
  primarySoft: '#FFEDD5',   // Orange 100
  primaryBg: '#FFF7ED',     // Orange 50

  // Base
  white: '#FFFFFF',         // Card & Screen Backgrounds
  black: '#000000',         // Primary Text & High Contrast elements

  // Text Hierarchy
  textPrimary: '#000000',   // Black for main headings and titles
  textSecondary: '#4B5563', // Slate 600 for secondary text
  textMuted: '#6B7280',     // Gray 500 for captions and subtle timestamps
  textDisabled: '#9CA3AF',  // Gray 400 for disabled states
  textInverse: '#FFFFFF',   // White text on dark/orange backgrounds

  // Neutral / Backgrounds / Borders
  background: '#FFFFFF',    // Pure White main screen background
  surface: '#FFFFFF',       // Card and modal background
  surfaceSecondary: '#F9FAFB', // Light gray 50 for section fills
  surfaceMuted: '#F3F4F6',  // Light gray 100 for input fills
  border: '#E5E7EB',        // Light gray 200 for subtle dividers
  borderDark: '#D1D5DB',    // Light gray 300 for input borders
  borderOrange: '#F97316',  // Orange 500 for active/selected borders

  // Status & Badges
  statusAvailable: '#16A34A', // Green 600
  statusAvailableBg: '#DCFCE7', // Green 100
  statusPending: '#EAB308',   // Yellow 500
  statusPendingBg: '#FEF9C3', // Yellow 100
  statusAccepted: '#2563EB',  // Blue 600
  statusAcceptedBg: '#DBEAFE', // Blue 100
  statusReserved: '#F97316',  // Orange 500
  statusReservedBg: '#FFEDD5', // Orange 100
  statusInTransit: '#0D9488', // Teal 600
  statusInTransitBg: '#CCFBF1', // Teal 100
  statusCompleted: '#16A34A', // Green 600
  statusCompletedBg: '#DCFCE7', // Green 100
  statusDelivered: '#16A34A',
  statusDeliveredBg: '#DCFCE7',
  statusCancelled: '#DC2626', // Red 600
  statusCancelledBg: '#FEE2E2', // Red 100
  statusExpired: '#6B7280',   // Gray 500
  statusExpiredBg: '#F3F4F6', // Gray 100

  // Semantic
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Shadows / Overlays
  shadowColor: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
  glassBg: 'rgba(255, 255, 255, 0.92)',
};

export default COLORS;