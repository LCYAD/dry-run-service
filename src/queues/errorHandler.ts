import { Queue, Worker, type Job } from 'bullmq'
import { createNewFailedJob } from '../db/repositories/failedJob'
import { uploadToS3 } from '../utils/s3'
import { connection } from './ioredis'

const queueName = 'error-handling'

export const errorHandlingQueue = new Queue(queueName, {
  connection
})

type ErrorHandlingInput = {
  failedJobId: string
  input?: unknown
  expectedRes: string | Record<string, unknown>
  actualRes: string | Record<string, unknown>
  jobName: string
}

// directly setting up the worker inside the queue
new Worker(
  queueName,
  async (job: Job<ErrorHandlingInput, boolean>) => {
    const s3KeyErrorHandling = `${job.data.jobName}/${job.data.failedJobId}.json`

    const s3UploadRes = await uploadToS3(
      'failed-job-data',
      s3KeyErrorHandling,
      JSON.stringify(job.data)
    )

    if (!s3UploadRes.success) return false

    await createNewFailedJob({
      jobId: job.data.failedJobId,
      jobName: job.data.jobName,
      s3Key: s3KeyErrorHandling
    })

    return true
  },
  { connection }
)
