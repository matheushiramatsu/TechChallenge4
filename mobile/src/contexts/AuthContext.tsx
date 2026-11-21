import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, setAuthToken, setUnauthorizedHandler } from '@/services/api';
import { authService } from '@/services/endpoints';
import { tokenStorage } from '@/services/tokenStorage';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  /** true enquanto o token salvo é validado na abertura do app. */
  isLoading: boolean;
  isTeacher: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Atualiza os dados do usuário logado (ex.: após editar o próprio cadastro). */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await tokenStorage.clear();
  }, []);

  // Restaura a sessão salva ao abrir o app.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });

    (async () => {
      try {
        const token = await tokenStorage.get();
        if (!token) return;
        setAuthToken(token);
        const { user: current } = await authService.me();
        setUser(current);
      } catch (error) {
        // Token inválido/expirado: descarta. Sem conexão: também volta ao login.
        if (!(error instanceof ApiError) || error.status !== 0) await tokenStorage.clear();
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: logged } = await authService.login(email.trim(), password);
    setAuthToken(token);
    await tokenStorage.set(token);
    setUser(logged);
  }, []);

  const refreshUser = useCallback(async () => {
    const { user: current } = await authService.me();
    setUser(current);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isTeacher: user?.role === 'teacher',
      signIn,
      signOut,
      refreshUser,
    }),
    [user, isLoading, signIn, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return context;
}
