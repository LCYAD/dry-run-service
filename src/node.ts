import { serve } from '@hono/node-server'
import app from './app'

const port = process.env.PORT ?? 3000

serve({
  fetch: app.fetch,
  port: Number(port)
})

console.log(`Node.js server is running on port ${port}`) 