declare global {
  var Bun: { serve: Function }
}

import app from './app'

const port = process.env.PORT ?? 3000

Bun.serve({
  fetch: app.fetch,
  port: Number(port)
})

console.log(`Bun server is running on port ${port}`)
