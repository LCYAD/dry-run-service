import { customAlphabet } from 'nanoid'

export const generateQueueId = (queueName: string, size = 10): string => {
  // only allow alphanumeric characters
  const nanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    size
  )
  return `${queueName}-${nanoid()}`
}
