import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError, errorMessage } from '@/services/api';
import { userServiceByRole } from '@/services/endpoints';
import { colors, type } from '@/theme';
import type { Role, UserInput } from '@/types';
import { notify } from '@/utils/dialogs';
import { Button } from './Button';
import { FormLayout } from './FormLayout';
import { ErrorView, LoadingView } from './StateViews';
import { TextField } from './TextField';

const labels: Record<Role, { singular: string; extra: string; extraPlaceholder: string }> = {
  teacher: { singular: 'professor', extra: 'Disciplina', extraPlaceholder: 'Ex.: Matemática' },
  student: { singular: 'aluno', extra: 'Turma', extraPlaceholder: 'Ex.: 9º ano A' },
};

type Errors = Partial<Record<keyof UserInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: UserInput, isEdit: boolean): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 3) errors.name = 'Informe o nome completo (mín. 3 caracteres).';
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Informe um e-mail válido.';
  const password = values.password ?? '';
  if (!isEdit && password.length < 6) errors.password = 'A senha deve ter ao menos 6 caracteres.';
  if (isEdit && password.length > 0 && password.length < 6) {
    errors.password = 'A nova senha deve ter ao menos 6 caracteres.';
  }
  return errors;
}

/**
 * Formulário de criação/edição de professores ou alunos (requisitos 5, 6 e 8).
 * Sem `id` cria um novo registro; com `id` carrega os dados atuais para edição.
 */
export function UserFormScreen({ role, id }: { role: Role; id?: number }) {
  const router = useRouter();
  const { user: me, refreshUser } = useAuth();
  const service = userServiceByRole[role];
  const text = labels[role];
  const isEdit = id !== undefined;

  const [values, setValues] = useState<UserInput>({ name: '', email: '', password: '', extra: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [attempt, setAttempt] = useState(0);

  // Edição: carrega os dados atuais do cadastro no formulário.
  useEffect(() => {
    if (id === undefined) return;
    let active = true;
    service
      .get(id)
      .then((user) => {
        if (active) {
          setValues({ name: user.name, email: user.email, password: '', extra: user.extra ?? '' });
        }
      })
      .catch((error: unknown) => {
        if (active) setLoadError(errorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, service, attempt]);

  function retry() {
    setLoading(true);
    setLoadError(null);
    setAttempt((n) => n + 1);
  }

  const setField = (field: keyof UserInput) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function handleSubmit() {
    const found = validate(values, isEdit);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload: UserInput = {
      name: values.name.trim(),
      email: values.email.trim(),
      extra: values.extra?.trim() ?? '',
    };
    if (values.password) payload.password = values.password;

    setSaving(true);
    try {
      if (id !== undefined) {
        await service.update(id, payload);
        if (id === me?.id) await refreshUser();
      } else {
        await service.create(payload);
      }
      notify(isEdit ? 'Alterações salvas' : 'Cadastro concluído', isEdit ? `Os dados de ${payload.name} foram atualizados.` : `${payload.name} já pode entrar no app.`);
      router.back();
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors as Errors);
      } else if (error instanceof ApiError && error.status === 409) {
        setErrors({ email: error.message });
      } else {
        notify('Não foi possível salvar', errorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  }

  const title = `${isEdit ? 'Editar' : 'Cadastrar'} ${text.singular}`;

  if (loading) return <LoadingView />;
  if (loadError) return <ErrorView message={loadError} onRetry={retry} />;

  return (
    <FormLayout>
      <Stack.Screen options={{ title }} />
      <Text style={styles.intro}>
        {isEdit
          ? `Atualize os dados do ${text.singular}. Deixe a senha em branco para mantê-la.`
          : `Preencha os dados para cadastrar um novo ${text.singular}.`}
      </Text>
      <TextField
        label="Nome completo"
        value={values.name}
        onChangeText={setField('name')}
        error={errors.name}
        autoCapitalize="words"
        placeholder="Ex.: Maria da Silva"
      />
      <TextField
        label="E-mail"
        value={values.email}
        onChangeText={setField('email')}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="nome@escola.com"
      />
      <TextField
        label={isEdit ? 'Nova senha (opcional)' : 'Senha'}
        value={values.password}
        onChangeText={setField('password')}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        placeholder="Mínimo de 6 caracteres"
      />
      <TextField
        label={`${text.extra} (opcional)`}
        value={values.extra}
        onChangeText={setField('extra')}
        error={errors.extra}
        placeholder={text.extraPlaceholder}
      />
      <Button
        title={isEdit ? 'Salvar alterações' : `Cadastrar ${text.singular}`}
        icon="checkmark"
        loading={saving}
        onPress={handleSubmit}
      />
    </FormLayout>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...type.body,
    color: colors.inkMuted,
  },
});
