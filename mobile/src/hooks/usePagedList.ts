import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { errorMessage } from '@/services/api';
import type { Paginated } from '@/types';

type FetchPage<T> = (page: number, q: string) => Promise<Paginated<T>>;

/**
 * Listagem paginada "por páginas" (botões Anterior/Próxima).
 * Usada nas telas administrativas de posts, professores e alunos.
 * Recarrega ao voltar para a tela (ex.: depois de criar/editar um item).
 */
export function usePagedList<T>(fetchPage: FetchPage<T>, query: string) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(
    async (targetPage: number, mode: 'initial' | 'refresh' = 'initial') => {
      const id = ++requestId.current;
      if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const result = await fetchPage(targetPage, query);
        if (id !== requestId.current) return; // resposta antiga: ignora
        // Se a página ficou vazia (ex.: excluiu o último item), volta uma página.
        if (result.data.length === 0 && targetPage > 1) {
          setPage(targetPage - 1);
          return;
        }
        setItems(result.data);
        setTotalPages(result.totalPages);
        setTotal(result.total);
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

  // Nova busca: volta para a primeira página (ajuste de estado durante o render,
  // padrão recomendado pelo React em vez de um useEffect).
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setPage(1);
  }

  useFocusEffect(
    useCallback(() => {
      void load(page);
    }, [load, page]),
  );

  return {
    items,
    page,
    totalPages,
    total,
    loading,
    refreshing,
    error,
    goToPage: setPage,
    reload: () => load(page),
    refresh: () => load(page, 'refresh'),
  };
}
