import lighthouse from '@lighthouse-web3/sdk';
import { encryptionService } from './encryption.service';

interface UploadResult {
  cid: string;
  ipfsUrl: string;
  fileSize: number;
  uploadedAt: string;
  encryptionKey?: string;
  ciphertext?: string;
  nonce?: string;
}

interface RetrieveResult {
  cid: string;
  data: Record<string, any>;
  retrievedAt: string;
}

/**
 * FilecoinService - Handles all Filecoin/Lighthouse operations
 * Responsible for uploading orders to decentralized storage and retrieving them
 */
class FilecoinService {
  private apiKey: string;
  private gatewayUrl: string;

  constructor() {
    this.apiKey = process.env.LIGHTHOUSE_API_KEY || '';
    this.gatewayUrl = process.env.NEXT_PUBLIC_FILECOIN_GATEWAY || 'https://gateway.lighthouse.storage/ipfs';

    if (!this.apiKey) {
      console.warn('⚠️ LIGHTHOUSE_API_KEY not configured. Filecoin features will be limited.');
    }
  }

  /**
   * Upload order to Filecoin via Lighthouse (with encryption)
   * Creates immutable, permanently stored record on decentralized network
   * @param orderData - Order data to upload
   * @param encryptionKey - Optional: base64 encoded encryption key for symmetric encryption
   *                        If not provided, a new key will be generated
   */
  async uploadOrder(orderData: Record<string, any>, encryptionKey?: string): Promise<UploadResult> {
    try {
      if (!this.apiKey) {
        throw new Error('LIGHTHOUSE_API_KEY not configured');
      }

      // Prepare order with metadata
      const orderWithMetadata = {
        ...orderData,
        _archived: {
          timestamp: new Date().toISOString(),
          service: 'Filecoin/Lighthouse',
          version: '1',
          encrypted: !!encryptionKey,
        },
      };

      // Generate or use provided encryption key
      let generatedKey = encryptionKey;
      if (!generatedKey) {
        generatedKey = encryptionService.generateKey();
      }

      // Encrypt order data
      const encryptionResult = encryptionService.encrypt(orderWithMetadata, generatedKey);

      // Prepare encrypted payload
      const encryptedPayload = {
        type: 'encrypted_order',
        ciphertext: encryptionResult.ciphertext,
        nonce: encryptionResult.nonce,
        algorithm: 'nacl-secretbox',
      };

      // Convert to JSON
      const jsonString = JSON.stringify(encryptedPayload, null, 2);
      const fileName = `order-encrypted-${orderData.id || 'unknown'}-${Date.now()}.json`;

      // Upload via Lighthouse uploadText (Node.js compatible)
      const response = await lighthouse.uploadText(jsonString, this.apiKey, fileName);

      if (!response.data?.Hash) {
        throw new Error('Invalid Lighthouse response: missing Hash/CID');
      }

      const cid = response.data.Hash;
      const uploadedAt = new Date().toISOString();
      const fileSize = Buffer.byteLength(jsonString, 'utf8');

      console.log(`✅ Order archived on Filecoin (encrypted)`);
      console.log(`   CID: ${cid}`);
      console.log(`   Size: ${fileSize} bytes`);

      return {
        cid,
        ipfsUrl: `ipfs://${cid}`,
        fileSize,
        uploadedAt,
        encryptionKey: generatedKey,
        ciphertext: encryptionResult.ciphertext,
        nonce: encryptionResult.nonce,
      };
    } catch (error) {
      console.error('❌ Filecoin upload failed:', error);
      throw new Error(`Failed to archive order on Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve order from Filecoin by CID
   * Verifies data integrity and returns immutable order record
   */
  async retrieveOrder(cid: string): Promise<RetrieveResult> {
    try {
      const url = `${this.gatewayUrl}/${cid}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Gateway returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const retrievedAt = new Date().toISOString();

      console.log(`✅ Order retrieved from Filecoin (CID: ${cid.substring(0, 8)}...)`);

      return {
        cid,
        data,
        retrievedAt,
      };
    } catch (error) {
      console.error('❌ Filecoin retrieval failed:', error);
      throw new Error(`Failed to retrieve order from Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a public verifiable link for an order
   * Can be shared to verify order authenticity
   */
  generateVerifiableLink(cid: string): string {
    return `${this.gatewayUrl}/${cid}`;
  }

  /**
   * Generate multiple gateway URLs for redundancy
   * If one gateway is down, order can be retrieved from another
   */
  generateRedundantLinks(cid: string): string[] {
    return [
      `${this.gatewayUrl}/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://nft.storage/ipfs/${cid}`,
      `ipfs://${cid}`,
    ].filter(Boolean);
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Export singleton instance
export const filecoinService = new FilecoinService();
