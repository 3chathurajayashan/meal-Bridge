import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import { RADIUS, FONTS, SPACING } from '../../constants/theme';
import { TrackingStep } from '../../types/request';
import SafeIcon from '../common/SafeIcon';

interface TimelineStepItem {
  step: TrackingStep;
  label: string;
  completedAt?: string;
  description: string;
  isCurrent: boolean;
  isCompleted: boolean;
}

interface TrackingTimelineProps {
  timeline: TimelineStepItem[];
  currentStatus: string;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  timeline,
  currentStatus,
}) => {
  return (
    <View style={styles.container}>
      {timeline.map((item, index) => {
        const isLast = index === timeline.length - 1;
        const isCurrent = item.isCurrent;
        const isCompleted = item.isCompleted;

        return (
          <View key={item.step} style={styles.stepRow}>
            {/* Step Indicator & Vertical Connector */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.nodeCircle,
                  isCurrent && styles.nodeCurrent,
                  isCompleted && !isCurrent && styles.nodeCompleted,
                  !isCompleted && !isCurrent && styles.nodePending,
                ]}
              >
                {isCompleted && !isCurrent ? (
                  <SafeIcon name="checkmark" size={14} color={COLORS.white} />
                ) : isCurrent ? (
                  <View style={styles.currentInnerDot} />
                ) : (
                  <Text style={styles.stepIndexText}>{index + 1}</Text>
                )}
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.connectorLine,
                    isCompleted ? styles.connectorCompleted : styles.connectorPending,
                  ]}
                />
              )}
            </View>

            {/* Step Text Info */}
            <View style={[styles.contentCol, isLast && styles.contentColLast]}>
              <View style={styles.stepHeader}>
                <Text
                  style={[
                    styles.stepLabel,
                    isCurrent && styles.stepLabelCurrent,
                    isCompleted && !isCurrent && styles.stepLabelCompleted,
                  ]}
                >
                  {item.label}
                </Text>
                {item.completedAt && (
                  <Text style={styles.timestampText}>{item.completedAt}</Text>
                )}
              </View>

              <Text style={styles.descriptionText}>{item.description}</Text>

              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current Stage</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 36,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeCurrent: {
    backgroundColor: COLORS.primary, // Orange 500
    borderWidth: 4,
    borderColor: COLORS.primarySoft,
  },
  nodeCompleted: {
    backgroundColor: COLORS.primaryDark,
  },
  nodePending: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  currentInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  stepIndexText: {
    fontSize: 11,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textDisabled,
  },
  connectorLine: {
    width: 2.5,
    flex: 1,
    minHeight: 48,
    marginVertical: 4,
  },
  connectorCompleted: {
    backgroundColor: COLORS.primary,
  },
  connectorPending: {
    backgroundColor: COLORS.border,
  },
  contentCol: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  contentColLast: {
    paddingBottom: 0,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textSecondary,
  },
  stepLabelCurrent: {
    color: COLORS.primaryDark,
    fontWeight: FONTS.weight.extrabold,
    fontSize: FONTS.size.md,
  },
  stepLabelCompleted: {
    color: COLORS.black,
    fontWeight: FONTS.weight.bold,
  },
  timestampText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    fontWeight: FONTS.weight.medium,
  },
  descriptionText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  currentBadge: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  currentBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
  },
});

export default TrackingTimeline;
