/** Remove acentos e coloca em minúsculas: "Frações" -> "fracoes". */
export function normalizeText(value) {
  if (value === null || value === undefined) return value;
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Monta o termo para `LIKE ... ESCAPE '!'`, escapando os curingas % e _.
 * A comparação usa a função SQL `normalize_text` (registrada em database.js),
 * então a busca ignora acentos e maiúsculas/minúsculas.
 */
export function likeTerm(q) {
  return `%${normalizeText(q).replace(/[!%_]/g, (c) => `!${c}`)}%`;
}

/** Gera "normalize_text(col) LIKE ? ESCAPE '!'" para cada coluna, unidas por OR. */
export function likeClause(columns) {
  return `(${columns.map((c) => `normalize_text(${c}) LIKE ? ESCAPE '!'`).join(' OR ')})`;
}
