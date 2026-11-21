import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3000;

/**
 * Descobre a URL base da API, nesta ordem:
 * 1. Variável EXPO_PUBLIC_API_URL (arquivo .env), se definida.
 * 2. IP da máquina que roda o Metro (funciona em celular físico com Expo Go na mesma rede).
 * 3. 10.0.2.2 no emulador Android (aponta para o localhost do computador).
 * 4. localhost (web e simulador iOS).
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  if (Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri; // ex.: "192.168.0.10:8081"
    const host = hostUri?.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:${API_PORT}`;
    }
    if (Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}

export const API_URL = resolveApiUrl();
