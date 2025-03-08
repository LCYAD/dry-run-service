import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import crypto from 'crypto'
import { env } from '../env'

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
  // Generate a symmetric key
  const secretKey = crypto.randomBytes(32)

  // Convert data to JSON string and encrypt
  const jsonString = JSON.stringify(data)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv)

  let encryptedData = cipher.update(jsonString, 'utf8')
  encryptedData = Buffer.concat([encryptedData, cipher.final()])
  const authTag = cipher.getAuthTag()

  // Combine IV, encrypted data and auth tag
  const finalBuffer = Buffer.concat([iv, encryptedData, authTag])

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: finalBuffer,
    ContentType: 'application/octet-stream',
    Metadata: {
      'x-amz-meta-key': secretKey.toString('base64')
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
) => {
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

    // Convert the buffer to proper format and extract components
    const buffer = Buffer.from(encryptedBuffer)
    const iv = buffer.subarray(0, 16)
    const authTag = buffer.subarray(buffer.length - 16)
    const encryptedData = buffer.subarray(16, buffer.length - 16)

    // Decode the secret key from base64
    const secretKey = Buffer.from(secretKeyBase64, 'base64')

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, iv)
    decipher.setAuthTag(authTag)

    // Decrypt the data
    let decryptedData = decipher.update(encryptedData)
    decryptedData = Buffer.concat([decryptedData, decipher.final()])

    // Parse the decrypted JSON string
    const jsonData = JSON.parse(decryptedData.toString()) as Record<
      string,
      unknown
    >

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
