import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../theme.js";

export type AlertVariant = "success" | "warning" | "error" | "info";

export function Alert({
  children,
  variant = "info",
  icon,
}: {
  children: ReactNode;
  variant?: AlertVariant;
  icon?: ReactNode;
}) {
  return (
    <View
      accessibilityRole={variant === "error" ? "alert" : "summary"}
      style={[styles.alert, alertVariants[variant]]}
    >
      {icon ? <View accessibilityElementsHidden>{icon}</View> : null}
      <Text style={[styles.alertText, alertTextVariants[variant]]}>
        {children}
      </Text>
    </View>
  );
}

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? "Progress"}
      accessibilityValue={{ min: 0, max: 100, now: normalized }}
      style={styles.progressTrack}
    >
      <View style={[styles.progressValue, { width: `${normalized}%` }]} />
    </View>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <View accessible accessibilityLabel={label} style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.stateDescription}>{label}</Text>
    </View>
  );
}

interface StateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

function StateView({ action, description, icon, title }: StateProps) {
  return (
    <View style={styles.state}>
      {icon ? <View style={styles.stateIcon}>{icon}</View> : null}
      <Text accessibilityRole="header" style={styles.stateTitle}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.stateDescription}>{description}</Text>
      ) : null}
      {action ? <View style={styles.stateAction}>{action}</View> : null}
    </View>
  );
}

export const EmptyState = StateView;
export const ErrorState = StateView;

export function SuccessState(props: StateProps) {
  return (
    <View accessibilityRole="summary">
      <StateView
        {...props}
        icon={props.icon ?? <Text style={styles.check}>✓</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.two,
    padding: spacing.three,
    borderWidth: 1,
    borderRadius: radii.xl,
  },
  alertText: {
    minWidth: 0,
    flex: 1,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  progressTrack: {
    height: 6,
    overflow: "hidden",
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
  },
  progressValue: {
    height: "100%",
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.two,
    padding: spacing.six,
  },
  state: { alignItems: "center", padding: spacing.eight },
  stateIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.four,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
  },
  stateTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.black,
    textAlign: "center",
  },
  stateDescription: {
    marginTop: spacing.two,
    color: colors.textTertiary,
    fontSize: typography.fontSizes.sm,
    lineHeight: 22,
    textAlign: "center",
  },
  stateAction: { width: "100%", marginTop: spacing.five },
  check: {
    color: colors.successText,
    fontSize: typography.fontSizes.twoXl,
    fontWeight: typography.fontWeights.black,
  },
});

const alertVariants = StyleSheet.create({
  success: {
    borderColor: colors.successBorder,
    backgroundColor: colors.successBackground,
  },
  warning: {
    borderColor: colors.warningBorder,
    backgroundColor: colors.warningBackground,
  },
  error: {
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorBackground,
  },
  info: {
    borderColor: colors.infoBorder,
    backgroundColor: colors.infoBackground,
  },
});

const alertTextVariants = StyleSheet.create({
  success: { color: colors.successText },
  warning: { color: colors.warningText },
  error: { color: colors.errorText },
  info: { color: colors.infoText },
});
