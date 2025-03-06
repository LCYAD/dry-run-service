type Env = {
  REDIS_HOST: string
  REDIS_PORT: number
  DATABASE_URL: string
  PORT: number
  NODE_ENV: string
  S3_URL: string
  S3_REGION: string
  S3_ACCEESS_ID: string
  S3_SECRET_KEY: string
}

export const env: Env = {
  REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
  REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  S3_URL: process.env.S3_URL ?? 'http://localhost:9000',
  S3_REGION: process.env.S3_REGION ?? 'us-east-1',
  S3_ACCEESS_ID: process.env.S3_ACCEESS_ID ?? 'minioadmin',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY ?? 'minioadmin'
}
