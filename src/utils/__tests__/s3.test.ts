import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteS3Object, downloadAndDecryptFromS3, uploadToS3 } from '../s3'

const encryptionMock = vi.hoisted(() => ({
  encryptAES256: vi.fn(),
  decryptAES256: vi.fn()
}))

const s3ClientSendMock = vi.hoisted(() => vi.fn())

const s3ClientMock = vi.hoisted(() => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: s3ClientSendMock
  })),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn()
}))

// Mock the AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: s3ClientMock.S3Client,
  PutObjectCommand: s3ClientMock.PutObjectCommand,
  GetObjectCommand: s3ClientMock.GetObjectCommand,
  DeleteObjectCommand: s3ClientMock.DeleteObjectCommand
}))

// Mock the encryption utilities
vi.mock('../encryption', () => ({
  encryptAES256: encryptionMock.encryptAES256,
  decryptAES256: encryptionMock.decryptAES256
}))

describe('S3 Utils', () => {
  const mockEncryptedData = Buffer.from('encrypted-data')
  const mockSecretKey = 'mock-secret-key'
  const mockBucketName = 'test-bucket'
  const mockKey = 'test-key'
  const mockData = { test: 'data' }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup encryption mock
    encryptionMock.encryptAES256.mockReturnValue({
      encryptedData: mockEncryptedData,
      secretKey: mockSecretKey
    })
  })

  describe('uploadToS3', () => {
    it('should successfully upload data to S3', async () => {
      // Setup successful s3 response
      s3ClientSendMock.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 200 }
      })

      const result = await uploadToS3(
        mockBucketName,
        mockKey,
        JSON.stringify(mockData)
      )

      // Verify PutObjectCommand was called with correct params
      expect(s3ClientMock.PutObjectCommand).toHaveBeenCalledWith({
        Bucket: mockBucketName,
        Key: mockKey,
        Body: mockEncryptedData,
        ContentType: 'application/octet-stream',
        Metadata: {
          'x-amz-meta-key': mockSecretKey
        }
      })

      // Verify encryption was called
      expect(encryptionMock.encryptAES256).toHaveBeenCalledWith(
        JSON.stringify(mockData)
      )

      // Verify result
      expect(result.success).toBe(true)
    })

    it('should handle upload errors', async () => {
      // Setup error response
      const mockError = new Error('Upload failed')
      s3ClientSendMock.mockRejectedValueOnce(mockError)

      const result = await uploadToS3(
        mockBucketName,
        mockKey,
        JSON.stringify(mockData)
      )

      // Verify PutObjectCommand was called with correct params
      expect(s3ClientMock.PutObjectCommand).toHaveBeenCalledWith({
        Bucket: mockBucketName,
        Key: mockKey,
        Body: mockEncryptedData,
        ContentType: 'application/octet-stream',
        Metadata: {
          'x-amz-meta-key': mockSecretKey
        }
      })

      // Verify encryption was called
      expect(encryptionMock.encryptAES256).toHaveBeenCalledWith(
        JSON.stringify(mockData)
      )

      // Verify result contains error
      expect(result.success).toBe(false)
      expect(result.error).toBe(mockError)
    })
  })

  describe('downloadAndDecryptFromS3', () => {
    it('should successfully download and decrypt data from S3', async () => {
      const mockDecryptedData = Buffer.from(JSON.stringify(mockData))

      // Setup successful response
      s3ClientSendMock.mockResolvedValueOnce({
        Body: {
          transformToByteArray: () => mockEncryptedData
        },
        Metadata: {
          'x-amz-meta-key': mockSecretKey
        }
      })

      // Setup decryption mock
      encryptionMock.decryptAES256.mockReturnValue(mockDecryptedData)

      const result = await downloadAndDecryptFromS3(mockBucketName, mockKey)

      // Verify GetObjectCommand was called with correct params
      expect(s3ClientMock.GetObjectCommand).toHaveBeenCalledWith({
        Bucket: mockBucketName,
        Key: mockKey
      })

      // Verify decryption was called
      expect(encryptionMock.decryptAES256).toHaveBeenCalledWith(
        mockEncryptedData,
        mockSecretKey
      )

      // Verify result
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
    })

    it('should handle missing data or decryption key', async () => {
      // Setup response with missing data
      vi.mocked(s3ClientSendMock).mockResolvedValueOnce({
        Body: null,
        Metadata: {}
      })

      const result = await downloadAndDecryptFromS3(mockBucketName, mockKey)

      expect(s3ClientMock.GetObjectCommand).toHaveBeenCalledWith({
        Bucket: mockBucketName,
        Key: mockKey
      })

      // Verify result contains error
      expect(result.success).toBe(false)
      expect(result.error).toBe('No data or decryption key found')
    })

    it('should handle download errors', async () => {
      // Setup error response
      const mockError = new Error('Download failed')
      vi.mocked(s3ClientSendMock).mockRejectedValueOnce(mockError)

      const result = await downloadAndDecryptFromS3(mockBucketName, mockKey)

      expect(s3ClientMock.GetObjectCommand).toHaveBeenCalledWith({
        Bucket: mockBucketName,
        Key: mockKey
      })

      // Verify result contains error
      expect(result.success).toBe(false)
      expect(result.error).toBe('Download failed')
    })
  })

  describe('deleteS3Object', () => {
    it('should successfully delete an object from S3', async () => {
      // Setup successful response
      s3ClientSendMock.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 204 }
      })

      const result = await deleteS3Object(mockBucketName, mockKey)

      // Verify DeleteObjectCommand was called with correct params
      expect(s3ClientMock.DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: mockBucketName,
        Key: mockKey
      })

      // Verify result
      expect(result.success).toBe(true)
    })

    it('should handle delete errors', async () => {
      // Setup error response
      const mockError = new Error('Delete failed')
      vi.mocked(s3ClientSendMock).mockRejectedValueOnce(mockError)

      const result = await deleteS3Object(mockBucketName, mockKey)

      expect(s3ClientMock.DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: mockBucketName,
        Key: mockKey
      })

      // Verify result contains error
      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })
  })
})
