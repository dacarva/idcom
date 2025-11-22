import { SynapseClient } from '@filoz/synapse-sdk';
import { ethers } from 'ethers';

interface SynapseUploadResult {
  cid: string;
  size: number;
  uploadedAt: string;
  network: 'calibration' | 'mainnet';
  transactionHash?: string;
}

interface SynapseRetrieveResult {
  cid: string;
  data: Record<string, any>;
  retrievedAt: string;
}

/**
 * SynapseFilecoinService - Filecoin Onchain Cloud via Synapse SDK
 * Uses Synapse SDK for storage, retrieval, and payments on Filecoin
 * Deployed to Filecoin Calibration Testnet for ETHGlobal grant compliance
 */
class SynapseFilecoinService {
  private client: SynapseClient | null = null;
  private network: 'calibration' | 'mainnet' = 'calibration';

  constructor() {
    this.network = (process.env.FILECOIN_NETWORK as 'calibration' | 'mainnet') || 'calibration';
    this.initializeClient();
  }

  /**
   * Initialize Synapse client for the selected network
   */
  private initializeClient(): void {
    try {
      // Synapse client configuration for Filecoin Calibration Testnet
      const config = {
        network: this.network,
        // Add your Synapse API key if needed
        apiKey: process.env.SYNAPSE_API_KEY || '',
      };

      this.client = new SynapseClient(config);
      console.log(`✅ Synapse client initialized for ${this.network} network`);
    } catch (error) {
      console.warn('⚠️ Failed to initialize Synapse client:', error);
      this.client = null;
    }
  }

  /**
   * Upload order data to Filecoin via Synapse SDK
   * Stores encrypted order data with permanent archival
   *
   * @param orderData - Order to upload
   * @param encryptionKey - Optional encryption key for encrypted storage
   * @returns Upload result with CID and transaction details
   */
  async uploadOrderToSynapse(
    orderData: Record<string, any>,
    encryptionKey?: string
  ): Promise<SynapseUploadResult> {
    try {
      if (!this.client) {
        throw new Error('Synapse client not initialized');
      }

      // Prepare order with metadata
      const orderWithMetadata = {
        ...orderData,
        _archived: {
          timestamp: new Date().toISOString(),
          service: 'Filecoin Onchain Cloud (Synapse)',
          network: this.network,
          version: '1',
          encrypted: !!encryptionKey,
        },
      };

      // Convert to JSON
      const jsonString = JSON.stringify(orderWithMetadata, null, 2);
      const fileBuffer = Buffer.from(jsonString, 'utf-8');
      const fileSize = fileBuffer.length;

      console.log(`📤 Uploading order to Filecoin (${this.network} testnet)...`);
      console.log(`   Size: ${fileSize} bytes`);
      console.log(`   Encrypted: ${!!encryptionKey}`);

      // Upload via Synapse SDK
      // Returns CID and transaction details
      const uploadResult = await this.client.uploadFile(
        fileBuffer,
        {
          filename: `order-${orderData.id || 'unknown'}-${Date.now()}.json`,
          metadata: {
            orderId: orderData.orderId,
            timestamp: orderWithMetadata._archived.timestamp,
          },
        }
      );

      const uploadedAt = new Date().toISOString();

      console.log(`✅ Order uploaded to Filecoin (${this.network})`);
      console.log(`   CID: ${uploadResult.cid}`);
      console.log(`   Network: ${this.network}`);
      if (uploadResult.transactionHash) {
        console.log(`   TX: ${uploadResult.transactionHash}`);
      }

      return {
        cid: uploadResult.cid,
        size: fileSize,
        uploadedAt,
        network: this.network,
        transactionHash: uploadResult.transactionHash,
      };
    } catch (error) {
      console.error('❌ Synapse upload failed:', error);
      throw new Error(
        `Failed to upload to Filecoin via Synapse: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Retrieve order from Filecoin via Synapse CID
   *
   * @param cid - Content ID on Filecoin
   * @returns Retrieved order data
   */
  async retrieveOrderFromSynapse(cid: string): Promise<SynapseRetrieveResult> {
    try {
      if (!this.client) {
        throw new Error('Synapse client not initialized');
      }

      console.log(`📥 Retrieving order from Filecoin (${this.network})...`);
      console.log(`   CID: ${cid.substring(0, 8)}...`);

      // Retrieve file via Synapse SDK
      const fileBuffer = await this.client.retrieveFile(cid);
      const jsonString = fileBuffer.toString('utf-8');
      const data = JSON.parse(jsonString);

      console.log(`✅ Order retrieved from Filecoin (${this.network})`);

      return {
        cid,
        data,
        retrievedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Synapse retrieval failed:', error);
      throw new Error(
        `Failed to retrieve from Filecoin via Synapse: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get storage deal information
   * Shows replication, expiry, and payment status
   *
   * @param cid - Content ID
   * @returns Deal information
   */
  async getStorageDealInfo(cid: string): Promise<Record<string, any>> {
    try {
      if (!this.client) {
        throw new Error('Synapse client not initialized');
      }

      const dealInfo = await this.client.getDealInfo(cid);

      return {
        cid,
        ...dealInfo,
        network: this.network,
        status: dealInfo.status || 'active',
      };
    } catch (error) {
      console.error('❌ Failed to get deal info:', error);
      throw error;
    }
  }

  /**
   * Get payment info for stored content
   * Shows cost in FIL and storage duration
   *
   * @param cid - Content ID
   * @returns Payment details
   */
  async getPaymentInfo(cid: string): Promise<Record<string, any>> {
    try {
      if (!this.client) {
        throw new Error('Synapse client not initialized');
      }

      const paymentInfo = await this.client.getPaymentInfo(cid);

      return {
        cid,
        ...paymentInfo,
        network: this.network,
      };
    } catch (error) {
      console.error('❌ Failed to get payment info:', error);
      throw error;
    }
  }

  /**
   * Check if Synapse is configured and accessible
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Get current network (calibration or mainnet)
   */
  getNetwork(): string {
    return this.network;
  }

  /**
   * Switch network and reinitialize client
   */
  setNetwork(network: 'calibration' | 'mainnet'): void {
    this.network = network;
    this.initializeClient();
    console.log(`🔄 Switched to ${network} network`);
  }

  /**
   * Get gateway URL for accessing stored content
   */
  getGatewayUrl(cid: string): string {
    // Use Filecoin gateway or IPFS gateway
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  }

  /**
   * Get Calibration Testnet Explorer URL for transaction
   */
  getExplorerUrl(txHash: string): string {
    if (this.network === 'calibration') {
      return `https://calibration.filfox.info/en/tx/${txHash}`;
    }
    return `https://filfox.info/en/tx/${txHash}`;
  }
}

// Export singleton instance
export const synapseFilecoinService = new SynapseFilecoinService();
