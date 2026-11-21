import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '@/theme';
import { Button } from './Button';

export function LoadingView({ label = 'Carregando' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityLabel={label} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.board} />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={type.heading}>Não foi possível carregar</Text>
      <Text style={[type.body, styles.text]}>{message}</Text>
      {onRetry ? <Button title="Tentar de novo" variant="outline" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyView({ title, message }: { title: string; message?: string }) {
  return (
    <View style={styles.center}>
      <Text style={[type.heading, styles.text]}>{title}</Text>
      {message ? <Text style={[type.body, styles.muted]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  text: {
    maxWidth: 420,
  },
  muted: {
    color: colors.inkMuted,
    maxWidth: 420,
  },
});
