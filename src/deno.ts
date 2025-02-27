declare global {
  var Deno: {
    serve: (options: {
      port: number
      handler: (request: Request) => Response | Promise<Response>
    }) => void
    env: { get: (key: string) => string | undefined }
  }
}

import app from './app'

const port = Deno.env.get('PORT') ?? 3000

Deno.serve({
  port: Number(port),
  handler: app.fetch
})

console.log(`Deno server is running on port ${port}`)
