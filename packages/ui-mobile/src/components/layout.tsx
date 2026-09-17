import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { ScrollViewProps, StyleProp, ViewStyle } from "react-native";
import { colors, radii, spacing, typography } from "../theme.js";

export interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  contentStyle,
  padded = true,
  ...props
}: ScreenProps) {
  return (
    <ScrollView
      {...props}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.screen,
        padded && styles.padded,
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}

export function DarkHeader({ children }: { children: ReactNode }) {
  return <View style={styles.darkHeader}>{children}</View>;
}

export function AuthHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.authHero}>
      {eyebrow ? <Text style={styles.authEyebrow}>{eyebrow}</Text> : null}
      <Text accessibilityRole="header" style={styles.authTitle}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.authDescription}>{description}</Text>
      ) : null}
      {children}
    </View>
  );
}

export function StepDots({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`Step ${current} of ${total}`}
      style={styles.stepDots}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index + 1 === current && styles.stepDotActive,
          ]}
        />
      ))}
    </View>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  meta,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  meta?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
      </View>
      {actionLabel ? (
        <Text
          accessibilityRole="button"
          onPress={onAction}
          style={styles.sectionAction}
        >
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

export function StatGrid({
  items,
  columns = 2,
  dark,
}: {
  items: ReadonlyArray<{ label: string; value: ReactNode }>;
  columns?: 2 | 3;
  dark?: boolean;
}) {
  return (
    <View style={styles.statGrid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[
            styles.stat,
            columns === 3 ? styles.statThree : styles.statTwo,
          ]}
        >
          <Text style={[styles.statValue, dark && styles.lightText]}>
            {item.value}
          </Text>
          <Text style={[styles.statLabel, dark && styles.darkMuted]}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: colors.background },
  padded: { padding: spacing.four },
  darkHeader: { padding: spacing.four, backgroundColor: colors.textPrimary },
  authHero: {
    gap: spacing.two,
    padding: spacing.six,
    backgroundColor: colors.textPrimary,
  },
  authEyebrow: {
    color: colors.primary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  authTitle: {
    color: colors.surface,
    fontSize: typography.fontSizes.threeXl,
    fontWeight: typography.fontWeights.black,
  },
  authDescription: {
    color: colors.darkMuted,
    fontSize: typography.fontSizes.sm,
    lineHeight: 22,
  },
  stepDots: { flexDirection: "row", gap: spacing.two },
  stepDot: {
    width: spacing.two,
    height: spacing.two,
    borderRadius: radii.full,
    backgroundColor: colors.borderStrong,
  },
  stepDotActive: { width: spacing.six, backgroundColor: colors.primary },
  sectionHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.four,
  },
  sectionTitleRow: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.two,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionMeta: {
    color: colors.primary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  sectionAction: {
    color: colors.primary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  statGrid: { flexDirection: "row", flexWrap: "wrap" },
  stat: { padding: spacing.three },
  statTwo: { width: "50%" },
  statThree: { width: "33.333%" },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.black,
  },
  statLabel: {
    marginTop: spacing.one,
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
  },
  lightText: { color: colors.surface },
  darkMuted: { color: colors.darkMuted },
});
