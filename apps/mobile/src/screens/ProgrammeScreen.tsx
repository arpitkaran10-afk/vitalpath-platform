import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import { colors, spacing, typography, radius } from '../theme';
import { PROGRAMME_PHASES, MEMBER_PROFILE, ProgrammePhase } from '../data';

function PhaseDetailCard({ phase, isActive, isLocked }: { phase: ProgrammePhase; isActive: boolean; isLocked: boolean }) {
  const [expanded, setExpanded] = useState(isActive);
  return (
    <Card
      variant={isActive ? 'elevated' : isLocked ? 'filled' : 'outlined'}
      style={[styles.phaseCard, isActive ? styles.activePhaseCard : undefined]}
    >
      <TouchableOpacity onPress={() => !isLocked && setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={styles.phaseCardHeader}>
          <View
            style={[
              styles.monthCircle,
              isActive && styles.monthCircleActive,
              isLocked && styles.monthCircleLocked,
            ]}
          >
            {isLocked ? (
              <Text style={styles.lockIcon}>🔒</Text>
            ) : (
              <Text style={[styles.monthNum, isActive && styles.monthNumActive]}>
                {phase.month}
              </Text>
            )}
          </View>
          <View style={styles.phaseHeaderText}>
            <View style={styles.phaseTagRow}>
              {isActive && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>Active</Text>
                </View>
              )}
              {!isActive && !isLocked && (
                <View style={styles.completedTag}>
                  <Text style={styles.completedTagText}>Completed</Text>
                </View>
              )}
              {isLocked && (
                <Text style={styles.lockedDate}>
                  Unlocks Month {phase.month - 1} completion
                </Text>
              )}
            </View>
            <Text style={[styles.phaseName, isLocked && styles.phaseNameLocked]}>
              {phase.name}
            </Text>
            <Text style={[styles.phaseFocus, isLocked && styles.phaseNameLocked]}>
              {phase.focus}
            </Text>
          </View>
          {!isLocked && (
            <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
          )}
        </View>
      </TouchableOpacity>

      {expanded && !isLocked && (
        <View style={styles.phaseDetail}>
          <Text style={styles.phaseDescription}>{phase.description}</Text>

          <Text style={styles.detailSection}>Key Interventions</Text>
          {phase.keyInterventions.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}

          <Text style={styles.detailSection}>Goals</Text>
          {phase.goals.map((goal, i) => (
            <View key={i} style={styles.goalRow}>
              <Text style={styles.goalCheck}>
                {phase.month < MEMBER_PROFILE.currentMonth ? '✓' : '○'}
              </Text>
              <Text
                style={[
                  styles.goalText,
                  phase.month < MEMBER_PROFILE.currentMonth && styles.goalDone,
                ]}
              >
                {goal}
              </Text>
            </View>
          ))}

          <Text style={styles.detailSection}>Expected Outcomes</Text>
          {phase.outcomes.map((o, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.outcomeStar}>★</Text>
              <Text style={styles.bulletText}>{o}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

export default function ProgrammeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Programme</Text>
          <Text style={styles.subtitle}>Your 6-month health journey</Text>
        </View>

        {/* Overview Banner */}
        <Card variant="elevated" style={styles.overviewCard}>
          <Text style={styles.overviewLabel}>VitalPath · 6-Month Plan</Text>
          <Text style={styles.overviewMonth}>Month {MEMBER_PROFILE.currentMonth} of 6</Text>
          <View style={styles.overviewBar}>
            <View
              style={[
                styles.overviewFill,
                { width: `${((MEMBER_PROFILE.currentMonth - 1 + MEMBER_PROFILE.completionPercent / 100) / 6) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatVal}>{MEMBER_PROFILE.streakDays}</Text>
              <Text style={styles.overviewStatLabel}>Day Streak</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatVal}>{MEMBER_PROFILE.completionPercent}%</Text>
              <Text style={styles.overviewStatLabel}>This Month</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatVal}>{6 - MEMBER_PROFILE.currentMonth}</Text>
              <Text style={styles.overviewStatLabel}>Months Left</Text>
            </View>
          </View>
        </Card>

        {/* Phase Cards */}
        {PROGRAMME_PHASES.map(phase => {
          const isCompleted = phase.month < MEMBER_PROFILE.currentMonth;
          const isActive = phase.month === MEMBER_PROFILE.currentMonth;
          const isLocked = phase.month > MEMBER_PROFILE.currentMonth;
          return (
            <PhaseDetailCard
              key={phase.month}
              phase={phase}
              isActive={isActive}
              isLocked={isLocked}
            />
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
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  title: { ...typography.headlineSmall, color: colors.onBackground },
  subtitle: { ...typography.bodyMedium, color: colors.onSurfaceVariant, marginTop: 2 },
  overviewCard: { marginHorizontal: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  overviewLabel: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  overviewMonth: { ...typography.headlineMedium, color: colors.primary },
  overviewBar: {
    height: 8,
    backgroundColor: colors.outlineVariant,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  overviewFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  overviewStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.xs },
  overviewStat: { alignItems: 'center' },
  overviewStatVal: { ...typography.titleLarge, color: colors.primary },
  overviewStatLabel: { ...typography.labelSmall, color: colors.onSurfaceVariant },
  overviewDivider: { width: 1, backgroundColor: colors.outlineVariant },
  phaseCard: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  activePhaseCard: { borderWidth: 1.5, borderColor: colors.primary },
  phaseCardHeader: { flexDirection: 'row', alignItems: 'center' },
  monthCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  monthCircleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  monthCircleLocked: { backgroundColor: colors.surfaceVariant, borderColor: colors.outlineVariant },
  lockIcon: { fontSize: 16 },
  monthNum: { ...typography.titleSmall, color: colors.onSurfaceVariant },
  monthNumActive: { color: colors.white },
  phaseHeaderText: { flex: 1 },
  phaseTagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  activeTag: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  activeTagText: { ...typography.labelSmall, color: colors.primary },
  completedTag: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  completedTagText: { ...typography.labelSmall, color: colors.secondary },
  lockedDate: { ...typography.labelSmall, color: colors.outlineVariant },
  phaseName: { ...typography.titleSmall, color: colors.onSurface },
  phaseFocus: { ...typography.bodySmall, color: colors.onSurfaceVariant },
  phaseNameLocked: { color: colors.outlineVariant },
  chevron: { color: colors.onSurfaceVariant, fontSize: 12 },
  phaseDetail: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    gap: spacing.xs,
  },
  phaseDescription: { ...typography.bodyMedium, color: colors.onSurfaceVariant, marginBottom: spacing.sm },
  detailSection: { ...typography.labelMedium, color: colors.onSurfaceVariant, marginTop: spacing.sm, marginBottom: spacing.xs },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: 2 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 7 },
  bulletText: { ...typography.bodySmall, color: colors.onSurface, flex: 1 },
  outcomeStar: { color: colors.tertiary, fontSize: 12, marginTop: 2 },
  goalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: 2 },
  goalCheck: { color: colors.secondary, fontWeight: '700', fontSize: 14, marginTop: 1 },
  goalText: { ...typography.bodySmall, color: colors.onSurface, flex: 1 },
  goalDone: { textDecorationLine: 'line-through', color: colors.onSurfaceVariant },
  bottomPad: { height: spacing.xxl },
});
