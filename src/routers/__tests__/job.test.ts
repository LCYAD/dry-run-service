import { Hono } from 'hono'
import { beforeEach, describe, expect, it } from 'vitest'
import jobRouter from '../job'

describe('Job Router', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.route('/', jobRouter)
  })

  describe('POST /job/test-string-equal', () => {
    it('should create a job successfully with valid input', async () => {
      const res = await app.request('/job/test-string-equal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expectedRes: 'test string'
        })
      })

      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data).toEqual({
        message: 'Job Created!'
      })
    })

    it('should return 400 for missing expectedRes field', async () => {
      const res = await app.request('/job/test-string-equal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Missing expectedRes field
        })
      })

      expect(res.status).toBe(400)
    })

    it('should return 400 for wrong expectedRes types', async () => {
      const res = await app.request('/job/test-string-equal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expectedRes: 123 // Should be string, not number
        })
      })

      expect(res.status).toBe(400)
    })
  })
})
