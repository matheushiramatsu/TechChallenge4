import { getDb } from '../db/database.js';

const COLUMNS = `id, post_id AS postId, user_id AS userId, author_name AS authorName,
  content, created_at AS createdAt`;

export const commentRepository = {
  listByPost(postId) {
    return getDb()
      .prepare(`SELECT ${COLUMNS} FROM comments WHERE post_id = ? ORDER BY created_at ASC, id ASC`)
      .all(postId);
  },

  findById(id) {
    return getDb().prepare(`SELECT ${COLUMNS} FROM comments WHERE id = ?`).get(id);
  },

  create({ postId, userId, authorName, content }) {
    const { lastInsertRowid } = getDb()
      .prepare('INSERT INTO comments (post_id, user_id, author_name, content) VALUES (?, ?, ?, ?)')
      .run(postId, userId, authorName, content);
    return this.findById(Number(lastInsertRowid));
  },

  remove(id) {
    return getDb().prepare('DELETE FROM comments WHERE id = ?').run(id).changes > 0;
  },
};
