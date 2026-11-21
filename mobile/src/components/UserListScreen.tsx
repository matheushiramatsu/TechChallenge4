import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagedList } from '@/hooks/usePagedList';
import { errorMessage } from '@/services/api';
import { userServiceByRole } from '@/services/endpoints';
import { colors, spacing, type } from '@/theme';
import type { Role, User } from '@/types';
import { confirmAction, notify } from '@/utils/dialogs';
import { Button } from './Button';
import { Highlight } from './Highlight';
import { NotebookPage, NotebookRow } from './Notebook';
import { Pagination } from './Pagination';
import { SearchBar } from './SearchBar';
import { EmptyView, ErrorView, LoadingView } from './StateViews';

const PAGE_SIZE = 10;

const labels: Record<Role, { singular: string; plural: string; extra: string; route: string; add: string }> = {
  teacher: { singular: 'professor', plural: 'professores', extra: 'Disciplina', route: '/teachers', add: 'Cadastrar professor' },
  student: { singular: 'aluno', plural: 'alunos', extra: 'Turma', route: '/students', add: 'Cadastrar aluno' },
};

/**
 * Listagem paginada de professores ou alunos, com busca e botões de editar/excluir.
 * A mesma tela atende os dois papéis (requisitos 7 e 8).
 */
export function UserListScreen({ role }: { role: Role }) {
  const router = useRouter();
  const { user: me } = useAuth();
  const service = userServiceByRole[role];
  const text = labels[role];
  const [search, setSearch] = useState('');
  const query = useDebounce(search);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPage = useCallback(
    (page: number, q: string) => service.list({ page, limit: PAGE_SIZE, q }),
    [service],
  );
  const list = usePagedList<User>(fetchPage, query);

  async function handleDelete(user: User) {
    const ok = await confirmAction(
      `Excluir ${text.singular}`,
      `${user.name} perde o acesso ao app. Esta ação não pode ser desfeita.`,
      'Excluir',
    );
    if (!ok) return;
    setDeletingId(user.id);
    try {
      await service.remove(user.id);
      await list.reload();
    } catch (error) {
      notify('Não foi possível excluir', errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  const renderItem = ({ item }: { item: User }) => {
    const isMe = item.id === me?.id;
    return (
      <NotebookRow marginNote={isMe ? 'você' : undefined}>
        <Highlight style={type.heading} numberOfLines={1} text={item.name} term={query} />
        <Highlight style={type.small} numberOfLines={1} text={item.email} term={query} />
        {item.extra ? (
          <Text style={type.small} numberOfLines={1}>
            {text.extra}: {item.extra}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Button
            title="Editar"
            icon="create-outline"
            variant="text"
            compact
            onPress={() => router.push(`${text.route}/${item.id}`)}
          />
          {!isMe ? (
            <Button
              title="Excluir"
              icon="trash-outline"
              variant="danger"
              compact
              loading={deletingId === item.id}
              onPress={() => handleDelete(item)}
            />
          ) : null}
        </View>
      </NotebookRow>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={`Buscar ${text.plural}`} />
        <Button
          title={text.add}
          icon="person-add-outline"
          onPress={() => router.push(`${text.route}/new`)}
        />
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
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />
            }
            ListEmptyComponent={
              <EmptyView
                title={query ? `Nenhum ${text.singular} encontrado` : `Nenhum ${text.singular} cadastrado`}
                message={query ? `Confira a grafia de "${query}" ou busque pelo e-mail.` : `Use "${text.add}" para começar.`}
              />
            }
          />
        )}
      </NotebookPage>

      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        total={list.total}
        noun={list.total === 1 ? text.singular : text.plural}
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
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
    marginLeft: -spacing.sm,
  },
});
