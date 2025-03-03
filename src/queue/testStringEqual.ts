import { Queue, Worker, type Job } from 'bullmq'
import { type StringEqualQueueInput } from '../routers/job'
import { QUEUE_NAMES } from './constant'
import { connection } from './ioredis'

export const testStringEqualQueue = new Queue(QUEUE_NAMES.TEST_STRING_EQUAL, {
  connection
})

// directly setting up the worker inside the queue
// TODO: separate the worker from the queue
new Worker(
  QUEUE_NAMES.TEST_STRING_EQUAL,
  async (_job: Job<StringEqualQueueInput, boolean>) => {
    // delay execution between 1 to 5 seconds
    await new Promise(resolve =>
      setTimeout(resolve, Math.floor(Math.random() * 4000) + 1000)
    )
    // TODO: add logic to test the string equality
    return true
  },
  { connection }
)
