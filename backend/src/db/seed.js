import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'node:url';
import { config } from '../config.js';
import { closeDatabase, getDb, openDatabase } from './database.js';
import { userRepository } from '../repositories/userRepository.js';
import { postRepository } from '../repositories/postRepository.js';
import { commentRepository } from '../repositories/commentRepository.js';

export const SEED_USERS = {
  teacher: { name: 'Ana Souza', email: 'professor@escola.com', password: 'professor123', extra: 'Matemática' },
  student: { name: 'Bruno Lima', email: 'aluno@escola.com', password: 'aluno123', extra: '9º ano A' },
};

const extraTeachers = [
  ['Carlos Pereira', 'carlos@escola.com', 'História'],
  ['Daniela Rocha', 'daniela@escola.com', 'Português'],
  ['Eduardo Martins', 'eduardo@escola.com', 'Física'],
];

const extraStudents = [
  ['Fernanda Alves', 'fernanda@escola.com', '9º ano A'],
  ['Gabriel Costa', 'gabriel@escola.com', '9º ano B'],
  ['Helena Dias', 'helena@escola.com', '8º ano A'],
];

const posts = [
  {
    title: 'Bem-vindos ao Blog Escolar!',
    content:
      'Este é o espaço oficial para compartilhar conteúdos das aulas, avisos e materiais de estudo. ' +
      'Professores publicam e alunos acompanham tudo pelo celular. Use a busca para encontrar posts por palavra-chave.',
  },
  {
    title: 'Frações no dia a dia',
    content:
      'Frações estão presentes em receitas, no relógio e até no troco do mercado. ' +
      'Nesta aula vamos revisar soma e subtração de frações com denominadores diferentes, usando o MMC. ' +
      'Exercício: quanto é 1/3 + 1/4? Deixe sua resposta nos comentários!',
  },
  {
    title: 'Dicas para a semana de provas',
    content:
      'Organize um cronograma, revise um pouco por dia e durma bem. ' +
      'Faça resumos com suas próprias palavras e resolva exercícios antigos. ' +
      'Dúvidas? Procure o professor da disciplina no plantão de quinta-feira.',
  },
];

async function createUser(role, { name, email, password, extra }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return userRepository.create({ name, email, passwordHash, role, extra });
}

/** Popula o banco com dados de exemplo caso ainda não exista nenhum usuário. */
export async function seedIfEmpty() {
  if (userRepository.count() > 0) return false;

  const teacher = await createUser('teacher', SEED_USERS.teacher);
  const student = await createUser('student', SEED_USERS.student);
  for (const [name, email, extra] of extraTeachers) {
    await createUser('teacher', { name, email, password: 'professor123', extra });
  }
  for (const [name, email, extra] of extraStudents) {
    await createUser('student', { name, email, password: 'aluno123', extra });
  }

  const created = posts.map((p) => postRepository.create({ ...p, author: teacher.name, authorId: teacher.id }));
  commentRepository.create({
    postId: created[1].id,
    userId: student.id,
    authorName: student.name,
    content: 'Professora, deu 7/12!',
  });

  console.log('Banco populado com dados de exemplo.');
  return true;
}

function resetDatabase() {
  getDb().exec('DELETE FROM comments; DELETE FROM posts; DELETE FROM users;');
}

// Execução direta: `npm run seed` (apaga os dados e popula novamente).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  openDatabase(config.dbFile);
  if (process.argv.includes('--reset')) resetDatabase();
  await seedIfEmpty();
  closeDatabase();
}
