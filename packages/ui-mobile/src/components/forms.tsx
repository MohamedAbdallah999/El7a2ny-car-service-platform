import { useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  View,
} from "react-native";
import type {
  TextInputInstance,
  TextInputKeyPressEvent,
  TextInputProps as NativeTextInputProps,
} from "react-native";
import { colors, layout, radii, spacing, typography } from "../theme.js";

export interface TextInputProps extends NativeTextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  success?: boolean;
  leadingIcon?: ReactNode;
  passwordToggle?: boolean;
}

export function TextInput({
  editable = true,
  error,
  hint,
  label,
  leadingIcon,
  passwordToggle,
  secureTextEntry,
  success,
  ...props
}: TextInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const message = error ?? hint;

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputFrame,
          error && styles.inputError,
          success && styles.inputSuccess,
          !editable && styles.disabled,
        ]}
      >
        {leadingIcon ? (
          <View accessibilityElementsHidden>{leadingIcon}</View>
        ) : null}
        <NativeTextInput
          {...props}
          editable={editable}
          secureTextEntry={secureTextEntry && !passwordVisible}
          accessibilityLabel={props.accessibilityLabel ?? label}
          accessibilityState={{ disabled: !editable }}
          style={styles.input}
          placeholderTextColor={colors.placeholder}
        />
        {passwordToggle && secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? "Hide password" : "Show password"
            }
            onPress={() => setPasswordVisible((visible) => !visible)}
            hitSlop={spacing.two}
          >
            <Text style={styles.toggle}>
              {passwordVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {message ? (
        <Text
          accessibilityLiveRegion={error ? "polite" : "none"}
          style={[styles.message, error && styles.errorMessage]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

export interface SearchInputProps extends NativeTextInputProps {
  icon?: ReactNode;
}

export function SearchInput({ icon, ...props }: SearchInputProps) {
  return (
    <View style={styles.search}>
      {icon ? <View accessibilityElementsHidden>{icon}</View> : null}
      <NativeTextInput
        {...props}
        accessibilityRole="search"
        accessibilityLabel={
          props.accessibilityLabel ?? props.placeholder ?? "Search"
        }
        placeholderTextColor={colors.placeholder}
        style={styles.searchInput}
      />
    </View>
  );
}

const OTP_LENGTH = 6;

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({
  disabled,
  error,
  label = "Verification code",
  onChange,
  value,
}: OtpInputProps) {
  const inputRefs = useRef<Array<TextInputInstance | null>>([]);
  const digits = Array.from(
    { length: OTP_LENGTH },
    (_, index) => value[index] ?? "",
  );

  function updateDigit(index: number, text: string) {
    const digit = text.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(""));
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKey(index: number, event: TextInputKeyPressEvent) {
    if (event.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <View accessible accessibilityLabel={label} style={styles.otpRow}>
      {digits.map((digit, index) => (
        <NativeTextInput
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          value={digit}
          editable={!disabled}
          keyboardType="number-pad"
          textContentType={index === 0 ? "oneTimeCode" : "none"}
          maxLength={1}
          selectTextOnFocus
          accessibilityLabel={`${label} digit ${index + 1}`}
          style={[styles.otpInput, error && styles.inputError]}
          onChangeText={(text) => updateDigit(index, text)}
          onKeyPress={(event) => handleKey(index, event)}
        />
      ))}
    </View>
  );
}

export interface FilterOption<Value extends string = string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

export interface FilterPillsProps<Value extends string = string> {
  options: ReadonlyArray<FilterOption<Value>>;
  value: Value;
  onChange: (value: Value) => void;
  label: string;
}

export function FilterPills<Value extends string>({
  label,
  onChange,
  options,
  value,
}: FilterPillsProps<Value>) {
  return (
    <ScrollView
      horizontal
      accessibilityRole="tablist"
      accessibilityLabel={label}
      contentContainerStyle={styles.filters}
      showsHorizontalScrollIndicator={false}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled: option.disabled }}
            disabled={option.disabled}
            style={({ pressed }) => [
              styles.filter,
              selected && styles.filterSelected,
              pressed && styles.pressed,
              option.disabled && styles.disabled,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[styles.filterText, selected && styles.filterTextSelected]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export interface RadioSelectCardProps {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  label: string;
  disabled?: boolean;
}

export function RadioSelectCard({
  children,
  disabled,
  label,
  onPress,
  selected,
}: RadioSelectCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.radioCard,
        selected && styles.radioCardSelected,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.radioContent}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.two },
  label: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  inputFrame: {
    minHeight: layout.controlMinHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.two,
    paddingHorizontal: spacing.three,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  input: {
    minWidth: 0,
    flex: 1,
    padding: 0,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizes.sm,
  },
  inputError: { borderColor: colors.error },
  inputSuccess: { borderColor: colors.success },
  toggle: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  message: { color: colors.textMuted, fontSize: typography.fontSizes.xs },
  errorMessage: { color: colors.errorText },
  search: {
    minHeight: layout.controlMinHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.two,
    paddingHorizontal: spacing.three,
    borderRadius: radii.xl,
    backgroundColor: colors.backgroundSubtle,
  },
  searchInput: {
    minWidth: 0,
    flex: 1,
    padding: 0,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.two,
  },
  otpInput: {
    width: 44,
    height: 48,
    padding: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    textAlign: "center",
  },
  filters: { gap: spacing.two },
  filter: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.three,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
  },
  filterSelected: { backgroundColor: colors.primary },
  filterText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    textTransform: "capitalize",
  },
  filterTextSelected: { color: colors.surface },
  radioCard: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.three,
    padding: spacing.four,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  radioCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radio: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: radii.full,
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  radioContent: { minWidth: 0, flex: 1 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
