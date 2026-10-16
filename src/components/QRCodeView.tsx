import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { getQRMatrix } from '../services/qrService';

interface QRCodeViewProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  quietZone?: number;
}

interface Segment {
  isDark: boolean;
  length: number;
}

/**
 * Pure React Native QR Code renderer
 * Uses run-length encoded View blocks for fast 60fps rendering without native canvas/SVG dependencies
 */
export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 200,
  color = '#1C1C1E',
  backgroundColor = '#FFFFFF',
  quietZone = 2,
}) => {
  const { matrix, pixelSize, totalDimension } = useMemo(() => {
    const raw = getQRMatrix(value);
    if (!raw.length) {
      return { matrix: [], pixelSize: 0, totalDimension: size };
    }

    // Add quiet zone
    const n = raw.length;
    const paddedSize = n + quietZone * 2;
    const px = size / paddedSize;

    const fullMatrix: boolean[][] = [];
    for (let r = 0; r < paddedSize; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < paddedSize; c++) {
        const inOriginalR = r - quietZone;
        const inOriginalC = c - quietZone;
        if (inOriginalR >= 0 && inOriginalR < n && inOriginalC >= 0 && inOriginalC < n) {
          row.push(raw[inOriginalR][inOriginalC]);
        } else {
          row.push(false);
        }
      }
      fullMatrix.push(row);
    }

    return {
      matrix: fullMatrix,
      pixelSize: px,
      totalDimension: px * paddedSize,
    };
  }, [value, size, quietZone]);

  if (!matrix.length) {
    return <View style={[{ width: size, height: size, backgroundColor }, styles.centered]} />;
  }

  return (
    <View style={{ width: totalDimension, height: totalDimension, backgroundColor, overflow: 'hidden' }}>
      {matrix.map((row, rIdx) => {
        // Compress consecutive cells of same color into segments
        const segments: Segment[] = [];
        let currentDark = row[0];
        let currentLen = 0;

        for (let c = 0; c < row.length; c++) {
          if (row[c] === currentDark) {
            currentLen++;
          } else {
            segments.push({ isDark: currentDark, length: currentLen });
            currentDark = row[c];
            currentLen = 1;
          }
        }
        segments.push({ isDark: currentDark, length: currentLen });

        return (
          <View key={`row-${rIdx}`} style={{ flexDirection: 'row', height: pixelSize }}>
            {segments.map((seg, sIdx) => {
              if (!seg.isDark) {
                return (
                  <View
                    key={`seg-${sIdx}`}
                    style={{ width: seg.length * pixelSize, height: pixelSize, backgroundColor }}
                  />
                );
              }
              return (
                <View
                  key={`seg-${sIdx}`}
                  style={{
                    width: seg.length * pixelSize,
                    height: pixelSize,
                    backgroundColor: color,
                  }}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QRCodeView;
