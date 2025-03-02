import { Hono } from 'hono'
import { logger } from 'hono/logger'
import healthRouter from './routers/health'
import jobRouter from './routers/job'

const app = new Hono()

// Middleware
app.use('*', logger())

// Mount routers
app.route('/', healthRouter)
app.route('/', jobRouter)

export default app
