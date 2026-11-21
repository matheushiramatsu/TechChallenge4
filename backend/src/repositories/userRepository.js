import { getDb } from '../db/database.js';

const PUBLIC_COLUMNS = 'id, name, email, role, extra, created_at AS createdAt, updated_at AS updatedAt';

import { likeClause, likeTerm } from '../utils/search.js';

export const userRepository = {
  findByEmail(email) {
    return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findById(id, role) {
    const sql = role
      ? `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ? AND role = ?`
      : `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ?`;
    return role ? getDb().prepare(sql).get(id, role) : getDb().prepare(sql).get(id);
  },

  list({ role, q, limit, offset }) {
    const where = ['role = ?'];
    const params = [role];
    if (q) {
      where.push(likeClause(['name', 'email']));
      params.push(likeTerm(q), likeTerm(q));
    }
    const whereSql = where.join(' AND ');
    const db = getDb();
    const { total } = db.prepare(`SELECT COUNT(*) AS total FROM users WHERE ${whereSql}`).get(...params);
    const rows = db
      .prepare(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE ${whereSql} ORDER BY name COLLATE NOCASE LIMIT ? OFFSET ?`)
      .all(...params, limit, offset);
    return { rows, total };
  },

  create({ name, email, passwordHash, role, extra }) {
    const { lastInsertRowid } = getDb()
      .prepare('INSERT INTO users (name, email, password_hash, role, extra) VALUES (?, ?, ?, ?, ?)')
      .run(name, email, passwordHash, role, extra ?? null);
    return this.findById(Number(lastInsertRowid));
  },

  update(id, { name, email, passwordHash, extra }) {
    const sets = [];
    const params = [];
    if (name !== undefined) { sets.push('name = ?'); params.push(name); }
    if (email !== undefined) { sets.push('email = ?'); params.push(email); }
    if (passwordHash !== undefined) { sets.push('password_hash = ?'); params.push(passwordHash); }
    if (extra !== undefined) { sets.push('extra = ?'); params.push(extra); }
    if (sets.length > 0) {
      sets.push("updated_at = datetime('now')");
      getDb().prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
    }
    return this.findById(id);
  },

  remove(id) {
    return getDb().prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0;
  },

  count() {
    return getDb().prepare('SELECT COUNT(*) AS total FROM users').get().total;
  },
};
