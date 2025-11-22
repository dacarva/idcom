import nacl from 'tweetnacl';

interface EncryptionResult {
  ciphertext: string; // base64 encoded
  nonce: string; // base64 encoded
}

interface DecryptionResult {
  data: Record<string, any>;
}

/**
 * EncryptionService - Handles symmetric encryption/decryption using TweetNaCl
 * Uses secretbox (symmetric encryption) for order data privacy
 */
class EncryptionService {
  /**
   * Generate a new encryption key
   * Returns base64 encoded key for storage
   */
  generateKey(): string {
    const key = nacl.randomBytes(nacl.secretbox.keyLength);
    return this.bufferToBase64(key);
  }

  /**
   * Encrypt order data with a symmetric key
   * @param data - Order object to encrypt
   * @param key - Base64 encoded encryption key
   * @returns Encrypted data with nonce, both base64 encoded
   */
  encrypt(data: Record<string, any>, key: string): EncryptionResult {
    try {
      // Decode key from base64
      const keyBuffer = this.base64ToBuffer(key);
      if (keyBuffer.length !== nacl.secretbox.keyLength) {
        throw new Error(
          `Invalid key length. Expected ${nacl.secretbox.keyLength}, got ${keyBuffer.length}`
        );
      }

      // Convert data to JSON string
      const jsonString = JSON.stringify(data);
      const messageBuffer = Buffer.from(jsonString, 'utf-8');

      // Generate random nonce
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

      // Encrypt
      const ciphertext = nacl.secretbox(messageBuffer as any, nonce, keyBuffer as any);

      if (!ciphertext) {
        throw new Error('Encryption failed');
      }

      return {
        ciphertext: this.bufferToBase64(Buffer.from(ciphertext)),
        nonce: this.bufferToBase64(Buffer.from(nonce)),
      };
    } catch (error) {
      console.error('❌ Encryption error:', error);
      throw new Error(
        `Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypt order data with a symmetric key
   * @param ciphertext - Base64 encoded encrypted data
   * @param nonce - Base64 encoded nonce
   * @param key - Base64 encoded encryption key
   * @returns Decrypted order object
   */
  decrypt(ciphertext: string, nonce: string, key: string): DecryptionResult {
    try {
      // Decode all inputs from base64
      const keyBuffer = this.base64ToBuffer(key);
      const ciphertextBuffer = this.base64ToBuffer(ciphertext);
      const nonceBuffer = this.base64ToBuffer(nonce);

      if (keyBuffer.length !== nacl.secretbox.keyLength) {
        throw new Error(
          `Invalid key length. Expected ${nacl.secretbox.keyLength}, got ${keyBuffer.length}`
        );
      }

      if (nonceBuffer.length !== nacl.secretbox.nonceLength) {
        throw new Error(
          `Invalid nonce length. Expected ${nacl.secretbox.nonceLength}, got ${nonceBuffer.length}`
        );
      }

      // Decrypt
      const plaintext = nacl.secretbox.open(
        ciphertextBuffer as any,
        nonceBuffer as any,
        keyBuffer as any
      );

      if (!plaintext) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      // Convert buffer to string and parse JSON
      const jsonString = Buffer.from(plaintext).toString('utf-8');
      const data = JSON.parse(jsonString);

      return { data };
    } catch (error) {
      console.error('❌ Decryption error:', error);
      throw new Error(
        `Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Convert Buffer to base64 string
   */
  private bufferToBase64(buffer: Uint8Array): string {
    return Buffer.from(buffer).toString('base64');
  }

  /**
   * Convert base64 string to Buffer
   */
  private base64ToBuffer(base64: string): Uint8Array {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
