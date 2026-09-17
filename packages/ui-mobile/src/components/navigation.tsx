import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, layout, radii, spacing, typography } from "../theme.js";

export interface BottomNavigationItem<Key extends string = string> {
  key: Key;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export interface BottomNavigationProps<Key extends string = string> {
  items: ReadonlyArray<BottomNavigationItem<Key>>;
  activeKey: Key;
  onSelect: (key: Key) => void;
  label?: string;
}

export function BottomNavigation<Key extends string>({
  activeKey,
  items,
  label = "Main navigation",
  onSelect,
}: BottomNavigationProps<Key>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={styles.bottomNav}
    >
      {items.map((item) => {
        const selected = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            onPress={() => onSelect(item.key)}
            style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}
          >
            <View>
              <View accessibilityElementsHidden>{item.icon}</View>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.navLabel, selected && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backAction?: ReactNode;
}

export function ScreenHeader({
  action,
  backAction,
  subtitle,
  title,
}: ScreenHeaderProps) {
  return (
    <View style={styles.screenHeader}>
      {backAction}
      <View style={styles.headerContent}>
        <Text accessibilityRole="header" style={styles.headerTitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

export interface TabItem<Value extends string = string> {
  value: Value;
  label: string;
}

export function UnderlineTabs<Value extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: ReadonlyArray<TabItem<Value>>;
  value: Value;
  onChange: (value: Value) => void;
  label: string;
}) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={styles.tabs}
    >
      {items.map((item) => {
        const selected = value === item.value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(item.value)}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function FixedBottomBar({ children }: { children: ReactNode }) {
  return <View style={styles.fixedBar}>{children}</View>;
}

const styles = StyleSheet.create({
  bottomNav: {
    height: layout.bottomNavigationHeight,
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  navItem: {
    minWidth: 0,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.one,
  },
  navLabel: {
    color: colors.placeholder,
    fontSize: 10,
    fontWeight: typography.fontWeights.semibold,
  },
  navLabelActive: { color: colors.primary },
  badge: {
    position: "absolute",
    top: -8,
    right: -12,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
  },
  screenHeader: {
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
  headerContent: { minWidth: 0, flex: 1 },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.black,
  },
  headerSubtitle: {
    marginTop: spacing.one,
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    minHeight: layout.touchTarget,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabSelected: { borderBottomColor: colors.primary },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    textTransform: "capitalize",
  },
  tabTextSelected: { color: colors.primary },
  fixedBar: {
    padding: spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
});
