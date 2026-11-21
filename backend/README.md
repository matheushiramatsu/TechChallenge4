# Blog Escolar: API

API REST (Node.js + Express 5 + SQLite nativo) usada pelo app mobile.

```bash
npm install
npm start        # http://localhost:3000 (cria e popula o banco na primeira execução)
npm run dev      # reinicia ao salvar arquivos
npm run seed     # apaga os dados e popula novamente
npm test         # testes de integração
```

Requer **Node.js 22.13 ou mais recente**. As variáveis de ambiente estão em `.env.example`.
A documentação completa (arquitetura, endpoints e permissões) está no [README principal](../README.md#5-referência-da-api).
