import { Queue, Worker, type Job } from 'bullmq'
import { type StringEqualQueueInput } from '../routers/job'
import { QUEUE_NAMES } from './constant'
import { errorHandlingQueue } from './errorHandler'
import { connection } from './ioredis'

export const testStringEqualQueue = new Queue(QUEUE_NAMES.TEST_STRING_EQUAL, {
  connection
})

// directly setting up the worker inside the queue
// TODO: separate the worker from the queue
new Worker(
  QUEUE_NAMES.TEST_STRING_EQUAL,
  async (job: Job<StringEqualQueueInput, boolean>) => {
    // TODO: find an actual endpoint to call
    const expectedRes = job.data.expectedRes
    if (expectedRes !== 'test1') {
      await errorHandlingQueue.add(`error-${job.name}`, {
        ...job.data,
        actualRes: 'test1',
        failedJobId: job.name,
        jobName: QUEUE_NAMES.TEST_STRING_EQUAL
      })
    }
    return true
  },
  { connection }
)
