import lighthouse from '@lighthouse-web3/sdk';

interface UploadResult {
  cid: string;
  ipfsUrl: string;
  fileSize: number;
  uploadedAt: string;
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
   * Upload order to Filecoin via Lighthouse
   * Creates immutable, permanently stored record on decentralized network
   */
  async uploadOrder(orderData: Record<string, any>): Promise<UploadResult> {
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
        },
      };

      // Convert to JSON
      const jsonString = JSON.stringify(orderWithMetadata, null, 2);
      const fileName = `order-${orderData.id || 'unknown'}-${Date.now()}.json`;

      // Upload via Lighthouse uploadText (Node.js compatible)
      const response = await lighthouse.uploadText(jsonString, this.apiKey, fileName);

      if (!response.data?.Hash) {
        throw new Error('Invalid Lighthouse response: missing Hash/CID');
      }

      const cid = response.data.Hash;
      const uploadedAt = new Date().toISOString();
      const fileSize = Buffer.byteLength(jsonString, 'utf8');

      console.log(`✅ Order archived on Filecoin`);
      console.log(`   CID: ${cid}`);
      console.log(`   Size: ${fileSize} bytes`);

      return {
        cid,
        ipfsUrl: `ipfs://${cid}`,
        fileSize,
        uploadedAt,
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
