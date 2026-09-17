import type { ReactNode } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import { colors, layout, radii, spacing, typography } from "../theme.js";
import { Avatar, Badge, StarRating } from "./core.js";
import { ProgressBar } from "./feedback.js";
import { StatGrid } from "./layout.js";

export function BookingWizardHeader({
  currentStep,
  totalSteps = 5,
  title,
  backAction,
}: {
  currentStep: number;
  totalSteps?: number;
  title: string;
  backAction: ReactNode;
}) {
  const safeStep = Math.max(1, Math.min(currentStep, totalSteps));
  return (
    <View style={styles.wizardHeader}>
      <View style={styles.wizardRow}>
        {backAction}
        <View style={styles.flex}>
          <Text style={styles.stepLabel}>
            Step {safeStep} of {totalSteps}
          </Text>
          <Text accessibilityRole="header" style={styles.headerTitle}>
            {title}
          </Text>
        </View>
      </View>
      <ProgressBar
        value={(safeStep / totalSteps) * 100}
        label="Booking progress"
      />
    </View>
  );
}

export interface CalendarDay {
  key: string;
  label: string;
  disabled?: boolean;
}

export function DatePicker({
  monthLabel,
  days,
  selectedKey,
  onSelect,
}: {
  monthLabel: string;
  days: ReadonlyArray<CalendarDay>;
  selectedKey?: string;
  onSelect: (key: string) => void;
}) {
  return (
    <View accessibilityRole="adjustable" accessibilityLabel={monthLabel}>
      <Text style={styles.calendarTitle}>{monthLabel}</Text>
      <View style={styles.weekdays}>
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {days.map((day) => {
          const selected = day.key === selectedKey;
          return (
            <Pressable
              key={day.key}
              accessibilityRole="button"
              accessibilityLabel={`${monthLabel} ${day.label}`}
              accessibilityState={{ selected, disabled: day.disabled }}
              disabled={day.disabled}
              onPress={() => onSelect(day.key)}
              style={({ pressed }) => [
                styles.calendarDay,
                selected && styles.selected,
                pressed && styles.pressed,
                day.disabled && styles.disabled,
              ]}
            >
              <Text style={[styles.dayText, selected && styles.selectedText]}>
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export interface TimeSlot {
  value: string;
  label: string;
  disabled?: boolean;
}

export function TimeSlotGrid({
  slots,
  value,
  onChange,
  label,
}: {
  slots: ReadonlyArray<TimeSlot>;
  value?: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={styles.timeGrid}
    >
      {slots.map((slot) => {
        const selected = slot.value === value;
        return (
          <Pressable
            key={slot.value}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: slot.disabled }}
            disabled={slot.disabled}
            onPress={() => onChange(slot.value)}
            style={[
              styles.timeSlot,
              selected && styles.selected,
              slot.disabled && styles.slotDisabled,
            ]}
          >
            <Text style={[styles.timeText, selected && styles.selectedText]}>
              {slot.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ShopDetailHero({
  image,
  name,
  status,
  verified,
  rating,
  reviewCount,
  distance,
  backAction,
}: {
  image: ImageSourcePropType;
  name: string;
  status: string;
  verified?: boolean;
  rating: number;
  reviewCount?: number;
  distance: string;
  backAction: ReactNode;
}) {
  return (
    <ImageBackground
      source={image}
      accessibilityLabel={name}
      style={styles.hero}
    >
      <View style={styles.heroOverlay} />
      <View style={styles.heroTop}>{backAction}</View>
      <View style={styles.heroContent}>
        <View style={styles.badges}>
          <Badge
            variant={status.toLowerCase() === "open" ? "success" : "muted"}
          >
            {status}
          </Badge>
          {verified ? <Badge variant="info">✓ Verified</Badge> : null}
        </View>
        <Text accessibilityRole="header" style={styles.heroTitle}>
          {name}
        </Text>
        <View style={styles.heroMeta}>
          <StarRating value={rating} count={reviewCount} />
          <Text style={styles.heroDistance}>{distance}</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

export function ProfileHeader({
  name,
  email,
  subtitle,
  stats,
}: {
  name: string;
  email: string;
  subtitle?: string;
  stats: ReadonlyArray<{ label: string; value: ReactNode }>;
}) {
  return (
    <View style={styles.profileHeader}>
      <Avatar name={name} size="lg" />
      <Text style={styles.profileName}>{name}</Text>
      <Text style={styles.profileMeta}>{email}</Text>
      {subtitle ? <Text style={styles.profileMeta}>{subtitle}</Text> : null}
      <StatGrid items={stats} columns={3} dark />
    </View>
  );
}

export function MenuRow({
  label,
  description,
  icon,
  onPress,
  destructive,
  showChevron = true,
}: {
  label: string;
  description?: string;
  icon?: ReactNode;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.menuRow}
    >
      {icon ? <View accessibilityElementsHidden>{icon}</View> : null}
      <View style={styles.flex}>
        <Text style={[styles.menuLabel, destructive && styles.destructive]}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.menuDescription}>{description}</Text>
        ) : null}
      </View>
      {showChevron ? (
        <Text accessibilityElementsHidden style={styles.chevron}>
          ›
        </Text>
      ) : null}
    </Pressable>
  );
}

export function CarCard({
  image,
  name,
  year,
  metadata,
  actions,
}: {
  image: ImageSourcePropType;
  name: string;
  year: string;
  metadata: string;
  actions?: ReactNode;
}) {
  return (
    <View style={styles.carCard}>
      <Image source={image} accessibilityLabel={name} style={styles.carImage} />
      <View style={styles.carContent}>
        <Text style={styles.headerTitle}>{name}</Text>
        <Text style={styles.menuDescription}>{year}</Text>
        <Text style={styles.menuDescription}>{metadata}</Text>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    </View>
  );
}

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
}

export function ReviewPanel({
  rating,
  reviewCount,
  distribution,
  reviews,
}: {
  rating: number;
  reviewCount: number;
  distribution: ReadonlyArray<{ stars: number; percentage: number }>;
  reviews: ReadonlyArray<ReviewItem>;
}) {
  return (
    <View style={styles.reviews}>
      <StarRating value={rating} count={reviewCount} />
      {distribution.map((item) => (
        <View key={item.stars} style={styles.ratingRow}>
          <Text style={styles.stepLabel}>{item.stars}★</Text>
          <View style={styles.ratingTrack}>
            <View
              style={[styles.ratingFill, { width: `${item.percentage}%` }]}
            />
          </View>
        </View>
      ))}
      {reviews.map((review) => (
        <View key={review.id} style={styles.review}>
          <Avatar name={review.name} size="sm" />
          <View style={styles.flex}>
            <Text style={styles.menuLabel}>{review.name}</Text>
            <StarRating value={review.rating} />
            <Text style={styles.menuDescription}>{review.comment}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { minWidth: 0, flex: 1 },
  wizardHeader: {
    gap: spacing.three,
    padding: spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  wizardRow: { flexDirection: "row", alignItems: "center", gap: spacing.three },
  stepLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.black,
  },
  calendarTitle: {
    marginBottom: spacing.four,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  weekdays: { flexDirection: "row" },
  weekday: {
    width: "14.285%",
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.two,
  },
  calendarDay: {
    width: "14.285%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.full,
  },
  dayText: { color: colors.textPrimary, fontSize: typography.fontSizes.sm },
  selected: { backgroundColor: colors.primary },
  selectedText: { color: colors.surface },
  disabled: { opacity: 0.3 },
  pressed: { backgroundColor: colors.surfaceSubtle },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.two },
  timeSlot: {
    width: "31%",
    minHeight: layout.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  slotDisabled: {
    borderColor: colors.surfaceHover,
    backgroundColor: colors.surfaceHover,
    opacity: 0.5,
  },
  timeText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  hero: { height: 192, justifyContent: "space-between" },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  heroTop: { padding: spacing.four },
  heroContent: { padding: spacing.four },
  badges: { flexDirection: "row", gap: spacing.two },
  heroTitle: {
    marginTop: spacing.two,
    color: colors.surface,
    fontSize: typography.fontSizes.twoXl,
    fontWeight: typography.fontWeights.black,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.three,
    marginTop: spacing.two,
  },
  heroDistance: { color: colors.surface, fontSize: typography.fontSizes.xs },
  profileHeader: {
    alignItems: "center",
    padding: spacing.six,
    backgroundColor: colors.textPrimary,
  },
  profileName: {
    marginTop: spacing.three,
    color: colors.surface,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.black,
  },
  profileMeta: {
    marginTop: spacing.one,
    color: colors.darkMuted,
    fontSize: typography.fontSizes.xs,
  },
  menuRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.three,
    paddingHorizontal: spacing.four,
    paddingVertical: spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  menuLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  menuDescription: {
    marginTop: spacing.one,
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
  },
  destructive: { color: colors.errorText },
  chevron: { color: colors.placeholder, fontSize: typography.fontSizes.xl },
  carCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  carImage: { width: "100%", height: 176 },
  carContent: { padding: spacing.four },
  actions: { flexDirection: "row", gap: spacing.two, marginTop: spacing.four },
  reviews: { gap: spacing.four, padding: spacing.four },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: spacing.two },
  ratingTrack: {
    height: 6,
    flex: 1,
    overflow: "hidden",
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
  },
  ratingFill: { height: "100%", backgroundColor: colors.rating },
  review: {
    flexDirection: "row",
    gap: spacing.three,
    paddingTop: spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
