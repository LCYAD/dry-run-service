import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'

// Type declarations for runtime globals
declare global {
  var Bun: { serve: Function } | undefined
  var Deno: { serve: Function; env: { get: (key: string) => string | undefined } } | undefined
}

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

// Determine the port from environment variable or use default
const port = (typeof process !== 'undefined' ? process.env.PORT : Deno?.env.get('PORT')) ?? 3000

// Start the server based on the runtime
if (typeof Bun !== 'undefined') {
  Bun.serve({
    fetch: app.fetch,
    port: Number(port)
  })
} else if (typeof Deno !== 'undefined') {
  Deno.serve({
    port: Number(port),
    handler: app.fetch
  })
} else {
  serve({
    fetch: app.fetch,
    port: Number(port)
  })
}

console.log(`Server is running on port ${port}`)