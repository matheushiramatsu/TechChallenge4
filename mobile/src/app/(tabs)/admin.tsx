import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { NotebookPage } from '@/components/Notebook';
import { Pagination } from '@/components/Pagination';
import { PostCard } from '@/components/PostCard';
import { SearchBar } from '@/components/SearchBar';
import { EmptyView, ErrorView, LoadingView } from '@/components/StateViews';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagedList } from '@/hooks/usePagedList';
import { errorMessage } from '@/services/api';
import { postService } from '@/services/endpoints';
import { colors, spacing } from '@/theme';
import type { Post } from '@/types';
import { confirmAction, notify } from '@/utils/dialogs';

const PAGE_SIZE = 10;

/** Página administrativa (requisito 9): todas as postagens com editar e excluir. */
export default function AdminScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const query = useDebounce(search);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPage = useCallback(
    (page: number, q: string) => postService.list({ page, limit: PAGE_SIZE, q }),
    [],
  );
  const list = usePagedList<Post>(fetchPage, query);

  async function handleDelete(post: Post) {
    const ok = await confirmAction(
      'Excluir post',
      `"${post.title}" e os comentários dele serão apagados. Esta ação não pode ser desfeita.`,
      'Excluir',
    );
    if (!ok) return;
    setDeletingId(post.id);
    try {
      await postService.remove(post.id);
      await list.reload();
    } catch (error) {
      notify('Não foi possível excluir', errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar posts" />
        <Button title="Escrever post" icon="pencil" onPress={() => router.push('/posts/new')} />
      </View>

      <NotebookPage>
        {list.loading && list.items.length === 0 ? (
          <LoadingView />
        ) : list.error && list.items.length === 0 ? (
          <ErrorView message={list.error} onRetry={list.reload} />
        ) : (
          <FlatList
            data={list.items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
            ListEmptyComponent={
              <EmptyView
                title={query ? `Nada encontrado para "${query}"` : 'Nenhum post publicado ainda'}
                message={query ? undefined : 'Use "Escrever post" para publicar o primeiro.'}
              />
            }
            renderItem={({ item }) => (
              <PostCard
                post={item}
                term={query}
                onPress={() => router.push(`/posts/${item.id}`)}
                actions={
                  <>
                    <Button
                      title="Editar"
                      icon="create-outline"
                      variant="text"
                      compact
                      onPress={() => router.push(`/posts/${item.id}/edit`)}
                    />
                    <Button
                      title="Excluir"
                      icon="trash-outline"
                      variant="danger"
                      compact
                      loading={deletingId === item.id}
                      onPress={() => handleDelete(item)}
                    />
                  </>
                }
              />
            )}
          />
        )}
      </NotebookPage>

      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        total={list.total}
        noun={list.total === 1 ? 'post' : 'posts'}
        onChange={list.goToPage}
        disabled={list.loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  toolbar: {
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  listContent: {
    flexGrow: 1,
  },
});
