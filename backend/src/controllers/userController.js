import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository.js';
import { badRequest, conflict, notFound } from '../utils/HttpError.js';
import { paginated, parsePagination } from '../utils/pagination.js';
import { parseId, validate } from '../utils/validation.js';

const SALT_ROUNDS = 10;

/**
 * Gera os handlers de CRUD para um papel de usuário ("teacher" ou "student").
 * Professores e alunos compartilham a tabela `users` e diferem pelo campo `role`.
 * O campo `extra` guarda a disciplina (professor) ou a turma (aluno).
 */
export function createUserController(role, { label, extraLabel }) {
  const rules = {
    name: { required: true, min: 3, max: 100, label: 'Nome' },
    email: { required: true, email: true, max: 120, label: 'E-mail' },
    password: { required: true, min: 6, max: 72, trim: false, label: 'Senha' },
    extra: { max: 100, label: extraLabel },
  };

  function findOr404(rawId) {
    const user = userRepository.findById(parseId(rawId), role);
    if (!user) throw notFound(`${label} não encontrado.`);
    return user;
  }

  function ensureEmailAvailable(email, currentId) {
    const existing = userRepository.findByEmail(email);
    if (existing && existing.id !== currentId) {
      throw conflict('Já existe um usuário com este e-mail.');
    }
  }

  return {
    list(req, res) {
      const pagination = parsePagination(req.query);
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      const { rows, total } = userRepository.list({ role, q, ...pagination });
      res.json(paginated(rows, total, pagination));
    },

    show(req, res) {
      res.json(findOr404(req.params.id));
    },

    async create(req, res) {
      const data = validate(req.body, rules);
      ensureEmailAvailable(data.email);
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
      const user = userRepository.create({ ...data, passwordHash, role });
      res.status(201).json(user);
    },

    async update(req, res) {
      const user = findOr404(req.params.id);
      const data = validate(req.body, rules, { partial: true });
      if (data.email) ensureEmailAvailable(data.email, user.id);
      const passwordHash = data.password
        ? await bcrypt.hash(data.password, SALT_ROUNDS)
        : undefined;
      // `extra` enviado vazio limpa o campo.
      const extra = req.body?.extra === '' ? null : data.extra;
      const { password: _ignored, ...fields } = data;
      res.json(userRepository.update(user.id, { ...fields, extra, passwordHash }));
    },

    remove(req, res) {
      const user = findOr404(req.params.id);
      if (user.id === req.user.id) {
        throw badRequest('Você não pode excluir o seu próprio usuário.');
      }
      userRepository.remove(user.id);
      res.status(204).end();
    },
  };
}
