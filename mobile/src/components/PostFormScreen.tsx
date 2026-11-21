import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError, errorMessage } from '@/services/api';
import { postService } from '@/services/endpoints';
import { colors, type } from '@/theme';
import type { PostInput } from '@/types';
import { notify } from '@/utils/dialogs';
import { Button } from './Button';
import { FormLayout } from './FormLayout';
import { ErrorView, LoadingView } from './StateViews';
import { TextField } from './TextField';

type Errors = Partial<Record<keyof PostInput, string>>;

function validate(values: PostInput): Errors {
  const errors: Errors = {};
  if (values.title.trim().length < 3) errors.title = 'O título deve ter ao menos 3 caracteres.';
  if (values.content.trim().length < 10) errors.content = 'O conteúdo deve ter ao menos 10 caracteres.';
  if (values.author.trim().length < 2) errors.author = 'Informe o autor.';
  return errors;
}

/**
 * Criação (requisito 3) e edição (requisito 4) de posts.
 * Na edição, os dados atuais do post são carregados no formulário.
 */
export function PostFormScreen({ id }: { id?: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const isEdit = id !== undefined;

  const [values, setValues] = useState<PostInput>({
    title: '',
    content: '',
    author: user?.name ?? '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [attempt, setAttempt] = useState(0);

  // Edição: carrega os dados atuais do post no formulário.
  useEffect(() => {
    if (id === undefined) return;
    let active = true;
    postService
      .get(id)
      .then((post) => {
        if (active) setValues({ title: post.title, content: post.content, author: post.author });
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
  }, [id, attempt]);

  function retry() {
    setLoading(true);
    setLoadError(null);
    setAttempt((n) => n + 1);
  }

  const setField = (field: keyof PostInput) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function handleSubmit() {
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload: PostInput = {
      title: values.title.trim(),
      content: values.content.trim(),
      author: values.author.trim(),
    };

    setSaving(true);
    try {
      if (id !== undefined) {
        await postService.update(id, payload);
        notify('Alterações salvas', 'O post foi atualizado.');
        router.back();
      } else {
        const created = await postService.create(payload);
        notify('Post publicado', 'Os alunos já podem ler o post.');
        router.replace(`/posts/${created.id}`);
      }
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors as Errors);
      } else {
        notify('Não foi possível salvar', errorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingView />;
  if (loadError) return <ErrorView message={loadError} onRetry={retry} />;

  return (
    <FormLayout>
      <Stack.Screen options={{ title: isEdit ? 'Editar post' : 'Escrever post' }} />
      <Text style={styles.intro}>
        {isEdit
          ? 'As alterações aparecem para os alunos assim que forem salvas.'
          : 'O post aparece para todos os alunos assim que for publicado.'}
      </Text>
      <TextField
        label="Título"
        value={values.title}
        onChangeText={setField('title')}
        error={errors.title}
        placeholder="Ex.: Revisão para a prova de frações"
        maxLength={150}
      />
      <TextField
        label="Autor"
        value={values.author}
        onChangeText={setField('author')}
        error={errors.author}
        autoCapitalize="words"
        maxLength={100}
      />
      <TextField
        label="Conteúdo"
        value={values.content}
        onChangeText={setField('content')}
        error={errors.content}
        placeholder="Escreva o conteúdo do post…"
        multiline
        hint={`${values.content.length} caracteres`}
      />
      <Button
        title={isEdit ? 'Salvar alterações' : 'Publicar'}
        icon={isEdit ? 'checkmark' : 'send'}
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
