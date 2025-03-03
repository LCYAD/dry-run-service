declare global {
  var Bun: {
    serve: (options: {
      port: number
      fetch: (request: Request) => Response | Promise<Response>
    }) => void
  }
}

import app from './app'
import { env } from './env'

const port = env.PORT ?? 3000

Bun.serve({
  fetch: app.fetch,
  port: Number(port)
})

console.log(`Bun server is running on port ${port}`)
