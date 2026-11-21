import { badRequest } from './HttpError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida um objeto contra regras simples.
 * rules: { campo: { required, min, max, email, label } }
 * Com `partial = true`, campos ausentes são ignorados (útil para updates).
 */
export function validate(body, rules, { partial = false } = {}) {
  const errors = {};
  const clean = {};
  const input = body ?? {};

  for (const [field, rule] of Object.entries(rules)) {
    const label = rule.label ?? field;
    let value = input[field];

    if (value === undefined || value === null || value === '') {
      if (rule.required && !partial) errors[field] = `${label} é obrigatório.`;
      continue;
    }
    if (typeof value !== 'string') {
      errors[field] = `${label} deve ser texto.`;
      continue;
    }
    value = rule.trim === false ? value : value.trim();
    if (rule.min && value.length < rule.min) {
      errors[field] = `${label} deve ter ao menos ${rule.min} caracteres.`;
    } else if (rule.max && value.length > rule.max) {
      errors[field] = `${label} deve ter no máximo ${rule.max} caracteres.`;
    } else if (rule.email && !EMAIL_RE.test(value)) {
      errors[field] = `${label} inválido.`;
    } else {
      clean[field] = rule.email ? value.toLowerCase() : value;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw badRequest('Dados inválidos.', errors);
  }
  return clean;
}

export function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  if (!Number.isInteger(id) || id <= 0 || String(id) !== String(raw)) {
    throw badRequest('Identificador inválido.');
  }
  return id;
}
