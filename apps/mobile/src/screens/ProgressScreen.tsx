import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { colors, spacing, typography, radius } from '../theme';
import { PROGRESS_METRICS, PROGRAMME_PHASES, MEMBER_PROFILE } from '../data';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - spacing.md * 2 - spacing.md * 2;
const CHART_HEIGHT = 140;

function LineChart({ data, color }: { data: number[]; color: string }) {
  if (data.length === 0) return null;
  const min = Math.min(...data) * 0.96;
  const max = Math.max(...data) * 1.04;
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((val - min) / range) * CHART_HEIGHT;
    return `${x},${y}`;
  });
  const lastIdx = data.length - 1;
  const lastX = (lastIdx / (data.length - 1)) * CHART_WIDTH;
  const lastY = CHART_HEIGHT - ((data[lastIdx] - min) / range) * CHART_HEIGHT;

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 20}>
      {/* Month labels */}
      {data.map((_, i) => {
        const x = (i / (data.length - 1)) * CHART_WIDTH;
        return (
          <SvgText
            key={i}
            x={x}
            y={CHART_HEIGHT + 16}
            fontSize={10}
            fill={colors.onSurfaceVariant}
            textAnchor="middle"
          >
            M{i + 1}
          </SvgText>
        );
      })}
      {/* Line */}
      <Polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots */}
      {data.map((val, i) => {
        const x = (i / (data.length - 1)) * CHART_WIDTH;
        const y = CHART_HEIGHT - ((val - min) / range) * CHART_HEIGHT;
        return (
          <Circle
            key={i}
            cx={x}
            cy={y}
            r={i === lastIdx ? 6 : 3}
            fill={i === lastIdx ? color : colors.white}
            stroke={color}
            strokeWidth={2}
          />
        );
      })}
      {/* Last value label */}
      <SvgText
        x={lastX}
        y={lastY - 12}
        fontSize={11}
        fill={color}
        textAnchor="middle"
        fontWeight="bold"
      >
        {data[lastIdx]}
      </SvgText>
    </Svg>
  );
}

function ChangeTag({ change, unit }: { change: string; unit: string }) {
  const isPositive = change.startsWith('-');
  const color = isPositive ? colors.success : colors.error;
  const bg = isPositive ? colors.successContainer : colors.errorContainer;
  return (
    <View style={[styles.changeTag, { backgroundColor: bg }]}>
      <Text style={[styles.changeTagText, { color }]}>
        {change} {unit}
      </Text>
    </View>
  );
}

export default function ProgressScreen() {
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const metric = PROGRESS_METRICS.find(m => m.key === selectedMetric) ?? PROGRESS_METRICS[0];
  const currentPhase = PROGRAMME_PHASES[MEMBER_PROFILE.currentMonth - 1];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <View style={styles.phaseChip}>
            <Text style={styles.phaseChipText}>Month {MEMBER_PROFILE.currentMonth} of 6</Text>
          </View>
        </View>

        {/* Programme Timeline */}
        <Card variant="elevated" style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>6-Month Programme</Text>
          <View style={styles.timelineRow}>
            {PROGRAMME_PHASES.map((phase, i) => {
              const isCompleted = phase.month < MEMBER_PROFILE.currentMonth;
              const isActive = phase.month === MEMBER_PROFILE.currentMonth;
              const isFuture = phase.month > MEMBER_PROFILE.currentMonth;
              return (
                <React.Fragment key={phase.month}>
                  <View style={styles.timelineNode}>
                    <View
                      style={[
                        styles.timelineDot,
                        isCompleted && styles.dotCompleted,
                        isActive && styles.dotActive,
                        isFuture && styles.dotFuture,
                      ]}
                    >
                      {isCompleted ? (
                        <Text style={styles.dotCheck}>✓</Text>
                      ) : (
                        <Text style={[styles.dotNum, isActive && styles.dotNumActive]}>
                          {phase.month}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isActive && styles.timelineLabelActive,
                        isFuture && styles.timelineLabelFuture,
                      ]}
                      numberOfLines={1}
                    >
                      {phase.month === MEMBER_PROFILE.currentMonth ? phase.name : `M${phase.month}`}
                    </Text>
                  </View>
                  {i < 5 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        isCompleted && styles.connectorDone,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </Card>

        {/* Current Phase Card */}
        <Card variant="elevated" style={styles.phaseCard}>
          <View style={styles.phaseRow}>
            <View style={styles.phaseInfo}>
              <Text style={styles.phaseTag}>Active Phase</Text>
              <Text style={styles.phaseName}>{currentPhase.name}</Text>
              <Text style={styles.phaseFocus}>{currentPhase.focus}</Text>
            </View>
            <View style={styles.phaseProgressCircle}>
              <Text style={styles.phaseProgressPct}>{MEMBER_PROFILE.completionPercent}%</Text>
              <Text style={styles.phaseProgressLabel}>done</Text>
            </View>
          </View>
          <View style={styles.phaseBar}>
            <View style={[styles.phaseFill, { width: `${MEMBER_PROFILE.completionPercent}%` }]} />
          </View>
        </Card>

        {/* Biomarker Selector */}
        <Text style={styles.sectionTitle}>Biomarker Trends</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {PROGRESS_METRICS.map(m => (
            <Chip
              key={m.key}
              label={m.label}
              selected={selectedMetric === m.key}
              onPress={() => setSelectedMetric(m.key)}
              style={styles.chip}
            />
          ))}
        </ScrollView>

        {/* Chart Card */}
        <Card variant="elevated" style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartMetricName}>{metric.label}</Text>
              <View style={styles.chartValRow}>
                <Text style={styles.chartCurrentVal}>{metric.current}</Text>
                <Text style={styles.chartUnit}> {metric.unit}</Text>
                <ChangeTag change={metric.change} unit={metric.unit.includes('/') ? '' : metric.unit} />
              </View>
            </View>
            <View style={styles.chartBaseline}>
              <Text style={styles.chartBaselineLabel}>Baseline</Text>
              <Text style={styles.chartBaselineVal}>
                {metric.baseline} {metric.unit}
              </Text>
              <Text style={styles.chartBaselineLabel}>Target</Text>
              <Text style={styles.chartTargetVal}>
                {metric.target} {metric.unit}
              </Text>
            </View>
          </View>
          <View style={styles.chartArea}>
            <LineChart data={metric.data} color={colors.primary} />
          </View>
        </Card>

        {/* Monthly summaries */}
        <Text style={styles.sectionTitle}>Month by Month</Text>
        {PROGRAMME_PHASES.slice(0, MEMBER_PROFILE.currentMonth).map(phase => {
          const isActive = phase.month === MEMBER_PROFILE.currentMonth;
          return (
            <Card
              key={phase.month}
              variant={isActive ? 'elevated' : 'outlined'}
              style={styles.monthCard}
            >
              <View style={styles.monthRow}>
                <View
                  style={[
                    styles.monthBadge,
                    { backgroundColor: isActive ? colors.primaryContainer : colors.surfaceVariant },
                  ]}
                >
                  <Text
                    style={[
                      styles.monthBadgeText,
                      { color: isActive ? colors.primary : colors.onSurfaceVariant },
                    ]}
                  >
                    M{phase.month}
                  </Text>
                </View>
                <View style={styles.monthInfo}>
                  <Text style={styles.monthName}>{phase.name}</Text>
                  <Text style={styles.monthFocus}>{phase.focus}</Text>
                </View>
                <View style={styles.monthStatus}>
                  {isActive ? (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>Active</Text>
                    </View>
                  ) : (
                    <Text style={styles.doneCheck}>✓</Text>
                  )}
                </View>
              </View>
              {isActive && (
                <View style={styles.activeMonthGoals}>
                  {phase.goals.slice(0, 2).map((g, i) => (
                    <Text key={i} style={styles.goalItem}>
                      • {g}
                    </Text>
                  ))}
                </View>
              )}
            </Card>
          );
        })}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: { ...typography.headlineSmall, color: colors.onBackground },
  phaseChip: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  phaseChipText: { ...typography.labelSmall, color: colors.primary },
  timelineCard: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  timelineTitle: { ...typography.titleSmall, color: colors.onSurface, marginBottom: spacing.md },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineNode: { alignItems: 'center', flex: 1 },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
  },
  dotCompleted: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotFuture: { backgroundColor: colors.white, borderColor: colors.outlineVariant },
  dotCheck: { color: colors.white, fontSize: 12, fontWeight: '700' },
  dotNum: { ...typography.labelSmall, color: colors.onSurfaceVariant },
  dotNumActive: { color: colors.white },
  timelineLabel: { ...typography.labelSmall, color: colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' },
  timelineLabelActive: { color: colors.primary, fontWeight: '600' },
  timelineLabelFuture: { color: colors.outlineVariant },
  timelineConnector: {
    height: 2,
    flex: 0.3,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'flex-start',
    marginTop: 13,
  },
  connectorDone: { backgroundColor: colors.secondary },
  phaseCard: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  phaseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  phaseInfo: { flex: 1 },
  phaseTag: { ...typography.labelSmall, color: colors.secondary, marginBottom: 2 },
  phaseName: { ...typography.titleMedium, color: colors.onSurface },
  phaseFocus: { ...typography.bodySmall, color: colors.onSurfaceVariant },
  phaseProgressCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  phaseProgressPct: { ...typography.titleSmall, color: colors.primary },
  phaseProgressLabel: { ...typography.labelSmall, color: colors.onSurfaceVariant },
  phaseBar: {
    height: 6,
    backgroundColor: colors.outlineVariant,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  phaseFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.onBackground,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipScroll: { paddingLeft: spacing.md, marginBottom: spacing.sm },
  chip: { marginRight: spacing.sm },
  chartCard: { marginHorizontal: spacing.md },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  chartMetricName: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  chartValRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  chartCurrentVal: { ...typography.headlineSmall, color: colors.onSurface },
  chartUnit: { ...typography.bodySmall, color: colors.onSurfaceVariant, alignSelf: 'flex-end', marginBottom: 4 },
  changeTag: {
    marginLeft: spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'center',
  },
  changeTagText: { ...typography.labelSmall },
  chartBaseline: { alignItems: 'flex-end', gap: 2 },
  chartBaselineLabel: { ...typography.labelSmall, color: colors.onSurfaceVariant },
  chartBaselineVal: { ...typography.bodySmall, color: colors.onSurface },
  chartTargetVal: { ...typography.bodySmall, color: colors.secondary, fontWeight: '600' },
  chartArea: { marginTop: spacing.sm },
  monthCard: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  monthRow: { flexDirection: 'row', alignItems: 'center' },
  monthBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  monthBadgeText: { ...typography.titleSmall },
  monthInfo: { flex: 1 },
  monthName: { ...typography.titleSmall, color: colors.onSurface },
  monthFocus: { ...typography.bodySmall, color: colors.onSurfaceVariant },
  monthStatus: { marginLeft: spacing.sm },
  activePill: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  activePillText: { ...typography.labelSmall, color: colors.primary },
  doneCheck: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  activeMonthGoals: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  goalItem: { ...typography.bodySmall, color: colors.onSurfaceVariant, marginBottom: 2 },
  bottomPad: { height: spacing.xxl },
});
