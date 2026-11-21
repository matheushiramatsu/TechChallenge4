# Blog Escolar: app mobile

App React Native (Expo SDK 58 + Expo Router + TypeScript).

```bash
npm install
npm start          # QR Code para o Expo Go; "a" abre o Android, "i" o iOS, "w" a web
npm run typecheck
npm run lint
```

A API precisa estar rodando (veja `../backend`). Para definir a URL da API manualmente, copie
`.env.example` para `.env` e preencha `EXPO_PUBLIC_API_URL`.

A documentação completa (setup, arquitetura e guia de uso) está no [README principal](../README.md).
