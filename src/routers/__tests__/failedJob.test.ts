import { type InferSelectModel } from 'drizzle-orm'
import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type failedJobs } from '../../db/schema'
import failedJobRouter from '../failedJob'

const failedJobsMock = vi.hoisted(() => ({
  getPaginatedFailedJobs: vi.fn(),
  getFailedJobCount: vi.fn(),
  getFailedJobById: vi.fn(),
  deleteFailedJobById: vi.fn()
}))

const s3Mock = vi.hoisted(() => ({
  deleteS3Object: vi.fn()
}))

vi.mock('../../db/repositories/failedJob', () => ({
  getPaginatedFailedJobs: failedJobsMock.getPaginatedFailedJobs,
  getFailedJobCount: failedJobsMock.getFailedJobCount,
  getFailedJobById: failedJobsMock.getFailedJobById,
  deleteFailedJobById: failedJobsMock.deleteFailedJobById
}))

vi.mock('../../utils/s3', () => ({
  deleteS3Object: s3Mock.deleteS3Object
}))

describe('Failed Jobs Router', () => {
  let app: Hono
  const now = new Date()

  beforeEach(() => {
    app = new Hono()
    app.route('/', failedJobRouter)
    // Clear mock calls between tests
    vi.clearAllMocks()
  })

  describe('GET /failed-jobs', () => {
    const getFailedJobsEndpoint = '/failed-jobs'
    describe('success cases', () => {
      it('should return paginated failed jobs with default parameters of currentPage = 1 and itemsPerPage = 30', async () => {
        const mockDBResponse: InferSelectModel<typeof failedJobs>[] = [
          {
            id: 1,
            jobId: 'abc',
            jobName: 'test-1',
            s3Key: 's3key-1',
            downloadApproved: null,
            createdAt: now,
            updatedAt: now
          },
          {
            id: 2,
            jobId: 'def',
            jobName: 'test-2',
            s3Key: 's3key-2',
            downloadApproved: null,
            createdAt: now,
            updatedAt: now
          }
        ]
        failedJobsMock.getPaginatedFailedJobs.mockResolvedValue(mockDBResponse)
        failedJobsMock.getFailedJobCount.mockResolvedValue([
          { count: mockDBResponse.length }
        ])

        const res = await app.request(getFailedJobsEndpoint)

        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data).toEqual({
          data: [
            {
              ...mockDBResponse[0],
              createdAt: now.toISOString(),
              updatedAt: now.toISOString()
            },
            {
              ...mockDBResponse[1],
              createdAt: now.toISOString(),
              updatedAt: now.toISOString()
            }
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 2,
            itemsPerPage: 30
          }
        })
      })
      it('should handle custom page and limit parameters', async () => {
        failedJobsMock.getPaginatedFailedJobs.mockResolvedValue([])
        failedJobsMock.getFailedJobCount.mockResolvedValue([{ count: 100 }])

        const res = await app.request(
          `${getFailedJobsEndpoint}?page=2&limit=10`
        )

        expect(res.status).toBe(200)
        const { pagination } = (await res.json()) as Record<string, number>
        expect(pagination).toEqual({
          currentPage: 2,
          totalPages: 10,
          totalItems: 100,
          itemsPerPage: 10
        })
      })
      it('should handle empty results', async () => {
        failedJobsMock.getPaginatedFailedJobs.mockResolvedValue([])
        failedJobsMock.getFailedJobCount.mockResolvedValue([{ count: 0 }])

        const res = await app.request(getFailedJobsEndpoint)

        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data).toEqual({
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 30
          }
        })
      })
    })
    describe('error cases', () => {
      it('should return 400 for invalid page parameter', async () => {
        const res = await app.request(`${getFailedJobsEndpoint}?page=0`)
        expect(res.status).toBe(400)
      })

      it('should return 400 for invalid limit parameter', async () => {
        const res = await app.request(`${getFailedJobsEndpoint}?limit=101`)
        expect(res.status).toBe(400)
      })
    })
  })

  describe('DELETE /failed-jobs/:id', () => {
    const deleteFailedJobEndpoint = '/failed-jobs'

    describe('success cases', () => {
      it('should delete failed job of provided id successfully', async () => {
        const jobId = 1
        const mockFailedJobRes = [
          {
            id: 1,
            jobId: 'abc',
            jobName: 'test-1',
            s3Key: 's3key-1',
            downloadApproved: null,
            createdAt: now,
            updatedAt: now
          }
        ]

        failedJobsMock.getFailedJobById.mockResolvedValue(mockFailedJobRes)
        s3Mock.deleteS3Object.mockResolvedValue({ success: true })
        failedJobsMock.deleteFailedJobById.mockResolvedValue(undefined)

        const res = await app.request(`${deleteFailedJobEndpoint}/${jobId}`, {
          method: 'DELETE'
        })

        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data).toEqual({
          message: 'Failed job deleted successfully'
        })

        expect(failedJobsMock.getFailedJobById).toHaveBeenCalledWith(jobId)
        expect(s3Mock.deleteS3Object).toHaveBeenCalledWith(
          'failed-job-data',
          mockFailedJobRes[0].s3Key
        )
        expect(failedJobsMock.deleteFailedJobById).toHaveBeenCalledWith(jobId)
      })
    })

    describe('error cases', () => {
      it('should return 400 invalid failed job id is passed', async () => {
        const jobId = 'test'
        failedJobsMock.getFailedJobById.mockResolvedValue([])

        const res = await app.request(`${deleteFailedJobEndpoint}/${jobId}`, {
          method: 'DELETE'
        })

        expect(res.status).toBe(400)
        const data = (await res.json()) as Record<string, unknown>
        expect(data.success).toEqual(false)
      })
      it('should return 404 when failed job not found', async () => {
        const jobId = 999
        failedJobsMock.getFailedJobById.mockResolvedValue([])

        const res = await app.request(`${deleteFailedJobEndpoint}/${jobId}`, {
          method: 'DELETE'
        })

        expect(res.status).toBe(404)
        const data = await res.json()
        expect(data).toEqual({
          message: 'Failed job not found'
        })
      })
      it('should return 500 when S3 deletion fails', async () => {
        const jobId = 1
        const mockJob = [
          {
            id: jobId,
            jobId: 'abc',
            jobName: 'test-1',
            s3Key: 's3key-1',
            downloadApproved: null,
            createdAt: now,
            updatedAt: now
          }
        ]

        failedJobsMock.getFailedJobById.mockResolvedValue(mockJob)
        s3Mock.deleteS3Object.mockResolvedValue({ success: false })

        const res = await app.request(`${deleteFailedJobEndpoint}/${jobId}`, {
          method: 'DELETE'
        })

        expect(res.status).toBe(500)
        const data = await res.json()
        expect(data).toEqual({
          message: 'Failed to delete S3 object'
        })
        expect(failedJobsMock.deleteFailedJobById).not.toHaveBeenCalled()
      })
    })
  })
})
