export type Role = 'teacher' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  /** Disciplina (professor) ou turma (aluno). */
  extra: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number | null;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PostInput {
  title: string;
  content: string;
  author: string;
}

export interface UserInput {
  name: string;
  email: string;
  /** Obrigatória na criação; opcional na edição (vazia mantém a senha atual). */
  password?: string;
  extra?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
