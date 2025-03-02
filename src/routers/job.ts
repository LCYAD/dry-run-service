import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

const router = new Hono().basePath('/job')

const jobTestStringPostInputSchema = z.object({
  expectedRes: z.string()
})

router.post(
  '/test-string-equal',
  zValidator('json', jobTestStringPostInputSchema),
  async c => {
    // TODO: add job to queue
    return c.json(
      {
        message: 'Job Created!'
      },
      201
    )
  }
)

export type StringEqualQueueInput = z.infer<typeof jobTestStringPostInputSchema>

export default router
