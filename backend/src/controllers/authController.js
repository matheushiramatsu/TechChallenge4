import bcrypt from 'bcryptjs';
import { signToken } from '../middlewares/auth.js';
import { userRepository } from '../repositories/userRepository.js';
import { unauthorized } from '../utils/HttpError.js';
import { validate } from '../utils/validation.js';

export const authController = {
  async login(req, res) {
    const { email, password } = validate(req.body, {
      email: { required: true, email: true, label: 'E-mail' },
      password: { required: true, trim: false, label: 'Senha' },
    });

    const row = userRepository.findByEmail(email);
    const valid = row && (await bcrypt.compare(password, row.password_hash));
    if (!valid) throw unauthorized('E-mail ou senha incorretos.');

    const user = userRepository.findById(row.id);
    res.json({ token: signToken(user), user });
  },

  me(req, res) {
    res.json({ user: req.user });
  },
};
