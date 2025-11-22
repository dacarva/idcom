import { encryptionService } from './encryption.service';
import { filecoinSynapseService } from './filecoin-synapse.service';

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

      // Upload via Synapse SDK with wallet (Calibration Testnet)
      const uploadedAt = new Date().toISOString();
      const fileSize = Buffer.byteLength(jsonString, 'utf8');
      
      const synapseResult = await filecoinSynapseService.uploadOrderToFilecoin(
        orderWithMetadata,
        encryptionResult.ciphertext
      );
      const cid = synapseResult.cid;

      console.log(`✅ Order archived on Filecoin (Calibration Testnet)`);
      console.log(`   CID: ${cid}`);
      console.log(`   Encrypted: true`);
      console.log(`   Wallet: ${filecoinSynapseService.getWalletAddress()}`);
      if (synapseResult.transactionHash) {
        console.log(`   TX: ${synapseResult.transactionHash}`);
      }

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
   * Uses Synapse SDK on Calibration Testnet
   */
  async retrieveOrder(cid: string): Promise<RetrieveResult> {
    try {
      const synapseResult = await filecoinSynapseService.retrieveOrderFromFilecoin(cid);
      console.log(`✅ Order retrieved from Filecoin (CID: ${cid.substring(0, 8)}...)`);
      return {
        cid,
        data: synapseResult.data,
        retrievedAt: synapseResult.retrievedAt,
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
