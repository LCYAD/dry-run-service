import { zValidator } from '@hono/zod-validator'

import { Hono } from 'hono'
import { z } from 'zod'
import {
  getFailedJobCount,
  getPaginatedFailedJobs
} from '../db/repositories/failedJob'

const router = new Hono().basePath('/failed-jobs')

const failedJobsGetQueryParamSchema = z.object({
  page: z.coerce.number().gte(1).optional().default(1),
  limit: z.coerce.number().gte(1).lte(100).optional().default(30)
})

router.get('/', zValidator('query', failedJobsGetQueryParamSchema), async c => {
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

export default router
