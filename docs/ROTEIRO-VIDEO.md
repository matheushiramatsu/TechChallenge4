# Roteiro da apresentação gravada (até 15 minutos)

| Tempo | Parte | O que mostrar |
|---|---|---|
| 0:00 a 1:00 | Abertura | Quem é a equipe, o problema e o objetivo da fase. |
| 1:00 a 3:00 | Arquitetura | Diagrama do README e as pastas de `mobile/src` e `backend/src`. |
| 3:00 a 4:00 | Como rodar | `npm start` na API e no app. Abrir no Expo Go pelo QR Code. |
| 4:00 a 7:30 | Professor | Login. Busca por "fracoes" com o destaque em amarelo. Leitura e comentário. Escrever e editar um post. Tela Gerenciar. Cadastrar, editar e excluir um professor. O mesmo fluxo em Alunos. |
| 7:30 a 9:00 | Aluno | Sair e entrar como aluno. Mostrar que só existem as abas Posts e Conta, que dá para comentar e que não há botões de edição. |
| 9:00 a 12:30 | Código | `_layout.tsx` (regras de acesso), `AuthContext` (sessão e SecureStore), `api.ts` (token e 401), hooks de lista, `UserListScreen` e `UserFormScreen`, `theme.ts` e `Notebook.tsx`, e as rotas da API com `requireRole`. |
| 12:30 a 13:30 | Qualidade | Rodar `npm test` na API, e `npm run typecheck` e `npm run lint` no app. |
| 13:30 a 15:00 | Encerramento | Desafios e aprendizados (seção 4 da documentação) e próximos passos. |

Antes de gravar:

- Rode `npm run seed` para começar com os dados iniciais.
- Para mostrar a tela do celular, espelhe o aparelho (por exemplo, com o scrcpy no Android) ou use
  um emulador.
