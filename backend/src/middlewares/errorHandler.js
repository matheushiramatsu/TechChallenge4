import { HttpError } from '../utils/HttpError.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Rota ${req.method} ${req.path} não encontrada.` });
}

// O Express identifica o handler de erro pela assinatura com 4 parâmetros.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido no corpo da requisição.' });
  }
  if (/UNIQUE constraint failed: users\.email/.test(err?.message ?? '')) {
    return res.status(409).json({ message: 'Já existe um usuário com este e-mail.' });
  }
  console.error(err);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
}
