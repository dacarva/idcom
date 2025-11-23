import nacl from 'tweetnacl';

export interface EncryptionResult {
  ciphertext: string;
  nonce: string;
}

export interface DecryptionResult {
  data: Record<string, any>;
}

const bufferToBase64 = (buffer: Uint8Array): string => Buffer.from(buffer).toString('base64');
const base64ToBuffer = (base64: string): Uint8Array => new Uint8Array(Buffer.from(base64, 'base64'));

/**
 * Generate a new encryption key
 */
export function generateKey(): string {
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  return bufferToBase64(key);
}

/**
 * Encrypt order data with a symmetric key
 */
export function encrypt(data: Record<string, any>, key: string): EncryptionResult {
  try {
    const keyBuffer = base64ToBuffer(key);
    if (keyBuffer.length !== nacl.secretbox.keyLength) {
      throw new Error(
        `Invalid key length. Expected ${nacl.secretbox.keyLength}, got ${keyBuffer.length}`
      );
    }

    const jsonString = JSON.stringify(data);
    const messageBuffer = Buffer.from(jsonString, 'utf-8');
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const ciphertext = nacl.secretbox(messageBuffer as any, nonce, keyBuffer as any);

    if (!ciphertext) {
      throw new Error('Encryption failed');
    }

    return {
      ciphertext: bufferToBase64(Buffer.from(ciphertext)),
      nonce: bufferToBase64(Buffer.from(nonce)),
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
 */
export function decrypt(ciphertext: string, nonce: string, key: string): DecryptionResult {
  try {
    const keyBuffer = base64ToBuffer(key);
    const ciphertextBuffer = base64ToBuffer(ciphertext);
    const nonceBuffer = base64ToBuffer(nonce);

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

    const plaintext = nacl.secretbox.open(
      ciphertextBuffer as any,
      nonceBuffer as any,
      keyBuffer as any
    );

    if (!plaintext) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }

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

// Export as object for backward compatibility
export const encryptionService = {
  generateKey,
  encrypt,
  decrypt,
};
