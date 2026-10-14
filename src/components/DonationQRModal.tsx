import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Donation } from '../services/api';
import { QRCodeView } from './QRCodeView';
import { generateDonationQRPayload, getDonationVerificationCode } from '../services/qrService';

interface DonationQRModalProps {
  visible: boolean;
  donation: Donation | null;
  donorName?: string;
  onClose: () => void;
}

export const DonationQRModal: React.FC<DonationQRModalProps> = ({
  visible,
  donation,
  donorName = 'Thilakshi Weliwaththa',
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!donation) return null;

  const verificationCode = getDonationVerificationCode(donation.id);
  const qrPayload = generateDonationQRPayload(donation, donorName);

  const formattedShareMessage = `🤝 MealBridge Food Donation Pass
━━━━━━━━━━━━━━━━━━━━━
📦 Item: ${donation.title}
🏷️ Category: ${donation.category}
🔢 Quantity: ${donation.quantity}
👤 Donor: ${donorName}
📍 Pickup: ${donation.pickupAddress || 'Address provided upon confirmation'}
⏰ Available Until: ${donation.expiry || 'Today'}
🔑 Verification Code: ${verificationCode}
🆔 Donation ID: ${donation.id}
━━━━━━━━━━━━━━━━━━━━━
Scan this QR code in the MealBridge app to verify and complete the pickup.`;

  const handleShare = async () => {
    try {
      await Share.share({
        title: `MealBridge Pass - ${donation.title}`,
        message: formattedShareMessage,
      });
    } catch (error) {
      console.log('Error sharing QR details:', error);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Donation QR Pass</Text>
              <Text style={styles.headerSubtitle}>Unique verification code for pickup</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <SymbolView name="xmark.circle.fill" tintColor="#8E8E93" size={26} fallback={null} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Ticket Card */}
            <View style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <View style={styles.badgeRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{donation.category}</Text>
                  </View>
                  <View style={styles.codeBadge}>
                    <SymbolView name="checkmark.shield.fill" tintColor="#34C759" size={12} fallback={null} />
                    <Text style={styles.codeBadgeText}>{verificationCode}</Text>
                  </View>
                </View>

                <Text style={styles.foodTitle}>{donation.title}</Text>
                <Text style={styles.foodQuantity}>{donation.quantity}</Text>
              </View>

              {/* QR Code Container */}
              <View style={styles.qrContainer}>
                <View style={styles.qrFrame}>
                  <QRCodeView value={qrPayload} size={190} color="#1C1C1E" backgroundColor="#FFFFFF" />
                </View>
                <Text style={styles.scanInstruction}>
                  Present this QR code to the recipient or volunteer at pickup
                </Text>
              </View>

              {/* Ticket Divider */}
              <View style={styles.dividerRow}>
                <View style={[styles.punchHole, styles.punchLeft]} />
                <View style={styles.dashedLine} />
                <View style={[styles.punchHole, styles.punchRight]} />
              </View>

              {/* Metadata Details */}
              <View style={styles.metaContainer}>
                <View style={styles.metaRow}>
                  <SymbolView name="person.fill" tintColor="#FF6B00" size={16} fallback={null} />
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Donor</Text>
                    <Text style={styles.metaValue}>{donorName}</Text>
                  </View>
                </View>

                {donation.pickupAddress ? (
                  <View style={styles.metaRow}>
                    <SymbolView name="mappin.and.ellipse" tintColor="#FF6B00" size={16} fallback={null} />
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>Pickup Location</Text>
                      <Text style={styles.metaValue}>{donation.pickupAddress}</Text>
                    </View>
                  </View>
                ) : null}

                {donation.expiry ? (
                  <View style={styles.metaRow}>
                    <SymbolView name="clock.fill" tintColor="#FF6B00" size={16} fallback={null} />
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>Available Until</Text>
                      <Text style={styles.metaValue}>{donation.expiry}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <SymbolView name="square.and.arrow.up.fill" tintColor="#FFFFFF" size={18} fallback={null} />
                <Text style={styles.shareBtnText}>Share QR & Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
                onPress={handleCopy}
              >
                <SymbolView
                  name={copied ? 'checkmark' : 'doc.on.doc.fill'}
                  tintColor={copied ? '#34C759' : '#1C1C1E'}
                  size={18}
                  fallback={null}
                />
                <Text style={[styles.copyBtnText, copied && styles.copyBtnSuccessText]}>
                  {copied ? 'Copied!' : 'Copy Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  ticketHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '700',
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeBadgeText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },
  foodTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  foodQuantity: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  qrFrame: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  scanInstruction: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 240,
    lineHeight: 16,
  },
  dividerRow: {
    position: 'relative',
    height: 20,
    justifyContent: 'center',
    marginVertical: 4,
  },
  dashedLine: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    marginHorizontal: 24,
  },
  punchHole: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
  },
  punchLeft: {
    left: -10,
  },
  punchRight: {
    right: -10,
  },
  metaContainer: {
    padding: 20,
    gap: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  shareBtn: {
    flex: 1.5,
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  copyBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  copyBtnSuccess: {
    borderColor: '#34C759',
    backgroundColor: '#F0FFF4',
  },
  copyBtnText: {
    color: '#1C1C1E',
    fontSize: 14,
    fontWeight: '700',
  },
  copyBtnSuccessText: {
    color: '#34C759',
  },
});

export default DonationQRModal;
