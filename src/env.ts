type Env = {
  REDIS_HOST: string
  REDIS_PORT: number
  DATABASE_URL: string
  PORT: number
}

export const env: Env = {
  REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
  REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000
}
