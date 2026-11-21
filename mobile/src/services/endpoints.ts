import type {
  Comment,
  LoginResponse,
  Paginated,
  Post,
  PostInput,
  Role,
  User,
  UserInput,
} from '@/types';
import { request } from './api';

export interface ListParams {
  page?: number;
  limit?: number;
  q?: string;
}

export const authService = {
  login: (email: string, password: string) =>
    request<LoginResponse>('POST', '/auth/login', { body: { email, password } }),
  me: () => request<{ user: User }>('GET', '/auth/me'),
};

export const postService = {
  list: (params: ListParams = {}) =>
    request<Paginated<Post>>('GET', '/posts', { query: { ...params } }),
  get: (id: number) => request<Post>('GET', `/posts/${id}`),
  create: (input: PostInput) => request<Post>('POST', '/posts', { body: input }),
  update: (id: number, input: Partial<PostInput>) =>
    request<Post>('PUT', `/posts/${id}`, { body: input }),
  remove: (id: number) => request<void>('DELETE', `/posts/${id}`),

  listComments: (postId: number) => request<Comment[]>('GET', `/posts/${postId}/comments`),
  addComment: (postId: number, content: string) =>
    request<Comment>('POST', `/posts/${postId}/comments`, { body: { content } }),
  removeComment: (postId: number, commentId: number) =>
    request<void>('DELETE', `/posts/${postId}/comments/${commentId}`),
};

/** Professores e alunos têm o mesmo contrato de API; muda apenas o recurso. */
function createUserService(resource: 'teachers' | 'students') {
  return {
    list: (params: ListParams = {}) =>
      request<Paginated<User>>('GET', `/${resource}`, { query: { ...params } }),
    get: (id: number) => request<User>('GET', `/${resource}/${id}`),
    create: (input: UserInput) => request<User>('POST', `/${resource}`, { body: input }),
    update: (id: number, input: Partial<UserInput>) =>
      request<User>('PUT', `/${resource}/${id}`, { body: input }),
    remove: (id: number) => request<void>('DELETE', `/${resource}/${id}`),
  };
}

export const teacherService = createUserService('teachers');
export const studentService = createUserService('students');

export type UserService = ReturnType<typeof createUserService>;

export const userServiceByRole: Record<Role, UserService> = {
  teacher: teacherService,
  student: studentService,
};
