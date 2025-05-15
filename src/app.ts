import { createBullBoard } from '@bull-board/api'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { logger } from 'hono/logger'

// NOTE: switch commented line below for DENO only (since the package is already converted to ESM)
// import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'

import { HonoAdapter } from '@bull-board/hono'
import { testStringEqualQueue } from './queues/testStringEqual'
import dashboardRouter from './routers/dashboard'
import failedJobRouter from './routers/failedJob'
import healthRouter from './routers/health'
import jobRouter from './routers/job'

const serverAdapter = new HonoAdapter(serveStatic)

createBullBoard({
  queues: [new BullMQAdapter(testStringEqualQueue)],
  serverAdapter
})

serverAdapter.setBasePath('/bull-board')

const app = new Hono()

// Middleware
app.use('*', logger())

// Mount routers
app.route('/', healthRouter)
app.route('/', jobRouter)
app.route('/', failedJobRouter)
app.route('/', dashboardRouter)

// @ts-expect-error it works but types are not correct
app.route('/bull-board', serverAdapter.registerPlugin())

export default app
