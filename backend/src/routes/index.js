import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { postController } from '../controllers/postController.js';
import { createUserController } from '../controllers/userController.js';
import { optionalAuth, requireAuth, requireRole } from '../middlewares/auth.js';

const onlyTeacher = [requireAuth, requireRole('teacher')];

function userRoutes(controller) {
  const router = Router();
  router.get('/', onlyTeacher, controller.list);
  router.get('/:id', onlyTeacher, controller.show);
  router.post('/', onlyTeacher, controller.create);
  router.put('/:id', onlyTeacher, controller.update);
  router.delete('/:id', onlyTeacher, controller.remove);
  return router;
}

export function buildRoutes() {
  const router = Router();

  router.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Autenticação
  router.post('/auth/login', authController.login);
  router.get('/auth/me', requireAuth, authController.me);

  // Posts: leitura pública, escrita apenas para professores
  router.get('/posts', optionalAuth, postController.list);
  router.get('/posts/search', optionalAuth, postController.list); // compatível com a fase 2
  router.get('/posts/:id', optionalAuth, postController.show);
  router.post('/posts', onlyTeacher, postController.create);
  router.put('/posts/:id', onlyTeacher, postController.update);
  router.delete('/posts/:id', onlyTeacher, postController.remove);

  // Comentários: leitura pública, escrita para qualquer usuário autenticado
  router.get('/posts/:id/comments', postController.listComments);
  router.post('/posts/:id/comments', requireAuth, postController.addComment);
  router.delete('/posts/:id/comments/:commentId', requireAuth, postController.removeComment);

  // Administração de professores e alunos (apenas professores)
  router.use(
    '/teachers',
    userRoutes(createUserController('teacher', { label: 'Professor', extraLabel: 'Disciplina' })),
  );
  router.use(
    '/students',
    userRoutes(createUserController('student', { label: 'Aluno', extraLabel: 'Turma' })),
  );

  return router;
}
