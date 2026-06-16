import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import MiniBarChart from '../components/MiniBarChart';
import {
  colors,
  spacing,
  typography,
  radius,
} from '../theme';
import {
  TODAY_HABITS,
  TODAY_METRICS,
  MEMBER_PROFILE,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  HabitEntry,
} from '../data';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatusBadge({ status }: { status: 'good' | 'fair' | 'poor' }) {
  const config = {
    good: { bg: colors.successContainer, text: colors.success, label: 'Good' },
    fair: { bg: colors.warningContainer, text: colors.warning, label: 'Fair' },
    poor: { bg: colors.errorContainer, text: colors.error, label: 'Poor' },
  }[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

function TrendBadge({ trend, label }: { trend: 'up' | 'down' | 'stable'; label: string }) {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const color = trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.onSurfaceVariant;
  return (
    <Text style={[styles.trendText, { color }]}>
      {arrow} {label}
    </Text>
  );
}

export default function TodayScreen() {
  const [habits, setHabits] = useState<HabitEntry[]>(TODAY_HABITS);
  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const allDone = completedCount === totalCount;

  function toggleHabit(id: string) {
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {MEMBER_PROFILE.name.split(' ')[0]} 👋
            </Text>
            <Text style={styles.subGreeting}>Month {MEMBER_PROFILE.currentMonth} · Day 42 of 180</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakCount}>{MEMBER_PROFILE.streakDays}</Text>
          </View>
        </View>

        {/* Coach Banner */}
        <Card style={styles.coachCard} variant="elevated">
          <View style={styles.coachRow}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarText}>AR</Text>
            </View>
            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>{MEMBER_PROFILE.coach}</Text>
              <Text style={styles.coachNext}>Next session: {MEMBER_PROFILE.nextSession}</Text>
            </View>
            <TouchableOpacity style={styles.messageBtn} activeOpacity={0.8}>
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Daily Metrics */}
        <Text style={styles.sectionTitle}>Today's Stats</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
          {TODAY_METRICS.map(metric => (
            <Card key={metric.label} style={styles.metricCard} variant="elevated">
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <StatusBadge status={metric.status} />
              </View>
              <Text style={styles.metricValue}>
                {metric.value}
                <Text style={styles.metricUnit}> {metric.unit}</Text>
              </Text>
              <MiniBarChart
                data={metric.chartData}
                color={
                  metric.label === 'Steps'
                    ? colors.secondary
                    : metric.label === 'Sleep'
                    ? colors.primary
                    : colors.tertiary
                }
              />
              <TrendBadge trend={metric.trend} label={metric.trendLabel} />
            </Card>
          ))}
        </ScrollView>

        {/* Habits */}
        <View style={styles.habitHeader}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          <Text style={styles.habitCount}>
            {completedCount}/{totalCount}
          </Text>
        </View>

        {allDone && (
          <Card variant="filled" style={styles.allDoneBanner}>
            <Text style={styles.allDoneText}>🎉 All habits done! Amazing day, {MEMBER_PROFILE.name.split(' ')[0]}!</Text>
          </Card>
        )}

        {/* Habit Progress Bar */}
        <View style={styles.habitProgressBar}>
          <View
            style={[
              styles.habitProgressFill,
              { width: `${(completedCount / totalCount) * 100}%` },
            ]}
          />
        </View>

        <Card variant="outlined" style={styles.habitList} padding={0}>
          {habits.map((habit, index) => (
            <View
              key={habit.id}
              style={[
                styles.habitRow,
                index < habits.length - 1 && styles.habitDivider,
              ]}
            >
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: CATEGORY_COLORS[habit.category] + '20' },
                ]}
              >
                <Text style={styles.categoryEmoji}>{CATEGORY_ICONS[habit.category]}</Text>
              </View>
              <View style={styles.habitContent}>
                <Text
                  style={[
                    styles.habitName,
                    habit.completed && styles.habitNameDone,
                  ]}
                >
                  {habit.name}
                </Text>
                {habit.streak > 0 && (
                  <Text style={styles.habitStreak}>🔥 {habit.streak} day streak</Text>
                )}
              </View>
              <Switch
                value={habit.completed}
                onValueChange={() => toggleHabit(habit.id)}
                trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                thumbColor={habit.completed ? colors.primary : colors.outline}
              />
            </View>
          ))}
        </Card>

        {/* Daily Focus */}
        <Text style={styles.sectionTitle}>This Week's Focus</Text>
        <Card variant="elevated" style={styles.focusCard}>
          <View style={styles.focusTag}>
            <Text style={styles.focusTagText}>Month 2 · Foundation Building</Text>
          </View>
          <Text style={styles.focusTitle}>Build your protein & fibre habits</Text>
          <Text style={styles.focusBody}>
            Aim to include a protein source and vegetables in every main meal this week. Your gut microbiome will thank you.
          </Text>
          <View style={styles.focusProgress}>
            <Text style={styles.focusProgressLabel}>Week progress</Text>
            <View style={styles.focusProgressBar}>
              <View style={[styles.focusProgressFill, { width: '67%' }]} />
            </View>
            <Text style={styles.focusProgressPct}>67%</Text>
          </View>
        </Card>

        {/* Personal Insight */}
        <Card variant="filled" style={styles.insightCard}>
          <Text style={styles.insightTitle}>💡 Personal Pattern</Text>
          <Text style={styles.insightBody}>
            You sleep <Text style={styles.insightBold}>45 min longer</Text> on days you walk 7,000+ steps. You're on track for a great night!
          </Text>
        </Card>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  greeting: { ...typography.headlineSmall, color: colors.onBackground },
  subGreeting: { ...typography.bodyMedium, color: colors.onSurfaceVariant, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  streakEmoji: { fontSize: 16 },
  streakCount: { ...typography.titleMedium, color: colors.onTertiaryContainer, marginLeft: 4 },
  coachCard: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  coachRow: { flexDirection: 'row', alignItems: 'center' },
  coachAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachAvatarText: { ...typography.titleSmall, color: colors.primary },
  coachInfo: { flex: 1, marginLeft: spacing.sm },
  coachName: { ...typography.titleSmall, color: colors.onSurface },
  coachNext: { ...typography.bodySmall, color: colors.onSurfaceVariant },
  messageBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  messageBtnText: { ...typography.labelMedium, color: colors.onPrimary },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.onBackground,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  metricsScroll: { paddingLeft: spacing.md },
  metricCard: {
    width: 160,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  metricValue: { ...typography.headlineSmall, color: colors.onSurface },
  metricUnit: { ...typography.bodySmall, color: colors.onSurfaceVariant },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  badgeText: { ...typography.labelSmall },
  trendText: { ...typography.bodySmall, marginTop: spacing.xs },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  habitCount: { ...typography.titleMedium, color: colors.primary },
  habitProgressBar: {
    height: 4,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: spacing.md,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  habitProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  allDoneBanner: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  allDoneText: { ...typography.bodyMedium, color: colors.onSurface, textAlign: 'center' },
  habitList: { marginHorizontal: spacing.md },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  habitDivider: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  categoryDot: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  categoryEmoji: { fontSize: 18 },
  habitContent: { flex: 1 },
  habitName: { ...typography.bodyMedium, color: colors.onSurface },
  habitNameDone: { textDecorationLine: 'line-through', color: colors.onSurfaceVariant },
  habitStreak: { ...typography.bodySmall, color: colors.tertiary, marginTop: 2 },
  focusCard: { marginHorizontal: spacing.md, gap: spacing.sm },
  focusTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  focusTagText: { ...typography.labelSmall, color: colors.primary },
  focusTitle: { ...typography.titleMedium, color: colors.onSurface },
  focusBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  focusProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  focusProgressLabel: { ...typography.labelSmall, color: colors.onSurfaceVariant },
  focusProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.outlineVariant,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  focusProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  focusProgressPct: { ...typography.labelSmall, color: colors.primary },
  insightCard: { marginHorizontal: spacing.md, marginTop: spacing.md, gap: spacing.xs },
  insightTitle: { ...typography.titleSmall, color: colors.onSurface },
  insightBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  insightBold: { fontWeight: '700', color: colors.primary },
  bottomPad: { height: spacing.xxl },
});
