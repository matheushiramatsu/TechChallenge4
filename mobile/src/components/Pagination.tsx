import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '@/theme';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  /** Nome do item no plural, ex.: "professores". */
  noun: string;
  onChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ page, totalPages, total, noun, onChange, disabled }: PaginationProps) {
  return (
    <View style={styles.container}>
      <Button
        title="Anterior"
        icon="chevron-back"
        variant="text"
        compact
        disabled={disabled || page <= 1}
        onPress={() => onChange(page - 1)}
      />
      <Text style={[type.small, styles.label]} accessibilityLiveRegion="polite">
        Página {page} de {totalPages}
        {'\n'}
        {total} {noun}
      </Text>
      <Button
        title="Próxima"
        variant="text"
        compact
        disabled={disabled || page >= totalPages}
        onPress={() => onChange(page + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    backgroundColor: colors.paper,
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
});
