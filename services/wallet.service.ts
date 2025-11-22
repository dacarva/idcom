import crypto from 'crypto';

interface WalletSignature {
  walletAddress: string;
  signature: string;
  salt: string;
  timestamp: string;
}

/**
 * WalletService - Handles wallet-based encryption key derivation
 * Uses signature + wallet address to derive encryption keys
 * This is a mock implementation for testing - will be replaced by Privy later
 */
class WalletService {
  /**
   * Mock wallet address for testing
   * In production, this comes from Privy
   */
  private mockWalletAddress = '0x1234567890abcdef1234567890abcdef12345678';

  /**
   * Generate a random salt for key derivation
   */
  generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Get mock wallet address (for testing)
   * In production: usePrivy().user.wallet.address
   */
  getMockWalletAddress(): string {
    return this.mockWalletAddress;
  }

  /**
   * Set mock wallet address (for testing with different addresses)
   */
  setMockWalletAddress(address: string): void {
    this.mockWalletAddress = address;
  }

  /**
   * Mock signing function - generates deterministic signature
   * In production: signer.signMessage(message)
   *
   * @param message - Message to sign (typically order confirmation)
   * @param walletAddress - Wallet address doing the signing
   * @returns Mock signature
   */
  async mockSignMessage(message: string, walletAddress?: string): Promise<string> {
    const addr = walletAddress || this.mockWalletAddress;

    // Create a deterministic signature-like string
    // In production, this would be a real cryptographic signature from the wallet
    const signatureData = `${addr}|${message}|${Date.now()}`;
    const hash = crypto.createHash('sha256').update(signatureData).digest('hex');
    return `0x${hash}`;
  }

  /**
   * Derive encryption key from wallet signature and salt
   * Uses PBKDF2 to derive a strong key from wallet-specific data
   *
   * @param walletAddress - User's wallet address
   * @param signature - Signature from wallet
   * @param salt - Random salt
   * @returns Base64 encoded 32-byte encryption key
   */
  deriveEncryptionKey(walletAddress: string, signature: string, salt: string): string {
    // Combine wallet address and signature for key material
    const keyMaterial = `${walletAddress}|${signature}`;

    // Use PBKDF2 to derive a strong key
    const derivedKey = crypto.pbkdf2Sync(
      keyMaterial,
      salt,
      100000, // iterations
      32, // key length (256 bits)
      'sha256'
    );

    return derivedKey.toString('base64');
  }

  /**
   * Create a wallet signature object for order encryption
   * This represents: "User with this wallet address signed to encrypt this order"
   *
   * @param message - Message/purpose for signing (e.g., order details)
   * @param walletAddress - Optional custom wallet address for testing
   * @returns Wallet signature data
   */
  async createOrderSignature(
    message: string,
    walletAddress?: string
  ): Promise<WalletSignature> {
    const addr = walletAddress || this.mockWalletAddress;
    const salt = this.generateSalt();
    const signature = await this.mockSignMessage(message, addr);

    return {
      walletAddress: addr,
      signature,
      salt,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate that a signature belongs to a wallet address
   * In production: use ethers.verifyMessage() or similar
   *
   * @param walletAddress - Claimed wallet address
   * @param signature - Signature to verify
   * @returns true if signature is valid for this wallet
   */
  validateSignature(walletAddress: string, signature: string): boolean {
    // In production, this would call ethers.verifyMessage()
    // For now, we do a simple check that signature exists and looks valid
    return signature.startsWith('0x') && signature.length === 66; // 0x + 64 hex chars
  }
}

// Export singleton instance
export const walletService = new WalletService();
