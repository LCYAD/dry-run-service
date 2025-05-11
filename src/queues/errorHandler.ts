import { Queue, Worker } from 'bullmq'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connection } from './ioredis'
import errorHandlerProcessor from './processors/errorHandler'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const queueName = 'error-handling'

export const errorHandlingQueue = new Queue(queueName, {
  connection
})

if (typeof Deno !== 'undefined') {
  // Deno environment: Use Worker with function directly
  new Worker(queueName, errorHandlerProcessor, {
    connection,
    concurrency: 5
  })
} else {
  // Node.js environment: Use sandboxed processor
  const isTsEnvironment = __filename.endsWith('.ts')
  const processorFile = path.join(
    __dirname,
    'processors',
    `errorHandler.${isTsEnvironment ? 'ts' : 'js'}`
  )
  new Worker(queueName, processorFile, {
    connection,
    concurrency: 5
  })
}
