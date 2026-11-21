import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingView } from '@/components/StateViews';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { boardHeader } from '@/navigationOptions';
import { colors } from '@/theme';

/**
 * Navegação raiz. As rotas são protegidas com Stack.Protected:
 * - sem login: apenas /login;
 * - logado (professor ou aluno): abas e leitura de posts;
 * - professor: criação/edição de posts, professores e alunos.
 * A API valida as mesmas regras no servidor (o guard é só de navegação).
 */
function RootNavigator() {
  const { user, isLoading, isTeacher } = useAuth();

  if (isLoading) return <LoadingView label="Abrindo o Blog Escolar" />;

  const isLoggedIn = !!user;

  return (
    <Stack
      screenOptions={{
        ...boardHeader,
        contentStyle: { backgroundColor: colors.paper },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="posts/[id]/index" options={{ title: 'Post' }} />

        <Stack.Protected guard={isTeacher}>
          <Stack.Screen name="posts/new" options={{ title: 'Escrever post' }} />
          <Stack.Screen name="posts/[id]/edit" options={{ title: 'Editar post' }} />
          <Stack.Screen name="teachers/new" options={{ title: 'Cadastrar professor' }} />
          <Stack.Screen name="teachers/[id]" options={{ title: 'Editar professor' }} />
          <Stack.Screen name="students/new" options={{ title: 'Cadastrar aluno' }} />
          <Stack.Screen name="students/[id]" options={{ title: 'Editar aluno' }} />
        </Stack.Protected>
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
    Caveat_600SemiBold,
  });

  // Sem as fontes, o app cai nas fontes do sistema (fontError) em vez de travar.
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.board }} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
