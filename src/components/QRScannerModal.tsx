import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Donation } from '../services/api';
import { parseDonationQRString, DonationQRPayload, generateDonationQRPayload } from '../services/qrService';

interface QRScannerModalProps {
  visible: boolean;
  activeDonations?: Donation[];
  donorName?: string;
  onClose: () => void;
  onDonationScanned?: (donation: DonationQRPayload) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  visible,
  activeDonations = [],
  donorName = 'Thilakshi Weliwaththa',
  onClose,
  onDonationScanned,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedResult, setScannedResult] = useState<DonationQRPayload | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (visible) {
      setScannedResult(null);
      setIsSimulating(false);
      setManualInput('');
    }
  }, [visible]);

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scannedResult) return;
    const parsed = parseDonationQRString(data);
    if (parsed) {
      setScannedResult(parsed);
      onDonationScanned?.(parsed);
    }
  };

  const handleSimulateScan = (donation: Donation) => {
    setIsSimulating(true);
    setTimeout(() => {
      const payloadString = generateDonationQRPayload(donation, donorName);
      const parsed = parseDonationQRString(payloadString);
      if (parsed) {
        setScannedResult(parsed);
        onDonationScanned?.(parsed);
      }
      setIsSimulating(false);
    }, 400);
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    const parsed = parseDonationQRString(manualInput);
    if (parsed) {
      setScannedResult(parsed);
      onDonationScanned?.(parsed);
    }
  };

  const resetScan = () => {
    setScannedResult(null);
    setManualInput('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.modalTitle}>Scan Donation QR</Text>
              <Text style={styles.modalSubtitle}>Verify food pickup & handover</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <SymbolView name="xmark.circle.fill" tintColor="#8E8E93" size={28} fallback={null} />
            </TouchableOpacity>
          </View>

          {scannedResult ? (
            /* Scanned Result View */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultContent}>
              <View style={styles.resultCard}>
                <View style={styles.successBanner}>
                  <SymbolView name="checkmark.circle.fill" tintColor="#34C759" size={32} fallback={null} />
                  <Text style={styles.successTitle}>Valid Donation Pass</Text>
                  <Text style={styles.verificationCodeText}>{scannedResult.verificationCode}</Text>
                </View>

                <View style={styles.resultDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Food Item</Text>
                    <Text style={styles.detailValue}>{scannedResult.title}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{scannedResult.category}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity</Text>
                    <Text style={styles.detailValue}>{scannedResult.quantity}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Donor</Text>
                    <Text style={styles.detailValue}>{scannedResult.donorName}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Pickup Location</Text>
                    <Text style={styles.detailValue}>{scannedResult.pickupAddress}</Text>
                  </View>

                  {scannedResult.expiry ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Available Until</Text>
                      <Text style={styles.detailValue}>{scannedResult.expiry}</Text>
                    </View>
                  ) : null}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Verified At</Text>
                    <Text style={styles.detailValueSmall}>
                      {new Date(scannedResult.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.rescanBtn} onPress={resetScan}>
                    <SymbolView name="arrow.triangle.2.circlepath" tintColor="#FF6B00" size={16} fallback={null} />
                    <Text style={styles.rescanBtnText}>Scan Another</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                    <Text style={styles.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          ) : (
            /* Camera / Scan View */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scanContent}>
              {/* Camera Frame or Simulator Mock */}
              <View style={styles.cameraWrapper}>
                {permission?.granted ? (
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={handleBarcodeScanned}
                  />
                ) : (
                  <View style={styles.noCameraFallback}>
                    <SymbolView name="qrcode.viewfinder" tintColor="#FF6B00" size={54} fallback={null} />
                    <Text style={styles.noCameraText}>Camera Scan & Test Mode</Text>
                    {!permission?.granted && (
                      <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                        <Text style={styles.permBtnText}>Enable Camera Permission</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Viewfinder Target Frame */}
                <View style={styles.viewfinderFrame}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
              </View>

              <Text style={styles.scannerHint}>
                Align the QR code within the frame to scan automatically
              </Text>

              {/* Quick Simulator Test Section */}
              <View style={styles.simSection}>
                <View style={styles.simHeader}>
                  <SymbolView name="sparkles" tintColor="#FF6B00" size={14} fallback={null} />
                  <Text style={styles.simTitle}>Quick Simulator Testing</Text>
                </View>
                <Text style={styles.simDesc}>
                  Select any active donation below to test the instant scan & details display:
                </Text>

                <View style={styles.simButtonsContainer}>
                  {activeDonations.length > 0 ? (
                    activeDonations.slice(0, 3).map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.simItemBtn}
                        onPress={() => handleSimulateScan(item)}
                        disabled={isSimulating}
                      >
                        <SymbolView name="qrcode" tintColor="#1C1C1E" size={16} fallback={null} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.simItemTitle} numberOfLines={1}>
                            Scan: {item.title}
                          </Text>
                          <Text style={styles.simItemMeta}>
                            {item.quantity} • {item.category}
                          </Text>
                        </View>
                        <SymbolView name="chevron.right" tintColor="#8E8E93" size={14} fallback={null} />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <TouchableOpacity
                      style={styles.simItemBtn}
                      onPress={() =>
                        handleSimulateScan({
                          id: '6a8180e92305425a97f35bc7',
                          title: 'Fresh Bread',
                          category: 'Baked Goods',
                          quantity: '12 items',
                          expiry: 'Aug 16, 2026',
                          status: 'requested',
                          pickupAddress: '78 Park Avenue, Colombo',
                        })
                      }
                    >
                      <SymbolView name="qrcode" tintColor="#1C1C1E" size={16} fallback={null} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.simItemTitle}>Scan Sample: Fresh Bread</Text>
                        <Text style={styles.simItemMeta}>12 items • Baked Goods</Text>
                      </View>
                      <SymbolView name="chevron.right" tintColor="#8E8E93" size={14} fallback={null} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Manual Code Input Option */}
              <View style={styles.manualSection}>
                <Text style={styles.manualLabel}>Or enter Verification / Pass Code:</Text>
                <View style={styles.manualRow}>
                  <TextInput
                    style={styles.manualInput}
                    placeholder="e.g. MB-6A8180E9 or paste raw QR"
                    placeholderTextColor="#8E8E93"
                    value={manualInput}
                    onChangeText={setManualInput}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.manualBtn} onPress={handleManualSubmit}>
                    <Text style={styles.manualBtnText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  scanContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  cameraWrapper: {
    width: 250,
    height: 250,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 14,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#3A3A3C',
  },
  noCameraFallback: {
    alignItems: 'center',
    padding: 20,
  },
  noCameraText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  permBtn: {
    marginTop: 12,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  viewfinderFrame: {
    position: 'absolute',
    width: 190,
    height: 190,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FF6B00',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  scannerHint: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  simSection: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  simHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  simTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B00',
    textTransform: 'uppercase',
  },
  simDesc: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 16,
  },
  simButtonsContainer: {
    gap: 8,
  },
  simItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9F9FB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFF4',
  },
  simItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  simItemMeta: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  manualSection: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  manualLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#F9F9FB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  manualBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resultContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  successBanner: {
    backgroundColor: '#F0FFF4',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E7D32',
    marginTop: 8,
  },
  verificationCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resultDetails: {
    padding: 20,
    gap: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    maxWidth: '65%',
    textAlign: 'right',
  },
  detailValueSmall: {
    fontSize: 12,
    color: '#666666',
    maxWidth: '65%',
    textAlign: 'right',
  },
  categoryBadge: {
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  rescanBtn: {
    flex: 1,
    backgroundColor: '#FFF0E5',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rescanBtnText: {
    color: '#FF6B00',
    fontWeight: '700',
    fontSize: 14,
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default QRScannerModal;
