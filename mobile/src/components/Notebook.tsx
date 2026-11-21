import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, MARGIN_WIDTH, spacing, type } from '@/theme';

/**
 * Folha de caderno: fundo branco com a linha vermelha da margem
 * correndo por toda a altura. As listas são desenhadas por cima dela.
 */
export function NotebookPage({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.page, style]}>
      <View style={styles.marginLine} pointerEvents="none" />
      {children}
    </View>
  );
}

interface NotebookRowProps {
  /** Texto curto escrito à mão na margem (ex.: a data "20/11"). */
  marginNote?: string;
  children: ReactNode;
}

/** Linha da folha: margem à esquerda e conteúdo sobre a pauta azul. */
export function NotebookRow({ marginNote, children }: NotebookRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.margin}>
        {marginNote ? (
          <Text style={styles.marginNote} accessibilityElementsHidden>
            {marginNote}
          </Text>
        ) : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  marginLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: MARGIN_WIDTH,
    width: 2,
    backgroundColor: colors.margin,
  },
  row: {
    flexDirection: 'row',
  },
  margin: {
    width: MARGIN_WIDTH,
    alignItems: 'center',
    paddingTop: spacing.lg + 2,
  },
  marginNote: {
    ...type.hand,
    transform: [{ rotate: '-4deg' }],
  },
  content: {
    flex: 1,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    gap: spacing.xs,
  },
});
