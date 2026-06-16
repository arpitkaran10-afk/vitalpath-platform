import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

interface MiniBarChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function MiniBarChart({ data, color = colors.primary, height = 32 }: MiniBarChartProps) {
  const max = Math.max(...data);
  return (
    <View style={[styles.container, { height }]}>
      {data.map((val, i) => {
        const barHeight = max > 0 ? (val / max) * height : 0;
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  height: barHeight,
                  backgroundColor: isLast ? color : color + '55',
                  borderRadius: radius.xs,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    minHeight: 2,
  },
});
