import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { QUEUE_NAMES } from '../queue/constant'
import { testStringEqualQueue } from '../queue/testStringEqual'
import { generateQueueId } from '../util/generator'

const router = new Hono().basePath('/job')

const jobTestStringPostInputSchema = z.object({
  expectedRes: z.string()
})

router.post(
  '/test-string-equal',
  zValidator('json', jobTestStringPostInputSchema),
  async c => {
    const body = c.req.valid('json')
    await testStringEqualQueue.add(
      generateQueueId(QUEUE_NAMES.TEST_STRING_EQUAL),
      body
    )
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
