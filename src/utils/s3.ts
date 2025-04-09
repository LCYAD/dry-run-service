import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { env } from '../env'
import { decryptAES256, encryptAES256 } from './encryption'

const s3Client = new S3Client({
  endpoint: env.S3_URL,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCEESS_ID,
    secretAccessKey: env.S3_SECRET_KEY
  },
  forcePathStyle: env.NODE_ENV === 'development' // true value Required for MinIO
})

export const uploadToS3 = async (
  bucketName: string,
  key: string,
  data: Buffer | string
) => {
  const jsonString = JSON.stringify(data)

  const { encryptedData, secretKey } = encryptAES256(jsonString)
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: encryptedData,
    ContentType: 'application/octet-stream',
    Metadata: {
      'x-amz-meta-key': secretKey
    }
  })

  try {
    const response = await s3Client.send(command)
    return {
      success: true,
      response
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  }
}

export const downloadAndDecryptFromS3 = async (
  bucketName: string,
  key: string
): Promise<{
  success: boolean
  data?: Record<string, unknown>
  error?: string
}> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  })

  try {
    const response = await s3Client.send(command)
    const encryptedBuffer = await response.Body?.transformToByteArray()
    const secretKeyBase64 = response.Metadata?.['x-amz-meta-key']

    if (!encryptedBuffer || !secretKeyBase64) {
      return {
        success: false,
        error: 'No data or decryption key found'
      }
    }

    const decryptedData = decryptAES256(encryptedBuffer, secretKeyBase64)

    // Parse the decrypted JSON string, need to double parse here
    const jsonData = JSON.parse(
      JSON.parse(decryptedData.toString()) as string
    ) as Record<string, unknown>

    return {
      success: true,
      data: jsonData
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export const deleteS3Object = async (bucketName: string, key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  })

  try {
    const response = await s3Client.send(command)
    return {
      success: true,
      response
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
