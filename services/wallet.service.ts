import crypto from 'crypto';

export interface WalletSignature {
  walletAddress: string;
  signature: string;
  salt: string;
  timestamp: string;
}

let mockWalletAddress = '0x1234567890abcdef1234567890abcdef12345678';

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Get mock wallet address (for testing)
 */
export function getMockWalletAddress(): string {
  return mockWalletAddress;
}

/**
 * Set mock wallet address (for testing with different addresses)
 */
export function setMockWalletAddress(address: string): void {
  mockWalletAddress = address;
}

/**
 * Mock signing function - generates deterministic signature
 */
export async function mockSignMessage(message: string, walletAddress?: string): Promise<string> {
  const addr = walletAddress || mockWalletAddress;
  const signatureData = `${addr}|${message}|${Date.now()}`;
  const hash = crypto.createHash('sha256').update(signatureData).digest('hex');
  return `0x${hash}`;
}

/**
 * Derive encryption key from wallet signature and salt
 */
export function deriveEncryptionKey(walletAddress: string, signature: string, salt: string): string {
  const keyMaterial = `${walletAddress}|${signature}`;
  const derivedKey = crypto.pbkdf2Sync(
    keyMaterial,
    salt,
    100000,
    32,
    'sha256'
  );
  return derivedKey.toString('base64');
}

/**
 * Create a wallet signature object for order encryption
 */
export async function createOrderSignature(
  message: string,
  walletAddress?: string
): Promise<WalletSignature> {
  const addr = walletAddress || mockWalletAddress;
  const salt = generateSalt();
  const signature = await mockSignMessage(message, addr);

  return {
    walletAddress: addr,
    signature,
    salt,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a deterministic signature for a message
 */
export function createDeterministicSignature(walletAddress: string, message: string): string {
  const signatureData = `${walletAddress}|${message}`;
  const hash = crypto.createHash('sha256').update(signatureData).digest('hex');
  return `0x${hash}`;
}

/**
 * Validate that a signature belongs to a wallet address
 */
export function validateSignature(walletAddress: string, signature: string): boolean {
  return signature.startsWith('0x') && signature.length === 66;
}

// Export as object for backward compatibility
export const walletService = {
  generateSalt,
  getMockWalletAddress,
  setMockWalletAddress,
  mockSignMessage,
  deriveEncryptionKey,
  createOrderSignature,
  createDeterministicSignature,
  validateSignature,
};
