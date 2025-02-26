import { Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono()

// Middleware
app.use('*', logger())

// Health check endpoint
app.get('/healthz', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

export default app 