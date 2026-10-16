import QRCode from 'qrcode';
import { Donation } from './api';

export interface DonationQRPayload {
  app: 'mealbridge';
  type: 'FOOD_DONATION';
  v: string;
  donationId: string;
  verificationCode: string;
  title: string;
  category: string;
  quantity: string;
  pickupAddress: string;
  expiry?: string;
  donorName: string;
  timestamp: string;
}

/**
 * Creates a unique verification code string for a donation (e.g. MB-6A8180E9)
 */
export const getDonationVerificationCode = (donationId: string): string => {
  if (!donationId) return 'MB-DONATION';
  const cleanId = donationId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const short = cleanId.length > 8 ? cleanId.slice(-8) : cleanId;
  return `MB-${short}`;
};

/**
 * Encodes donation details into a structured QR payload JSON string
 */
export const generateDonationQRPayload = (donation: Donation, donorName: string = 'Thilakshi Weliwaththa'): string => {
  const payload: DonationQRPayload = {
    app: 'mealbridge',
    type: 'FOOD_DONATION',
    v: '1.0',
    donationId: donation.id,
    verificationCode: getDonationVerificationCode(donation.id),
    title: donation.title,
    category: donation.category,
    quantity: donation.quantity,
    pickupAddress: donation.pickupAddress || 'Address specified upon pickup',
    expiry: donation.expiry,
    donorName,
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(payload);
};

/**
 * Parses raw scanned string from a barcode/QR scanner
 * Handles both JSON payloads and deep-link URIs (mealbridge://donation/...)
 */
export const parseDonationQRString = (rawText: string): DonationQRPayload | null => {
  if (!rawText || typeof rawText !== 'string') return null;

  const trimmed = rawText.trim();

  // 1. Try parsing JSON format
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.app === 'mealbridge' || parsed.donationId || parsed.title) {
      return {
        app: 'mealbridge',
        type: 'FOOD_DONATION',
        v: parsed.v || '1.0',
        donationId: parsed.donationId || parsed.id || 'N/A',
        verificationCode: parsed.verificationCode || getDonationVerificationCode(parsed.donationId || parsed.id || ''),
        title: parsed.title || 'Food Donation',
        category: parsed.category || 'Food item',
        quantity: parsed.quantity || '1 portion',
        pickupAddress: parsed.pickupAddress || parsed.address || 'Colombo, Sri Lanka',
        expiry: parsed.expiry,
        donorName: parsed.donorName || parsed.donor || 'Verified Donor',
        timestamp: parsed.timestamp || new Date().toISOString(),
      };
    }
  } catch {
    // Not raw JSON, try URI format below
  }

  // 2. Try URI format: mealbridge://donation/:id?title=...
  if (trimmed.startsWith('mealbridge://') || trimmed.includes('/donation/')) {
    try {
      const url = new URL(trimmed.replace('mealbridge://', 'http://dummy/'));
      const parts = url.pathname.split('/');
      const id = parts[parts.length - 1] || 'sample-donation';
      const title = url.searchParams.get('title') || 'Food Donation';
      const category = url.searchParams.get('category') || 'Food Item';
      const quantity = url.searchParams.get('qty') || url.searchParams.get('quantity') || '1 portion';
      const donor = url.searchParams.get('donor') || 'Food Donor';
      const address = url.searchParams.get('address') || 'Colombo, Sri Lanka';

      return {
        app: 'mealbridge',
        type: 'FOOD_DONATION',
        v: '1.0',
        donationId: id,
        verificationCode: getDonationVerificationCode(id),
        title,
        category,
        quantity,
        pickupAddress: address,
        donorName: donor,
        timestamp: new Date().toISOString(),
      };
    } catch {
      // ignore
    }
  }

  // 3. Fallback: treat string as a donation ID or title
  return {
    app: 'mealbridge',
    type: 'FOOD_DONATION',
    v: '1.0',
    donationId: trimmed.slice(0, 24),
    verificationCode: getDonationVerificationCode(trimmed),
    title: trimmed.length < 40 ? trimmed : 'Scanned Food Donation',
    category: 'Prepared Meals',
    quantity: 'Donation Pack',
    pickupAddress: 'Shared via QR Code',
    donorName: 'MealBridge Donor',
    timestamp: new Date().toISOString(),
  };
};

/**
 * Computes a 2D boolean matrix of QR modules using pure JS QRCode generator
 */
export const getQRMatrix = (text: string): boolean[][] => {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const matrix: boolean[][] = [];

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(qr.modules.get(r, c) === 1);
      }
      matrix.push(row);
    }
    return matrix;
  } catch (error) {
    console.error('Error creating QR matrix:', error);
    return [];
  }
};
