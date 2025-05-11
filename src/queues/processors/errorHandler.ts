import { type Job } from 'bullmq'
import { createNewFailedJob } from '../../db/repositories/failedJob'
import { uploadToS3 } from '../../utils/s3'

type ErrorHandlingInput = {
  failedJobId: string
  input?: unknown
  expectedRes: string | Record<string, unknown>
  actualRes: string | Record<string, unknown>
  jobName: string
}

export default async function errorHandlerProcessor(
  job: Job<ErrorHandlingInput, boolean>
) {
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
}
