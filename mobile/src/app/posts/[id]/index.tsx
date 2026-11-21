import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { ErrorView, LoadingView } from '@/components/StateViews';
import { useAuth } from '@/contexts/AuthContext';
import { errorMessage } from '@/services/api';
import { postService } from '@/services/endpoints';
import { colors, fonts, MIN_TOUCH, radius, spacing, type } from '@/theme';
import type { Comment, Post } from '@/types';
import { confirmAction, notify } from '@/utils/dialogs';
import { formatDate, formatDateTime } from '@/utils/format';

/** Leitura do post completo (requisito 2), com comentários (opcional do enunciado). */
export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const router = useRouter();
  const { user, isTeacher } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, c] = await Promise.all([postService.get(postId), postService.listComments(postId)]);
      setPost(p);
      setComments(c);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Recarrega ao voltar da tela de edição.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleDeletePost() {
    if (!post) return;
    const ok = await confirmAction(
      'Excluir post',
      `"${post.title}" e os comentários dele serão apagados. Esta ação não pode ser desfeita.`,
      'Excluir',
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await postService.remove(post.id);
      router.back();
    } catch (err) {
      notify('Não foi possível excluir', errorMessage(err));
      setDeleting(false);
    }
  }

  async function handleSendComment() {
    const content = newComment.trim();
    if (!content) return;
    setSending(true);
    try {
      const created = await postService.addComment(postId, content);
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (err) {
      notify('Não foi possível comentar', errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteComment(comment: Comment) {
    const ok = await confirmAction('Excluir comentário', 'O comentário será apagado.', 'Excluir');
    if (!ok) return;
    try {
      await postService.removeComment(postId, comment.id);
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    } catch (err) {
      notify('Não foi possível excluir', errorMessage(err));
    }
  }

  if (loading) return <LoadingView />;
  if (error || !post) return <ErrorView message={error ?? 'Post não encontrado.'} onRetry={load} />;

  const wasEdited = post.updatedAt !== post.createdAt;
  const canSend = !sending && newComment.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: '' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Text style={type.display} accessibilityRole="header">
            {post.title}
          </Text>
          <Text style={[type.body, styles.byline]}>
            Por {post.author}, em {formatDate(post.createdAt)}
          </Text>
          {wasEdited ? (
            <Text style={type.small}>Editado em {formatDate(post.updatedAt)}</Text>
          ) : null}

          {isTeacher ? (
            <View style={styles.teacherActions}>
              <Button
                title="Editar"
                icon="create-outline"
                variant="text"
                compact
                onPress={() => router.push(`/posts/${post.id}/edit`)}
              />
              <Button
                title="Excluir"
                icon="trash-outline"
                variant="danger"
                compact
                loading={deleting}
                onPress={handleDeletePost}
              />
            </View>
          ) : null}

          <Text style={[type.reading, styles.body]} selectable>
            {post.content}
          </Text>

          <Text style={[type.title, styles.commentsTitle]} accessibilityRole="header">
            {comments.length === 0
              ? 'Comentários'
              : `${comments.length} ${comments.length === 1 ? 'comentário' : 'comentários'}`}
          </Text>

          {comments.length === 0 ? (
            <Text style={[type.body, styles.muted]}>Ninguém comentou ainda.</Text>
          ) : (
            comments.map((comment) => {
              const canDelete = isTeacher || comment.userId === user?.id;
              return (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.commentHead}>
                    <Text style={type.label}>{comment.authorName}</Text>
                    <Text style={type.small}>{formatDateTime(comment.createdAt)}</Text>
                    {canDelete ? (
                      <Pressable
                        onPress={() => handleDeleteComment(comment)}
                        accessibilityRole="button"
                        accessibilityLabel={`Excluir comentário de ${comment.authorName}`}
                        hitSlop={12}
                        style={styles.commentDelete}
                      >
                        <Ionicons name="trash-outline" size={17} color={colors.inkMuted} />
                      </Pressable>
                    ) : null}
                  </View>
                  <Text style={type.body}>{comment.content}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={styles.commentBar}>
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Escreva um comentário"
          placeholderTextColor={colors.inkMuted}
          accessibilityLabel="Escreva um comentário"
          style={styles.commentInput}
          multiline
          maxLength={1000}
        />
        <Pressable
          onPress={handleSendComment}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Enviar comentário"
          accessibilityState={{ disabled: !canSend, busy: sending }}
          style={[styles.sendButton, !canSend && styles.sendDisabled]}
        >
          <Text style={styles.sendLabel}>Enviar</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  inner: {
    gap: spacing.sm,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  byline: {
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  teacherActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginLeft: -spacing.sm,
  },
  body: {
    marginTop: spacing.lg,
  },
  commentsTitle: {
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
  comment: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  commentHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
  },
  commentDelete: {
    marginLeft: 'auto',
    alignSelf: 'center',
  },
  commentBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    backgroundColor: colors.paper,
  },
  commentInput: {
    flex: 1,
    minHeight: MIN_TOUCH + 4,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.field,
    borderWidth: 1.5,
    borderColor: colors.rule,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  sendButton: {
    minHeight: MIN_TOUCH + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.control,
    backgroundColor: colors.board,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.chalk,
  },
});
