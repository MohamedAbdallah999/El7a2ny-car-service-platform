import type { ReactNode } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import { colors, radii, spacing, typography } from "../theme.js";
import { Badge, Card, StarRating, StatusBadge } from "./core.js";
import { StatGrid } from "./layout.js";

export function VehicleCard({
  name,
  year,
  plate,
  stats,
  onSwitch,
}: {
  name: string;
  year: string;
  plate: string;
  stats: ReadonlyArray<{ label: string; value: string }>;
  onSwitch?: () => void;
}) {
  return (
    <Card variant="dark">
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.darkLabel}>My Vehicle</Text>
          <Text style={styles.darkTitle}>{name}</Text>
          <Text style={styles.darkMuted}>
            {year} · {plate}
          </Text>
        </View>
        {onSwitch ? (
          <Text
            accessibilityRole="button"
            onPress={onSwitch}
            style={styles.link}
          >
            Switch
          </Text>
        ) : null}
      </View>
      <StatGrid items={stats} columns={3} dark />
    </Card>
  );
}

export interface QuickAction {
  key: string;
  label: string;
  icon?: ReactNode;
  emphasis?: "default" | "primary";
  onPress: () => void;
}

export function QuickActionsGrid({
  actions,
}: {
  actions: ReadonlyArray<QuickAction>;
}) {
  return (
    <View style={styles.actionGrid}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.quickAction,
            action.emphasis === "primary" && styles.quickActionPrimary,
            pressed && styles.pressed,
          ]}
        >
          {action.icon ? (
            <View accessibilityElementsHidden>{action.icon}</View>
          ) : null}
          <Text style={styles.quickActionText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function AppointmentCard({
  service,
  shop,
  schedule,
  status,
  actions,
}: {
  service: string;
  shop: string;
  schedule: string;
  status: string;
  actions?: ReactNode;
}) {
  return (
    <Card>
      <View style={styles.rowBetween}>
        <View style={styles.flex}>
          <Text style={styles.title}>{service}</Text>
          <Text style={styles.muted}>{shop}</Text>
        </View>
        <StatusBadge status={status} />
      </View>
      <Text style={styles.meta}>{schedule}</Text>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </Card>
  );
}

export function ShopCard({
  name,
  image,
  status,
  rating,
  distance,
  onPress,
}: {
  name: string;
  image?: ImageSourcePropType;
  status: string;
  rating: number;
  distance: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.shopCard}
    >
      {image ? (
        <Image
          source={image}
          accessibilityLabel={name}
          style={styles.shopImage}
        />
      ) : null}
      <View style={styles.shopContent}>
        <StatusBadge status={status} />
        <Text numberOfLines={1} style={styles.title}>
          {name}
        </Text>
        <View style={styles.rowBetween}>
          <StarRating value={rating} />
          <Text style={styles.muted}>{distance}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function HorizontalCardList({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalList}
    >
      {children}
    </ScrollView>
  );
}

export function ServiceListRow({
  name,
  detail,
  price,
  onPress,
}: {
  name: string;
  detail: string;
  price: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.listRow}
    >
      <View style={styles.flex}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.muted}>{detail}</Text>
      </View>
      <Text style={styles.price}>{price}</Text>
      <Text accessibilityElementsHidden style={styles.chevron}>
        ›
      </Text>
    </Pressable>
  );
}

export interface DetailCardProps {
  title: string;
  subtitle?: string;
  meta?: string;
  status?: string;
  priority?: string;
  body?: ReactNode;
  details?: ReadonlyArray<{ label: string; value: ReactNode }>;
  actions?: ReactNode;
}

export function DetailCard({
  actions,
  body,
  details,
  meta,
  priority,
  status,
  subtitle,
  title,
}: DetailCardProps) {
  return (
    <Card>
      <View style={styles.rowBetween}>
        <View style={styles.flex}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
        </View>
        <View style={styles.badges}>
          {priority ? <StatusBadge status={priority} /> : null}
          {status ? <StatusBadge status={status} /> : null}
        </View>
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {body ? <View style={styles.body}>{body}</View> : null}
      {details ? (
        <View style={styles.detailGrid}>
          {details.map((detail) => (
            <View key={detail.label} style={styles.detailItem}>
              <Text style={styles.darkLabel}>{detail.label}</Text>
              <Text style={styles.detailValue}>{detail.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </Card>
  );
}

export function ProductCard({
  brand,
  name,
  price,
  image,
  sale,
  compatible,
  available = true,
  action,
}: {
  brand: string;
  name: string;
  price: string;
  image?: ImageSourcePropType;
  sale?: boolean;
  compatible?: boolean;
  available?: boolean;
  action?: ReactNode;
}) {
  return (
    <Card style={styles.productCard}>
      {image ? (
        <Image
          source={image}
          accessibilityLabel={name}
          style={styles.productImage}
        />
      ) : null}
      <View style={styles.badges}>
        {sale ? <Badge variant="error">SALE</Badge> : null}
        {compatible ? <Badge variant="success">✓ Fits</Badge> : null}
      </View>
      <Text style={styles.darkLabel}>{brand}</Text>
      <Text numberOfLines={2} style={styles.title}>
        {name}
      </Text>
      <Text style={styles.price}>{price}</Text>
      {available ? action : <Badge variant="muted">Out of stock</Badge>}
    </Card>
  );
}

export function CompatibilityBanner({
  vehicle,
  action,
}: {
  vehicle: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.compatibility}>
      <Text style={styles.compatibilityCheck}>✓</Text>
      <View style={styles.flex}>
        <Text style={styles.darkLabel}>Showing parts for</Text>
        <Text style={styles.title}>{vehicle}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { minWidth: 0, flex: 1 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.three,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  darkTitle: {
    marginTop: spacing.one,
    color: colors.surface,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.black,
  },
  darkLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    textTransform: "uppercase",
  },
  darkMuted: {
    marginTop: spacing.one,
    color: colors.darkMuted,
    fontSize: typography.fontSizes.xs,
  },
  muted: {
    marginTop: spacing.one,
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
  },
  meta: {
    marginTop: spacing.three,
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
  },
  link: {
    color: colors.primary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.three },
  quickAction: {
    width: "48%",
    minHeight: 88,
    justifyContent: "space-between",
    padding: spacing.four,
    borderRadius: radii.xl,
    backgroundColor: colors.darkSurface,
  },
  quickActionPrimary: { backgroundColor: colors.primary },
  quickActionText: {
    color: colors.surface,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.two,
    marginTop: spacing.four,
  },
  shopCard: {
    width: 176,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  shopImage: { width: "100%", height: 96 },
  shopContent: { gap: spacing.two, padding: spacing.three },
  horizontalList: { gap: spacing.three, paddingRight: spacing.four },
  listRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.three,
    padding: spacing.four,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  price: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.black,
  },
  chevron: { color: colors.placeholder, fontSize: typography.fontSizes.xl },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.one },
  body: {
    marginTop: spacing.three,
    padding: spacing.three,
    borderRadius: radii.lg,
    backgroundColor: colors.backgroundSubtle,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.three,
    marginTop: spacing.three,
  },
  detailItem: { minWidth: "45%", flex: 1 },
  detailValue: {
    marginTop: spacing.one,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  productCard: { width: "100%", gap: spacing.two },
  productImage: { width: "100%", height: 112, borderRadius: radii.lg },
  compatibility: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.three,
    padding: spacing.three,
    borderWidth: 1,
    borderColor: colors.successBorder,
    backgroundColor: colors.successBackground,
  },
  compatibilityCheck: {
    color: colors.successText,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.black,
  },
  pressed: { opacity: 0.8 },
});
