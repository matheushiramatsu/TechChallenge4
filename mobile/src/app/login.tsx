import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInputInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { errorMessage } from '@/services/api';
import { API_URL } from '@/services/config';
import { colors, fonts, radius, spacing, type } from '@/theme';

/** Tela de login (requisito 10). Professores e alunos entram com e-mail e senha. */
export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      // O guard do _layout redireciona automaticamente para as abas.
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.board}>
            <Text style={styles.brand} accessibilityRole="header">
              Blog Escolar
            </Text>
            <Text style={styles.tagline}>Os conteúdos das aulas, do professor para a turma.</Text>
          </View>

          <View style={styles.sheet}>
            <View style={styles.form}>
              <TextField
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                placeholder="nome@escola.com"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <TextField
                ref={passwordRef}
                label="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                error={error ?? undefined}
              />
              <Button title="Entrar" loading={loading} onPress={handleLogin} />

              <View style={styles.demo}>
                <Text style={type.label}>Para testar</Text>
                <Text style={type.small}>Professor: professor@escola.com, senha professor123</Text>
                <Text style={type.small}>Aluno: aluno@escola.com, senha aluno123</Text>
                <Text style={[type.small, styles.server]}>Servidor: {API_URL}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.board,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  board: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 40,
    lineHeight: 46,
    color: colors.chalk,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 26,
    color: colors.chalkMuted,
    maxWidth: 320,
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  form: {
    gap: spacing.xl,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  demo: {
    gap: 2,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  server: {
    marginTop: spacing.sm,
  },
});
