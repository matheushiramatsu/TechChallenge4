import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { errorMessage } from '@/services/api';
import type { Paginated } from '@/types';

type FetchPage<T> = (page: number, q: string) => Promise<Paginated<T>>;

/**
 * Listagem com rolagem infinita e "puxar para atualizar".
 * Usada na página principal de posts.
 */
export function useInfiniteList<T extends { id: number }>(fetchPage: FetchPage<T>, query: string) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadFirstPage = useCallback(
    async (mode: 'initial' | 'refresh') => {
      const id = ++requestId.current;
      if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const result = await fetchPage(1, query);
        if (id !== requestId.current) return;
        setItems(result.data);
        setPage(1);
        setHasMore(result.page < result.totalPages);
      } catch (err) {
        if (id === requestId.current) setError(errorMessage(err));
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [fetchPage, query],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const result = await fetchPage(page + 1, query);
      if (id !== requestId.current) return;
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...result.data.filter((item) => !seen.has(item.id))];
      });
      setPage(result.page);
      setHasMore(result.page < result.totalPages);
    } catch (err) {
      if (id === requestId.current) setError(errorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loading, loadingMore, page, query]);

  // Recarrega ao focar a tela e sempre que a busca muda.
  useFocusEffect(
    useCallback(() => {
      void loadFirstPage('initial');
    }, [loadFirstPage]),
  );

  return {
    items,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    refresh: () => loadFirstPage('refresh'),
    reload: () => loadFirstPage('initial'),
  };
}
