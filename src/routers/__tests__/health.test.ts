import { describe, it, expect } from 'vitest'
import app from '../../app'

interface HealthzResponse {
  status: string
  timestamp: string
}

describe('Health Check Router', () => {
  it('should return healthy status', async () => {
    const res = await app.request('/healthz')
    expect(res.status).toBe(200)

    const data = (await res.json()) as HealthzResponse
    expect(data.status).toBe('healthy')
    expect(data.timestamp).toBeDefined()
    expect(new Date(data.timestamp).getTime()).not.toBeNaN()
  })
})
