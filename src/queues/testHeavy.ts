import { Queue, Worker } from 'bullmq'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { QUEUE_NAMES } from './constant'
import { connection } from './ioredis'
import testingJsonEqualProcessor from './processors/testNoAction'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const testHeavyQueue = new Queue(QUEUE_NAMES.TEST_HEAVY, {
  connection
})

if (typeof Deno !== 'undefined') {
  // Deno environment: Use Worker with function directly
  new Worker(QUEUE_NAMES.TEST_HEAVY, testingJsonEqualProcessor, {
    connection,
    concurrency: 5
  })
} else {
  // Node.js environment: Use sandboxed processor
  const isTsEnvironment = __filename.endsWith('.ts')
  const processorFile = path.join(
    __dirname,
    'processors',
    `testNoAction.${isTsEnvironment ? 'ts' : 'js'}`
  )
  new Worker(QUEUE_NAMES.TEST_HEAVY, processorFile, {
    connection,
    concurrency: 5
  })
}
