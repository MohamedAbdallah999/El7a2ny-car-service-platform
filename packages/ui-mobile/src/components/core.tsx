import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { colors, layout, radii, spacing, typography } from "../theme.js";

export type ButtonVariant =
  "primary" | "secondary" | "dark" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<
  PressableProps,
  "children" | "style"
> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  children,
  disabled,
  fullWidth,
  leadingIcon,
  loading,
  size = "md",
  style,
  trailingIcon,
  variant = "primary",
  ...props
}: ButtonProps) {
  const foreground =
    variant === "primary" || variant === "dark"
      ? colors.surface
      : variant === "destructive"
        ? colors.errorText
        : colors.textPrimary;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} size="small" />
      ) : leadingIcon ? (
        <View accessibilityElementsHidden>{leadingIcon}</View>
      ) : null}
      <Text style={[styles.buttonText, { color: foreground }]}>{children}</Text>
      {!loading && trailingIcon ? (
        <View accessibilityElementsHidden>{trailingIcon}</View>
      ) : null}
    </Pressable>
  );
}

export interface IconButtonProps extends Omit<PressableProps, "children"> {
  icon: ReactNode;
  label: string;
  badge?: number;
  variant?: "light" | "dark";
}

export function IconButton({
  badge,
  icon,
  label,
  variant = "light",
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconButton,
        variant === "dark" && styles.iconButtonDark,
        pressed && styles.pressed,
      ]}
    >
      <View accessibilityElementsHidden>{icon}</View>
      {badge ? (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>
            {badge > 99 ? "99+" : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export type BadgeVariant =
  "default" | "success" | "warning" | "error" | "info" | "muted" | "dark";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <View style={[styles.badge, badgeVariants[variant]]}>
      <Text style={[styles.badgeText, badgeTextVariants[variant]]}>
        {children}
      </Text>
    </View>
  );
}

const statusVariants: Record<string, BadgeVariant> = {
  upcoming: "info",
  confirmed: "success",
  scheduled: "info",
  "in progress": "warning",
  completed: "success",
  cancelled: "error",
  open: "success",
  closed: "muted",
  active: "success",
  suspended: "error",
  inactive: "muted",
  pending: "warning",
  accepted: "success",
  preparing: "warning",
  shipped: "info",
  delivered: "success",
  failed: "error",
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.trim().toLowerCase().replace(/[-_]+/g, " ");
  return (
    <Badge variant={statusVariants[normalized] ?? "default"}>{status}</Badge>
  );
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[styles.avatar, avatarSizes[size]]}
    >
      <Text
        style={[styles.avatarText, size === "lg" && styles.avatarTextLarge]}
      >
        {initials || "?"}
      </Text>
    </View>
  );
}

export function InitialsTile({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      style={styles.initialsTile}
    >
      <Text style={styles.avatarText}>{initials || "?"}</Text>
    </View>
  );
}

export function StarRating({
  value,
  count,
}: {
  value: number;
  count?: number;
}) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <View
      accessible
      accessibilityLabel={`${value} out of 5 stars${count === undefined ? "" : `, ${count} reviews`}`}
      style={styles.rating}
    >
      <Text style={styles.stars} accessibilityElementsHidden>
        {"★".repeat(rounded)}
        {"☆".repeat(5 - rounded)}
      </Text>
      <Text style={styles.ratingValue}>{value.toFixed(1)}</Text>
      {count === undefined ? null : (
        <Text style={styles.mutedText}>({count})</Text>
      )}
    </View>
  );
}

export function Divider() {
  return <View accessibilityRole="none" style={styles.divider} />;
}

export interface CardProps {
  children: ReactNode;
  variant?: "light" | "dark";
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style, variant = "light" }: CardProps) {
  return (
    <View style={[styles.card, variant === "dark" && styles.cardDark, style]}>
      {children}
    </View>
  );
}

export interface ChipProps extends Omit<PressableProps, "children"> {
  children: ReactNode;
  selected?: boolean;
}

export function Chip({ children, selected, ...props }: ChipProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: props.disabled }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
        props.disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.touchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.two,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.four,
  },
  fullWidth: { width: "100%" },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  buttonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  iconButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
  },
  iconButtonDark: {
    borderColor: colors.darkDivider,
    backgroundColor: colors.darkSurface,
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  notificationBadgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
  },
  badge: {
    minHeight: 24,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.two,
    borderWidth: 1,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  avatarTextLarge: { fontSize: typography.fontSizes.md },
  initialsTile: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  rating: { flexDirection: "row", alignItems: "center", gap: spacing.one },
  stars: { color: colors.rating, fontSize: typography.fontSizes.sm },
  ratingValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  mutedText: { color: colors.textMuted, fontSize: typography.fontSizes.xs },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  card: {
    padding: spacing.four,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  cardDark: {
    borderColor: colors.darkDivider,
    backgroundColor: colors.darkSurface,
  },
  chip: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.three,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
  },
  chipSelected: { backgroundColor: colors.primary },
  chipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  chipTextSelected: { color: colors.surface },
});

const buttonVariants = StyleSheet.create({
  primary: { borderColor: colors.primary, backgroundColor: colors.primary },
  secondary: { borderColor: colors.border, backgroundColor: colors.surface },
  dark: {
    borderColor: colors.darkSurface,
    backgroundColor: colors.darkSurface,
  },
  ghost: { borderColor: "transparent", backgroundColor: "transparent" },
  destructive: {
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorBackground,
  },
});

const buttonSizes = StyleSheet.create({
  sm: { minHeight: 36, paddingHorizontal: spacing.three },
  md: { minHeight: layout.touchTarget, paddingHorizontal: spacing.four },
  lg: { minHeight: 52, paddingHorizontal: spacing.six },
});

const badgeVariants = StyleSheet.create({
  default: { borderColor: colors.border, backgroundColor: colors.surfaceMuted },
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
  muted: { borderColor: colors.border, backgroundColor: colors.surfaceSubtle },
  dark: { borderColor: colors.darkSubtle, backgroundColor: colors.darkSurface },
});

const badgeTextVariants = StyleSheet.create({
  default: { color: colors.textSecondary },
  success: { color: colors.successText },
  warning: { color: colors.warningText },
  error: { color: colors.errorText },
  info: { color: colors.infoText },
  muted: { color: colors.textMuted },
  dark: { color: colors.surface },
});

const avatarSizes = StyleSheet.create({
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 56, height: 56 },
});
