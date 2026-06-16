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
import Chip from '../components/Chip';
import { colors, spacing, typography, radius } from '../theme';
import { COMMUNITY_STORIES, StoryMember } from '../data';

const FILTERS = ['All', 'Month 1', 'Month 2', 'Month 3+', 'Similar to me'];

function StoryCard({ story }: { story: StoryMember }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card variant="elevated" style={styles.storyCard}>
      {/* Avatar + Name */}
      <View style={styles.storyHeader}>
        <View style={[styles.avatar, { backgroundColor: story.color + '20' }]}>
          <Text style={[styles.avatarText, { color: story.color }]}>{story.initials}</Text>
        </View>
        <View style={styles.storyMeta}>
          <Text style={styles.storyName}>{story.name}</Text>
          <View style={styles.storyTagRow}>
            <View style={[styles.storyMonthTag, { backgroundColor: story.color + '15' }]}>
              <Text style={[styles.storyMonthText, { color: story.color }]}>
                Month {story.month}
              </Text>
            </View>
            <Text style={styles.storyAge}>{story.age} yrs</Text>
          </View>
        </View>
      </View>

      {/* Headline */}
      <Text style={styles.storyHeadline}>{story.headline}</Text>

      {/* Outcome pills */}
      <View style={styles.outcomesRow}>
        {story.outcomes.map((o, i) => (
          <View key={i} style={styles.outcomePill}>
            <Text style={styles.outcomePillText}>{o}</Text>
          </View>
        ))}
      </View>

      {/* Body */}
      {expanded && (
        <Text style={styles.storyBody}>{story.body}</Text>
      )}

      {/* Expand/collapse */}
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.expandBtn} activeOpacity={0.7}>
        <Text style={styles.expandBtnText}>{expanded ? 'Show less ▲' : 'Read their story ▼'}</Text>
      </TouchableOpacity>
    </Card>
  );
}

export default function CommunityScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = COMMUNITY_STORIES.filter(s => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Month 1') return s.month === 1;
    if (activeFilter === 'Month 2') return s.month === 2;
    if (activeFilter === 'Month 3+') return s.month >= 3;
    if (activeFilter === 'Similar to me') return s.month === 2;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Real stories from 847 members</Text>
        </View>

        {/* Cohort Banner */}
        <Card variant="filled" style={styles.cohortBanner}>
          <Text style={styles.cohortEmoji}>🌟</Text>
          <View style={styles.cohortText}>
            <Text style={styles.cohortTitle}>You're in good company</Text>
            <Text style={styles.cohortBody}>
              847 members are currently on Month 2 alongside you. Together, your cohort has collectively walked <Text style={styles.cohortBold}>2.3 million steps</Text> this week.
            </Text>
          </View>
        </Card>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map(f => (
            <Chip
              key={f}
              label={f}
              selected={activeFilter === f}
              onPress={() => setActiveFilter(f)}
              style={styles.filterChip}
            />
          ))}
        </ScrollView>

        {/* Stories */}
        <Text style={styles.resultsLabel}>
          {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
        </Text>

        {filtered.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}

        {filtered.length === 0 && (
          <Card variant="filled" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No stories for this filter yet.</Text>
          </Card>
        )}

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
  cohortBanner: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cohortEmoji: { fontSize: 24, marginTop: 2 },
  cohortText: { flex: 1 },
  cohortTitle: { ...typography.titleSmall, color: colors.onSurface },
  cohortBody: { ...typography.bodySmall, color: colors.onSurfaceVariant, marginTop: 2 },
  cohortBold: { fontWeight: '700', color: colors.primary },
  filterScroll: { paddingLeft: spacing.md, marginBottom: spacing.sm },
  filterChip: { marginRight: spacing.sm },
  resultsLabel: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  storyCard: { marginHorizontal: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  storyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.titleMedium, fontWeight: '700' },
  storyMeta: { flex: 1 },
  storyName: { ...typography.titleSmall, color: colors.onSurface },
  storyTagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  storyMonthTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  storyMonthText: { ...typography.labelSmall },
  storyAge: { ...typography.bodySmall, color: colors.onSurfaceVariant },
  storyHeadline: { ...typography.titleSmall, color: colors.onSurface, lineHeight: 20 },
  outcomesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  outcomePill: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  outcomePillText: { ...typography.labelSmall, color: colors.onSecondaryContainer },
  storyBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant, lineHeight: 22 },
  expandBtn: { alignSelf: 'flex-start', paddingTop: spacing.xs },
  expandBtnText: { ...typography.labelMedium, color: colors.primary },
  emptyCard: { marginHorizontal: spacing.md, alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  bottomPad: { height: spacing.xxl },
});
