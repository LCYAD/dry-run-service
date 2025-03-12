import { describe, expect, it } from 'vitest'
import { decryptAES256, encryptAES256 } from '../encryption'

describe('Encryption Utils', () => {
  describe('encryptAES256', () => {
    it('should encrypt data and return buffer with secret key', () => {
      const testData = 'test-data-to-encrypt'
      const result = encryptAES256(testData)

      expect(Buffer.isBuffer(result.encryptedData)).toBe(true)
      expect(typeof result.secretKey).toBe('string')
      expect(result.secretKey).toMatch(/^[A-Za-z0-9+/]+=*$/) // Base64 format
      expect(result.encryptedData.length).toBeGreaterThan(0)
    })

    it('should generate different encryption results for same input', () => {
      const testData = 'same-data'
      const result1 = encryptAES256(testData)
      const result2 = encryptAES256(testData)

      expect(result1.encryptedData).not.toEqual(result2.encryptedData)
      expect(result1.secretKey).not.toEqual(result2.secretKey)
    })

    it('should handle empty string input', () => {
      const result = encryptAES256('')
      expect(Buffer.isBuffer(result.encryptedData)).toBe(true)
      expect(result.encryptedData.length).toBeGreaterThan(0)
    })
  })

  describe('decryptAES256', () => {
    it('should correctly decrypt encrypted data', () => {
      const originalData = 'test-data-to-encrypt-and-decrypt'
      const { encryptedData, secretKey } = encryptAES256(originalData)

      const decryptedBuffer = decryptAES256(encryptedData, secretKey)
      const decryptedString = decryptedBuffer.toString('utf8')

      expect(decryptedString).toBe(originalData)
    })

    it('should handle encryption/decryption of special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~'
      const { encryptedData, secretKey } = encryptAES256(specialChars)

      const decryptedBuffer = decryptAES256(encryptedData, secretKey)
      const decryptedString = decryptedBuffer.toString('utf8')

      expect(decryptedString).toBe(specialChars)
    })

    it('should handle encryption/decryption of long strings', () => {
      const longString = 'x'.repeat(1000)
      const { encryptedData, secretKey } = encryptAES256(longString)

      const decryptedBuffer = decryptAES256(encryptedData, secretKey)
      const decryptedString = decryptedBuffer.toString('utf8')

      expect(decryptedString).toBe(longString)
    })

    it('should throw error for invalid secret key', () => {
      const { encryptedData } = encryptAES256('test')
      const invalidKey = 'invalid-key'

      expect(() => decryptAES256(encryptedData, invalidKey)).toThrow()
    })
  })
})
