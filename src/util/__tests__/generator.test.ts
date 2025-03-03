import { describe, expect, it } from 'vitest'
import { generateQueueId } from '../generator'

describe('generateQueueId', () => {
  it('should generate ID with correct format', () => {
    const queueId = generateQueueId('test')
    expect(queueId).toMatch(/^test-[A-Za-z0-9]{10}$/)
  })

  it('should respect custom size parameter', () => {
    const size = 15
    const queueId = generateQueueId('test', size)
    expect(queueId).toMatch(new RegExp(`^test-[A-Za-z0-9]{${size}}$`))
  })

  it('should use queue name as prefix', () => {
    const queueName = 'myQueue'
    const queueId = generateQueueId(queueName)
    expect(queueId.startsWith(`${queueName}-`)).toBe(true)
  })
})
