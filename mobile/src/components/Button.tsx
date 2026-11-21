import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fonts, MIN_TOUCH, radius, spacing } from '@/theme';

type Variant = 'primary' | 'outline' | 'text' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.board, fg: colors.chalk, border: colors.board },
  outline: { bg: colors.paper, fg: colors.board, border: colors.board },
  text: { bg: 'transparent', fg: colors.board, border: 'transparent' },
  danger: { bg: 'transparent', fg: colors.correction, border: 'transparent' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  compact = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const { bg, fg, border } = palette[variant];
  const isDisabled = disabled || loading;
  const isFlat = variant === 'text' || variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        isFlat && styles.flat,
        { backgroundColor: bg, borderColor: border },
        pressed && (isFlat ? styles.pressedFlat : styles.pressed),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={compact ? 17 : 19} color={fg} /> : null}
          <Text style={[styles.label, compact && styles.labelCompact, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.control,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.md,
  },
  flat: {
    paddingHorizontal: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  labelCompact: {
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
  },
  pressedFlat: {
    backgroundColor: colors.desk,
  },
  disabled: {
    opacity: 0.45,
  },
});
