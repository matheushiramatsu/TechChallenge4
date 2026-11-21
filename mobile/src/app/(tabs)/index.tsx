import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { NotebookPage } from '@/components/Notebook';
import { PostCard } from '@/components/PostCard';
import { SearchBar } from '@/components/SearchBar';
import { EmptyView, ErrorView, LoadingView } from '@/components/StateViews';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteList } from '@/hooks/useInfiniteList';
import { postService } from '@/services/endpoints';
import { colors, fonts, MIN_TOUCH, radius, spacing } from '@/theme';
import type { Post } from '@/types';

const PAGE_SIZE = 10;

/**
 * Página principal (requisito 1): lista de posts com título, autor e breve descrição,
 * campo de busca por palavra-chave, rolagem infinita e "puxar para atualizar".
 */
export default function PostsScreen() {
  const router = useRouter();
  const { isTeacher } = useAuth();
  const [search, setSearch] = useState('');
  const query = useDebounce(search);

  const fetchPage = useCallback(
    (page: number, q: string) => postService.list({ page, limit: PAGE_SIZE, q }),
    [],
  );
  const list = useInfiniteList<Post>(fetchPage, query);

  return (
    <View style={styles.container}>
      {/* A busca fica no "quadro", continuação da barra superior. */}
      <View style={styles.board}>
        <SearchBar
          tone="board"
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por palavra-chave"
        />
      </View>

      <NotebookPage>
        {list.loading && list.items.length === 0 ? (
          <LoadingView label="Carregando posts" />
        ) : (
          <FlatList
            data={list.items}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PostCard post={item} term={query} onPress={() => router.push(`/posts/${item.id}`)} />
            )}
            contentContainerStyle={styles.listContent}
            onEndReached={list.loadMore}
            onEndReachedThreshold={0.4}
            refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
            ListEmptyComponent={
              list.error ? (
                <ErrorView message={list.error} onRetry={list.reload} />
              ) : (
                <EmptyView
                  title={query ? `Nada encontrado para "${query}"` : 'Nenhum post publicado ainda'}
                  message={
                    query
                      ? 'Tente outra palavra ou busque pelo nome de quem escreveu.'
                      : isTeacher
                        ? 'Use "Escrever post" para publicar o primeiro conteúdo da turma.'
                        : 'Os conteúdos dos professores vão aparecer aqui.'
                  }
                />
              )
            }
            ListFooterComponent={
              list.loadingMore ? <ActivityIndicator style={styles.footer} color={colors.board} /> : undefined
            }
          />
        )}
      </NotebookPage>

      {isTeacher ? (
        <Pressable
          onPress={() => router.push('/posts/new')}
          accessibilityRole="button"
          accessibilityLabel="Escrever post"
          style={({ pressed }) => [styles.write, pressed && styles.writePressed]}
        >
          <Ionicons name="pencil" size={18} color={colors.chalk} />
          <Text style={styles.writeLabel}>Escrever post</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  board: {
    backgroundColor: colors.board,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 96,
  },
  footer: {
    marginVertical: spacing.lg,
  },
  write: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    minHeight: MIN_TOUCH + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.control,
    backgroundColor: colors.board,
    elevation: 3,
    shadowColor: colors.boardDark,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  writePressed: {
    backgroundColor: colors.boardDark,
  },
  writeLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.chalk,
  },
});
