import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import jobRouter from '../job'

const queueMock = vi.hoisted(() => ({
  add: vi.fn()
}))

// Mock the queue
vi.mock('../../queue/testStringEqual', () => ({
  testStringEqualQueue: queueMock
}))

describe('Job Router', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.route('/', jobRouter)
    // Clear mock calls between tests
    vi.clearAllMocks()
  })

  describe('POST /job/test-string-equal', () => {
    describe('sucess case', () => {
      it('should create a job successfully with valid input', async () => {
        const expectedRes = 'test string'
        const res = await app.request('/job/test-string-equal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            expectedRes
          })
        })

        expect(res.status).toBe(201)
        const data = await res.json()
        expect(data).toEqual({
          message: 'Job Created!'
        })

        // Verify queue interaction
        expect(queueMock.add).toHaveBeenCalledTimes(1)

        // Verify the job ID format and payload
        const mockCall = vi.mocked(queueMock.add).mock.calls[0] as [
          string,
          { expectedRes: string }
        ]
        const [jobId, payload] = mockCall
        expect(jobId).toMatch(/^test-string-equal-[A-Za-z0-9]{10}$/)
        expect(payload).toEqual({ expectedRes })
      })
    })

    describe('error case', () => {
      it('should return 400 for missing expectedRes field', async () => {
        const res = await app.request('/job/test-string-equal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        })

        expect(res.status).toBe(400)
        expect(queueMock.add).not.toHaveBeenCalled()
      })

      it('should return 400 for wrong expectedRes type', async () => {
        const res = await app.request('/job/test-string-equal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            expectedRes: 123
          })
        })

        expect(res.status).toBe(400)
        expect(queueMock.add).not.toHaveBeenCalled()
      })

      it('should return 400 for non-JSON content type', async () => {
        const res = await app.request('/job/test-string-equal', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: 'test string'
        })

        expect(res.status).toBe(400)
        expect(queueMock.add).not.toHaveBeenCalled()
      })
    })
  })
})
