import { type Job } from 'bullmq'
import { type StringEqualQueueInput } from '../../routers/job'
import { QUEUE_NAMES } from '../constant'
import { errorHandlingQueue } from '../errorHandler'

export default async function testStringEqualProcessor(
  job: Job<StringEqualQueueInput, boolean>
) {
  // TODO: find an actual endpoint to call
  const expectedRes = job.data.expectedRes
  if (expectedRes !== 'test1') {
    await errorHandlingQueue.add(
      `error-${job.name}`,
      {
        ...job.data,
        actualRes: 'test1',
        failedJobId: job.name,
        jobName: QUEUE_NAMES.TEST_STRING_EQUAL
      },
      {
        removeOnComplete: true
      }
    )
  }
  return true
}
