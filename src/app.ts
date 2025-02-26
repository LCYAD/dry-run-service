import { Hono } from 'hono'
import { logger } from 'hono/logger'
import healthRouter from './routers/health'

const app = new Hono()

// Middleware
app.use('*', logger())

// Mount routers
app.route('/', healthRouter)

export default app
