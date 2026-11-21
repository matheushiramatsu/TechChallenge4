import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../src/app.js';
import { closeDatabase, openDatabase } from '../src/db/database.js';
import { SEED_USERS, seedIfEmpty } from '../src/db/seed.js';

let server;
let baseUrl;
let teacherToken;
let studentToken;

async function api(method, path, { token, body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function login({ email, password }) {
  const res = await api('POST', '/auth/login', { body: { email, password } });
  assert.equal(res.status, 200);
  return res.body.token;
}

before(async () => {
  openDatabase(':memory:');
  const originalLog = console.log;
  console.log = () => {};
  await seedIfEmpty();
  console.log = originalLog;
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  teacherToken = await login(SEED_USERS.teacher);
  studentToken = await login(SEED_USERS.student);
});

after(() => {
  server.close();
  closeDatabase();
});

describe('autenticação', () => {
  it('rejeita senha errada', async () => {
    const res = await api('POST', '/auth/login', {
      body: { email: SEED_USERS.teacher.email, password: 'errada' },
    });
    assert.equal(res.status, 401);
  });

  it('retorna o usuário logado sem o hash da senha', async () => {
    const res = await api('GET', '/auth/me', { token: studentToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'student');
    assert.equal(res.body.user.password_hash, undefined);
  });

  it('rejeita token inválido', async () => {
    const res = await api('GET', '/auth/me', { token: 'abc' });
    assert.equal(res.status, 401);
  });
});

describe('posts', () => {
  let postId;

  it('lista posts paginados sem autenticação', async () => {
    const res = await api('GET', '/posts?page=1&limit=2');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.total, 3);
    assert.equal(res.body.totalPages, 2);
  });

  it('busca posts por palavra-chave', async () => {
    const res = await api('GET', '/posts?q=frações');
    assert.equal(res.body.total, 1);
    assert.match(res.body.data[0].title, /Frações/);
  });

  it('busca ignora acentos e maiúsculas', async () => {
    const res = await api('GET', '/posts?q=FRACOES');
    assert.equal(res.body.total, 1);
  });

  it('aluno não pode criar post', async () => {
    const res = await api('POST', '/posts', {
      token: studentToken,
      body: { title: 'Teste', content: 'Conteúdo de teste', author: 'Aluno' },
    });
    assert.equal(res.status, 403);
  });

  it('valida campos obrigatórios', async () => {
    const res = await api('POST', '/posts', { token: teacherToken, body: { title: 'x' } });
    assert.equal(res.status, 400);
    assert.ok(res.body.details.content);
    assert.ok(res.body.details.author);
  });

  it('professor cria, edita e exclui post', async () => {
    const created = await api('POST', '/posts', {
      token: teacherToken,
      body: { title: 'Novo post', content: 'Conteúdo completo do post.', author: 'Ana Souza' },
    });
    assert.equal(created.status, 201);
    postId = created.body.id;

    const updated = await api('PUT', `/posts/${postId}`, {
      token: teacherToken,
      body: { title: 'Post editado' },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.title, 'Post editado');
    assert.equal(updated.body.content, 'Conteúdo completo do post.');

    const removed = await api('DELETE', `/posts/${postId}`, { token: teacherToken });
    assert.equal(removed.status, 204);
    const missing = await api('GET', `/posts/${postId}`);
    assert.equal(missing.status, 404);
  });

  it('aluno comenta em post', async () => {
    const list = await api('GET', '/posts');
    const id = list.body.data[0].id;
    const res = await api('POST', `/posts/${id}/comments`, {
      token: studentToken,
      body: { content: 'Ótimo post!' },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.authorName, SEED_USERS.student.name);
    const comments = await api('GET', `/posts/${id}/comments`);
    assert.ok(comments.body.some((c) => c.content === 'Ótimo post!'));
  });
});

describe('professores e alunos', () => {
  it('aluno não acessa a listagem de professores', async () => {
    const res = await api('GET', '/teachers', { token: studentToken });
    assert.equal(res.status, 403);
  });

  it('lista professores paginados', async () => {
    const res = await api('GET', '/teachers?limit=2', { token: teacherToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.total, 4);
  });

  it('CRUD completo de aluno', async () => {
    const created = await api('POST', '/students', {
      token: teacherToken,
      body: { name: 'Igor Nunes', email: 'IGOR@escola.com', password: 'segredo1', extra: '7º ano' },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.email, 'igor@escola.com');
    assert.equal(created.body.role, 'student');

    const duplicated = await api('POST', '/students', {
      token: teacherToken,
      body: { name: 'Outro', email: 'igor@escola.com', password: 'segredo1' },
    });
    assert.equal(duplicated.status, 409);

    const updated = await api('PUT', `/students/${created.body.id}`, {
      token: teacherToken,
      body: { name: 'Igor N. Nunes' },
    });
    assert.equal(updated.body.name, 'Igor N. Nunes');
    assert.equal(updated.body.extra, '7º ano');

    // aluno não aparece no endpoint de professores
    const asTeacher = await api('GET', `/teachers/${created.body.id}`, { token: teacherToken });
    assert.equal(asTeacher.status, 404);

    const removed = await api('DELETE', `/students/${created.body.id}`, { token: teacherToken });
    assert.equal(removed.status, 204);
  });

  it('professor não pode excluir a si mesmo', async () => {
    const me = await api('GET', '/auth/me', { token: teacherToken });
    const res = await api('DELETE', `/teachers/${me.body.user.id}`, { token: teacherToken });
    assert.equal(res.status, 400);
  });
});
