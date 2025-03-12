import { desc, sql, type InferSelectModel } from 'drizzle-orm'
import { db } from '../db'
import { failedJobs } from '../schema'

export const getPaginatedFailedJobs = (page: number, limit: number) => {
  const offset = (page - 1) * limit
  return db
    .select()
    .from(failedJobs)
    .orderBy(desc(failedJobs.createdAt))
    .limit(limit)
    .offset(offset)
}

export const getFailedJobCount = () =>
  db.select({ count: sql<number>`count(*)` }).from(failedJobs)

export const createNewFailedJob = ({
  jobId,
  jobName,
  s3Key
}: Pick<InferSelectModel<typeof failedJobs>, 'jobId' | 'jobName' | 's3Key'>) =>
  db.insert(failedJobs).values({
    jobId,
    jobName,
    s3Key
  })
