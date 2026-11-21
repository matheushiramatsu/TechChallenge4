import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { userRepository } from '../repositories/userRepository.js';
import { forbidden, unauthorized } from '../utils/HttpError.js';

function readUser(req) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw unauthorized('Token inválido ou expirado.');
  }
  // Busca o usuário no banco: um usuário excluído perde o acesso imediatamente.
  const user = userRepository.findById(Number(payload.sub));
  if (!user) throw unauthorized('Usuário não encontrado.');
  return user;
}

/** Exige um token JWT válido. Disponibiliza `req.user`. */
export function requireAuth(req, _res, next) {
  const user = readUser(req);
  if (!user) throw unauthorized();
  req.user = user;
  next();
}

/** Lê o token se existir, sem exigir autenticação. */
export function optionalAuth(req, _res, next) {
  req.user = readUser(req) ?? undefined;
  next();
}

/** Exige que o usuário autenticado tenha um dos papéis informados. */
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) {
      throw forbidden('Apenas professores podem realizar esta ação.');
    }
    next();
  };

export function signToken(user) {
  return jwt.sign({ sub: String(user.id), role: user.role, name: user.name }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}
