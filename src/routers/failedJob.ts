import { zValidator } from '@hono/zod-validator'

import { Hono } from 'hono'
import { z } from 'zod'
import {
  deleteFailedJobById,
  getFailedJobById,
  getFailedJobCount,
  getPaginatedFailedJobs
} from '../db/repositories/failedJob'
import { deleteS3Object } from '../utils/s3'

const router = new Hono().basePath('/failed-jobs')

const failedJobsGetQueryParamSchema = z.object({
  page: z.coerce.number().gte(1).optional().default(1),
  limit: z.coerce.number().gte(1).lte(100).optional().default(30)
})

const failedJobsDeleteByIdParamSchema = z.object({
  id: z.coerce.number()
})

router
  .get('/', zValidator('query', failedJobsGetQueryParamSchema), async c => {
    const query = c.req.valid('query')

    const [jobs, totalCount] = await Promise.all([
      getPaginatedFailedJobs(query.page, query.limit),
      getFailedJobCount()
    ])

    return c.json({
      data: jobs,
      pagination: {
        currentPage: query.page,
        totalPages: Math.ceil(totalCount[0].count / query.limit),
        totalItems: totalCount[0].count,
        itemsPerPage: query.limit
      }
    })
  })
  .delete(
    '/:id',
    zValidator('param', failedJobsDeleteByIdParamSchema),
    async c => {
      const { id } = c.req.valid('param')

      const job = await getFailedJobById(id)

      if (job.length === 0) {
        return c.json({ message: 'Failed job not found' }, 404)
      }

      // Delete S3 object first
      const s3Result = await deleteS3Object('failed-job-data', job[0].s3Key)

      if (!s3Result.success) {
        return c.json({ message: 'Failed to delete S3 object' }, 500)
      }

      // Delete from database
      await deleteFailedJobById(id)

      return c.json({ message: 'Failed job deleted successfully' }, 200)
    }
  )

export default router
