import { createApp } from './app.js';
import { config } from './config.js';
import { openDatabase } from './db/database.js';
import { seedIfEmpty } from './db/seed.js';

openDatabase(config.dbFile);
if (config.seedOnStart) await seedIfEmpty();

createApp().listen(config.port, '0.0.0.0', () => {
  console.log(`API do Blog Escolar rodando em http://localhost:${config.port}`);
});
