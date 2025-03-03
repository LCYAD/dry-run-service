import { type Config } from 'drizzle-kit'
import { env } from './src/env'

export default {
  schema: './src/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: env.DATABASE_URL ?? ''
  }
} satisfies Config
