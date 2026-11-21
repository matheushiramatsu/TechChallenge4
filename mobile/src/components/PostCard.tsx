import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '@/theme';
import type { Post } from '@/types';
import { excerpt, formatDate, shortDate } from '@/utils/format';
import { Highlight } from './Highlight';
import { NotebookRow } from './Notebook';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  /** Termo buscado, destacado no título e na descrição. */
  term?: string;
  /** Ações extras (ex.: editar/excluir na área administrativa). */
  actions?: ReactNode;
}

/** Um post como uma linha da folha de caderno, com a data escrita na margem. */
export function PostCard({ post, onPress, term, actions }: PostCardProps) {
  return (
    <NotebookRow marginNote={shortDate(post.createdAt)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${post.title}, por ${post.author}, ${formatDate(post.createdAt)}`}
        accessibilityHint="Abre o post completo"
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <Highlight style={type.heading} numberOfLines={2} text={post.title} term={term} />
        <Text style={type.small}>{post.author}</Text>
        <Highlight
          style={[type.body, styles.description]}
          numberOfLines={2}
          text={excerpt(post.content)}
          term={term}
        />
      </Pressable>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </NotebookRow>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  description: {
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginLeft: -spacing.sm,
  },
});
