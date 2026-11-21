import { postRepository } from '../repositories/postRepository.js';
import { commentRepository } from '../repositories/commentRepository.js';
import { forbidden, notFound } from '../utils/HttpError.js';
import { paginated, parsePagination } from '../utils/pagination.js';
import { parseId, validate } from '../utils/validation.js';

const postRules = {
  title: { required: true, min: 3, max: 150, label: 'Título' },
  content: { required: true, min: 10, max: 20000, label: 'Conteúdo' },
  author: { required: true, min: 2, max: 100, label: 'Autor' },
};

function findPostOr404(rawId) {
  const post = postRepository.findById(parseId(rawId));
  if (!post) throw notFound('Post não encontrado.');
  return post;
}

export const postController = {
  list(req, res) {
    const pagination = parsePagination(req.query);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const { rows, total } = postRepository.list({ q, ...pagination });
    res.json(paginated(rows, total, pagination));
  },

  show(req, res) {
    res.json(findPostOr404(req.params.id));
  },

  create(req, res) {
    const data = validate(req.body, postRules);
    const post = postRepository.create({ ...data, authorId: req.user.id });
    res.status(201).json(post);
  },

  update(req, res) {
    const post = findPostOr404(req.params.id);
    const data = validate(req.body, postRules, { partial: true });
    res.json(postRepository.update(post.id, data));
  },

  remove(req, res) {
    const post = findPostOr404(req.params.id);
    postRepository.remove(post.id);
    res.status(204).end();
  },

  listComments(req, res) {
    const post = findPostOr404(req.params.id);
    res.json(commentRepository.listByPost(post.id));
  },

  addComment(req, res) {
    const post = findPostOr404(req.params.id);
    const { content } = validate(req.body, {
      content: { required: true, min: 1, max: 1000, label: 'Comentário' },
    });
    const comment = commentRepository.create({
      postId: post.id,
      userId: req.user.id,
      authorName: req.user.name,
      content,
    });
    res.status(201).json(comment);
  },

  removeComment(req, res) {
    const post = findPostOr404(req.params.id);
    const comment = commentRepository.findById(parseId(req.params.commentId));
    if (!comment || comment.postId !== post.id) throw notFound('Comentário não encontrado.');
    // O autor do comentário ou qualquer professor pode excluir.
    if (req.user.role !== 'teacher' && comment.userId !== req.user.id) {
      throw forbidden('Você só pode excluir seus próprios comentários.');
    }
    commentRepository.remove(comment.id);
    res.status(204).end();
  },
};
