const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET é obrigatório em produção.');
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-nao-usar-em-producao',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  dbFile: process.env.DB_FILE || './data/blog.db',
  seedOnStart: (process.env.SEED_ON_START ?? 'true') === 'true',
};
