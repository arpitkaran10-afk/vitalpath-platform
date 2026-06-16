import React from 'react';
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
import { MEMBER_PROFILE, PROGRESS_METRICS } from '../data';

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingsRow({ icon, label, value, onPress, destructive }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.settingsIcon}>{icon}</Text>
      <Text style={[styles.settingsLabel, destructive && styles.destructiveText]}>{label}</Text>
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      {!destructive && <Text style={styles.settingsChevron}>›</Text>}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const weightMetric = PROGRESS_METRICS.find(m => m.key === 'weight');
  const glucoseMetric = PROGRESS_METRICS.find(m => m.key === 'glucose');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <View style={styles.heroSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {MEMBER_PROFILE.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text style={styles.heroName}>{MEMBER_PROFILE.name}</Text>
          <Text style={styles.heroEmail}>{MEMBER_PROFILE.email}</Text>
          <View style={styles.heroTagRow}>
            <View style={[styles.heroTag, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.heroTagText, { color: colors.primary }]}>
                Month {MEMBER_PROFILE.currentMonth}
              </Text>
            </View>
            <View style={[styles.heroTag, { backgroundColor: colors.warningContainer }]}>
              <Text style={[styles.heroTagText, { color: colors.warning }]}>
                {MEMBER_PROFILE.riskCategory.charAt(0).toUpperCase() + MEMBER_PROFILE.riskCategory.slice(1)} Risk
              </Text>
            </View>
          </View>
        </View>

        {/* Health Summary Cards */}
        <Text style={styles.sectionTitle}>Health Snapshot</Text>
        <View style={styles.snapshotRow}>
          {[
            { label: 'Streak', value: `${MEMBER_PROFILE.streakDays}d`, icon: '🔥', color: colors.tertiary, bg: colors.tertiaryContainer },
            { label: 'Weight lost', value: `${weightMetric?.change} kg`, icon: '⚖️', color: colors.success, bg: colors.successContainer },
            { label: 'Glucose', value: glucoseMetric?.current ?? '-', icon: '💉', color: colors.primary, bg: colors.primaryContainer },
            { label: 'Month', value: `${MEMBER_PROFILE.currentMonth}/6`, icon: '📅', color: colors.secondary, bg: colors.secondaryContainer },
          ].map(stat => (
            <View key={stat.label} style={[styles.snapshotCard, { backgroundColor: stat.bg }]}>
              <Text style={styles.snapshotIcon}>{stat.icon}</Text>
              <Text style={[styles.snapshotValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.snapshotLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Coach Card */}
        <Text style={styles.sectionTitle}>My Coach</Text>
        <Card variant="elevated" style={styles.coachCard}>
          <View style={styles.coachRow}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarText}>AN</Text>
            </View>
            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>{MEMBER_PROFILE.coach}</Text>
              <Text style={styles.coachRole}>Health & Nutrition Coach</Text>
              <Text style={styles.coachNext}>📅 {MEMBER_PROFILE.nextSession}</Text>
            </View>
          </View>
          <View style={styles.coachActions}>
            <TouchableOpacity style={styles.coachBtn} activeOpacity={0.8}>
              <Text style={styles.coachBtnText}>💬 Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.coachBtn, styles.coachBtnOutline]} activeOpacity={0.8}>
              <Text style={[styles.coachBtnText, styles.coachBtnOutlineText]}>📞 Schedule Call</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Programme Info */}
        <Text style={styles.sectionTitle}>Programme Details</Text>
        <Card variant="outlined" style={styles.settingsCard} padding={0}>
          <SettingsRow icon="📅" label="Start Date" value={MEMBER_PROFILE.startDate} />
          <View style={styles.rowDivider} />
          <SettingsRow icon="🎯" label="Risk Category" value={MEMBER_PROFILE.riskCategory} />
          <View style={styles.rowDivider} />
          <SettingsRow icon="📊" label="Programme Progress" value={`${MEMBER_PROFILE.completionPercent}%`} />
          <View style={styles.rowDivider} />
          <SettingsRow icon="📁" label="Health Files" />
        </Card>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card variant="outlined" style={styles.settingsCard} padding={0}>
          <SettingsRow icon="👤" label="Edit Profile" />
          <View style={styles.rowDivider} />
          <SettingsRow icon="🔔" label="Notifications" />
          <View style={styles.rowDivider} />
          <SettingsRow icon="🔒" label="Privacy & Security" />
          <View style={styles.rowDivider} />
          <SettingsRow icon="❓" label="Help & Support" />
        </Card>

        <Card variant="outlined" style={StyleSheet.flatten([styles.settingsCard, { marginTop: spacing.md }])} padding={0}>
          <SettingsRow icon="🚪" label="Sign Out" destructive />
        </Card>

        {/* App version */}
        <Text style={styles.versionText}>VitalPath v1.0.0</Text>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarLargeText: { ...typography.headlineSmall, color: colors.primary },
  heroName: { ...typography.headlineSmall, color: colors.onBackground },
  heroEmail: { ...typography.bodyMedium, color: colors.onSurfaceVariant, marginTop: 2 },
  heroTagRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  heroTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  heroTagText: { ...typography.labelSmall },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.onBackground,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  snapshotRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  snapshotCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  snapshotIcon: { fontSize: 20, marginBottom: 4 },
  snapshotValue: { ...typography.titleMedium },
  snapshotLabel: { ...typography.labelSmall, color: colors.onSurfaceVariant, marginTop: 2 },
  coachCard: { marginHorizontal: spacing.md, gap: spacing.md },
  coachRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  coachAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachAvatarText: { ...typography.titleMedium, color: colors.secondary },
  coachInfo: { flex: 1 },
  coachName: { ...typography.titleSmall, color: colors.onSurface },
  coachRole: { ...typography.bodySmall, color: colors.onSurfaceVariant },
  coachNext: { ...typography.bodySmall, color: colors.primary, marginTop: 2 },
  coachActions: { flexDirection: 'row', gap: spacing.sm },
  coachBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  coachBtnOutline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  coachBtnText: { ...typography.labelMedium, color: colors.white },
  coachBtnOutlineText: { color: colors.primary },
  settingsCard: { marginHorizontal: spacing.md },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  settingsIcon: { fontSize: 18, marginRight: spacing.md },
  settingsLabel: { ...typography.bodyMedium, color: colors.onSurface, flex: 1 },
  settingsValue: { ...typography.bodyMedium, color: colors.onSurfaceVariant, marginRight: spacing.xs },
  settingsChevron: { color: colors.onSurfaceVariant, fontSize: 18 },
  destructiveText: { color: colors.error },
  rowDivider: { height: 1, backgroundColor: colors.outlineVariant, marginLeft: spacing.md + 18 + spacing.md },
  versionText: { ...typography.bodySmall, color: colors.outlineVariant, textAlign: 'center', marginTop: spacing.xl },
  bottomPad: { height: spacing.xxl },
});
