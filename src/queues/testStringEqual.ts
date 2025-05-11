import { Queue, Worker } from 'bullmq'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { QUEUE_NAMES } from './constant'
import { connection } from './ioredis'
import testStringEqualProcessor from './processors/testStringEqual'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const testStringEqualQueue = new Queue(QUEUE_NAMES.TEST_STRING_EQUAL, {
  connection
})

if (typeof Deno !== 'undefined') {
  // Deno environment: Use Worker with function directly
  new Worker(QUEUE_NAMES.TEST_STRING_EQUAL, testStringEqualProcessor, {
    connection,
    concurrency: 5
  })
} else {
  // Node.js environment: Use sandboxed processor
  const isTsEnvironment = __filename.endsWith('.ts')
  const processorFile = path.join(
    __dirname,
    'processors',
    `testStringEqual.${isTsEnvironment ? 'ts' : 'js'}`
  )
  new Worker(QUEUE_NAMES.TEST_STRING_EQUAL, processorFile, {
    connection,
    concurrency: 5
  })
}
