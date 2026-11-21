import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/services/config';
import { colors, spacing, type } from '@/theme';
import { confirmAction } from '@/utils/dialogs';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={type.small}>{label}</Text>
      <Text style={type.body}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, isTeacher, signOut } = useAuth();
  if (!user) return null;

  async function handleLogout() {
    const ok = await confirmAction('Sair', 'Você vai precisar entrar de novo para usar o app.', 'Sair');
    if (ok) await signOut();
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={type.display}>{user.name}</Text>
          <Text style={[type.body, styles.role]}>{isTeacher ? 'Professor(a)' : 'Aluno(a)'}</Text>
        </View>

        <Field label="E-mail" value={user.email} />
        {user.extra ? <Field label={isTeacher ? 'Disciplina' : 'Turma'} value={user.extra} /> : null}
        <Field
          label="O que você pode fazer"
          value={
            isTeacher
              ? 'Publicar, editar e excluir posts. Cadastrar e gerenciar professores e alunos.'
              : 'Ler os posts e comentar.'
          }
        />

        <Button
          title="Sair"
          icon="log-out-outline"
          variant="outline"
          onPress={handleLogout}
          style={styles.logout}
        />
        <Text style={[type.small, styles.server]}>Servidor: {API_URL}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.paper,
  },
  content: {
    padding: spacing.xl,
  },
  inner: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.xl,
  },
  role: {
    color: colors.inkMuted,
  },
  field: {
    gap: 2,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  logout: {
    marginTop: spacing.xl,
    alignSelf: 'flex-start',
  },
  server: {
    marginTop: spacing.lg,
  },
});
