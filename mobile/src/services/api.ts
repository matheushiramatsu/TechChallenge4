import { API_URL } from './config';

/** Erro padronizado das chamadas HTTP. `fieldErrors` traz os erros por campo da API. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Define o token JWT enviado em todas as requisições. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Callback chamado quando a API responde 401 (token expirado/inválido). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

const TIMEOUT_MS = 15000;

export async function request<T>(
  method: Method,
  path: string,
  options: { body?: unknown; query?: Record<string, string | number | undefined> } = {},
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      `Não foi possível conectar ao servidor (${API_URL}). Verifique se a API está rodando.`,
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const body = (payload ?? {}) as { message?: string; details?: Record<string, string> };
    if (response.status === 401 && authToken) onUnauthorized?.();
    throw new ApiError(
      body.message ?? `Erro ${response.status} ao acessar o servidor.`,
      response.status,
      body.details ?? {},
    );
  }

  return payload as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Ocorreu um erro inesperado.';
}
