import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { QUEUE_NAMES } from '../queues/constant'
import { testStringEqualQueue } from '../queues/testStringEqual'
import { generateQueueId } from '../utils/generator'

const router = new Hono().basePath('/jobs')

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
      body,
      { removeOnComplete: 10, removeOnFail: 50 }
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
