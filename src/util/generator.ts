import crypto from 'crypto'
import { customAlphabet } from 'nanoid'

export const generateQueueId = (queueName: string, size = 10): string => {
  // only allow alphanumeric characters
  const nanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    size
  )
  return `${queueName}-${nanoid()}`
}

// Generate a key pair for encryption
export const generateKeyPair = (
  modulusLength: number
): crypto.KeyPairSyncResult<string, string> => {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  })
}
