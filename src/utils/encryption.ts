import crypto from 'node:crypto'

export const encryptAES256 = (
  data: string
): { encryptedData: Buffer<ArrayBufferLike>; secretKey: string } => {
  // Generate a symmetric key
  const secretKey = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv)

  let encryptedData = cipher.update(data, 'utf8')
  encryptedData = Buffer.concat([encryptedData, cipher.final()])
  const authTag = cipher.getAuthTag()

  // Combine IV, encrypted data and auth tag
  return {
    encryptedData: Buffer.concat([iv, encryptedData, authTag]),
    secretKey: secretKey.toString('base64')
  }
}

export const decryptAES256 = (
  data: Uint8Array<ArrayBufferLike>,
  key: string
): Buffer<ArrayBufferLike> => {
  // Convert the buffer to proper format and extract components
  const buffer = Buffer.from(data)
  const iv = buffer.subarray(0, 16)
  const authTag = buffer.subarray(buffer.length - 16)
  const encryptedData = buffer.subarray(16, buffer.length - 16)

  // Decode the secret key from base64
  const secretKey = Buffer.from(key, 'base64')

  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, iv)
  decipher.setAuthTag(authTag)

  // Decrypt the data
  let decryptedData = decipher.update(encryptedData)
  return Buffer.concat([decryptedData, decipher.final()])
}
