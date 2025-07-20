import { Queue, Worker } from 'bullmq'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { QUEUE_NAMES } from './constant'
import { connection } from './ioredis'
import testingJsonEqualProcessor from './processors/testJsonEqual'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const testJsonEqualQueue = new Queue(QUEUE_NAMES.TEST_JSON_EQUAL, {
  connection
})

if (typeof Deno !== 'undefined') {
  // Deno environment: Use Worker with function directly
  new Worker(QUEUE_NAMES.TEST_JSON_EQUAL, testingJsonEqualProcessor, {
    connection,
    concurrency: 5
  })
} else {
  // Node.js environment: Use sandboxed processor
  const isTsEnvironment = __filename.endsWith('.ts')
  const processorFile = path.join(
    __dirname,
    'processors',
    `testJsonEqual.${isTsEnvironment ? 'ts' : 'js'}`
  )
  new Worker(QUEUE_NAMES.TEST_JSON_EQUAL, processorFile, {
    connection,
    concurrency: 5
  })
}
