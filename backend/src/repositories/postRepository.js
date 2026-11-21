import { getDb } from '../db/database.js';

const COLUMNS = `id, title, content, author, author_id AS authorId,
  created_at AS createdAt, updated_at AS updatedAt`;

import { likeClause, likeTerm } from '../utils/search.js';

export const postRepository = {
  list({ q, limit, offset }) {
    const params = [];
    let where = '';
    if (q) {
      where = `WHERE ${likeClause(['title', 'content', 'author'])}`;
      params.push(likeTerm(q), likeTerm(q), likeTerm(q));
    }
    const db = getDb();
    const { total } = db.prepare(`SELECT COUNT(*) AS total FROM posts ${where}`).get(...params);
    const rows = db
      .prepare(`SELECT ${COLUMNS} FROM posts ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset);
    return { rows, total };
  },

  findById(id) {
    return getDb().prepare(`SELECT ${COLUMNS} FROM posts WHERE id = ?`).get(id);
  },

  create({ title, content, author, authorId }) {
    const { lastInsertRowid } = getDb()
      .prepare('INSERT INTO posts (title, content, author, author_id) VALUES (?, ?, ?, ?)')
      .run(title, content, author, authorId ?? null);
    return this.findById(Number(lastInsertRowid));
  },

  update(id, fields) {
    const sets = [];
    const params = [];
    for (const key of ['title', 'content', 'author']) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }
    if (sets.length > 0) {
      sets.push("updated_at = datetime('now')");
      getDb().prepare(`UPDATE posts SET ${sets.join(', ')} WHERE id = ?`).run(...params, id);
    }
    return this.findById(id);
  },

  remove(id) {
    return getDb().prepare('DELETE FROM posts WHERE id = ?').run(id).changes > 0;
  },
};
