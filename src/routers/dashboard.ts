import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import {
  getFailedJobCount,
  getPaginatedFailedJobs
} from '../db/repositories/failedJob'
import { createDashboardTemplate } from '../views/'
import { createFailedJobListTemplate } from '../views/failedJob'

const router = new Hono().basePath('/dashboard')

const failedJobsGetQueryParamSchema = z.object({
  page: z.coerce.number().gte(1).optional().default(1),
  limit: z.coerce.number().gte(1).lte(100).optional().default(30)
})

router
  .get('/', async c => {
    const html = createDashboardTemplate()
    return c.html(html)
  })
  .get(
    '/failed-jobs',
    zValidator('query', failedJobsGetQueryParamSchema),
    async c => {
      const query = c.req.valid('query')

      const [jobs] = await Promise.all([
        getPaginatedFailedJobs(query.page, query.limit),
        getFailedJobCount()
      ])

      const html = createFailedJobListTemplate(jobs)
      return c.html(html)
    }
  )

export default router
