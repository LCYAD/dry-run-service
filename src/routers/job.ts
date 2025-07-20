import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { QUEUE_NAMES } from '../queues/constant'
import { testJsonEqualQueue } from '../queues/testJsonEqual'
import { testStringEqualQueue } from '../queues/testStringEqual'
import { generateQueueId } from '../utils/generator'

const router = new Hono().basePath('/jobs')

const jobTestStringPostInputSchema = z.object({
  expectedRes: z.string()
})

const jobTestJsonPostInputSchema = z.object({
  expectedRes: z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    age: z.number().int().min(0),
    gender: z.enum(['Male', 'Female', 'Other']),
    email: z.string().email(),
    phone: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      postcode: z.string(),
      country: z.string()
    }),
    enrollment_year: z.number().int(),
    major: z.string(),
    courses: z.array(
      z.object({
        course_id: z.string(),
        course_name: z.string(),
        credits: z.number().int(),
        grade: z.enum(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'])
      })
    ),
    clubs: z.array(z.string()),
    is_graduated: z.boolean()
  })
})

router
  .post(
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
  .post(
    '/test-json-equal',
    zValidator('json', jobTestJsonPostInputSchema),
    async c => {
      const body = c.req.valid('json')
      await testJsonEqualQueue.add(
        generateQueueId(QUEUE_NAMES.TEST_JSON_EQUAL),
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
