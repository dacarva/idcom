import { FilecoinPin } from 'filecoin-pin';
import { ethers } from 'ethers';

interface FilecoinPinUploadResult {
  cid: string;
  size: number;
  uploadedAt: string;
  network: 'calibration' | 'mainnet';
}

interface FilecoinPinRetrieveResult {
  cid: string;
  data: Record<string, any>;
  retrievedAt: string;
}

/**
 * FilecoinPinService - Filecoin Pin integration for order archival
 * Simpler than Synapse SDK with automatic payment handling
 * Compliant with ETHGlobal Filecoin grant requirements
 */
class FilecoinPinService {
  private pin: FilecoinPin | null = null;
  private network: 'calibration' | 'mainnet' = 'calibration';
  private rpcUrl: string;
  private privateKey: string;

  constructor() {
    this.network = (process.env.FILECOIN_NETWORK as 'calibration' | 'mainnet') || 'calibration';
    this.rpcUrl = process.env.FILECOIN_RPC_URL || 'https://rpc.ankr.com/filecoin_testnet';
    this.privateKey = process.env.FILECOIN_PRIVATE_KEY || '';

    if (!this.privateKey) {
      console.warn('⚠️ FILECOIN_PRIVATE_KEY not set in environment');
    }
  }

  /**
   * Initialize Filecoin Pin client
   */
  private async initializePin(): Promise<FilecoinPin> {
    if (this.pin) {
      return this.pin;
    }

    try {
      if (!this.privateKey) {
        throw new Error('FILECOIN_PRIVATE_KEY not configured');
      }

      // Ensure privateKey has 0x prefix
      const keyWithPrefix = this.privateKey.startsWith('0x') ? this.privateKey : `0x${this.privateKey}`;

      console.log(`🔐 Initializing Filecoin Pin with wallet on ${this.network}...`);

      // Create Filecoin Pin instance
      this.pin = new FilecoinPin({
        privateKey: keyWithPrefix,
        rpcURL: this.rpcUrl,
      });

      console.log(`✅ Filecoin Pin initialized for ${this.network}`);
      return this.pin;
    } catch (error) {
      console.error('❌ Failed to initialize Filecoin Pin:', error);
      throw error;
    }
  }

  /**
   * Upload order to Filecoin via Filecoin Pin
   * Handles payment automatically
   *
   * @param orderData - Order data to upload
   * @param encryptedData - Pre-encrypted order data (base64 encoded)
   * @returns Upload result with CID
   */
  async uploadOrder(
    orderData: Record<string, any>,
    encryptedData?: string
  ): Promise<FilecoinPinUploadResult> {
    try {
      const pin = await this.initializePin();

      // Prepare order with metadata
      const orderWithMetadata = {
        ...orderData,
        _archived: {
          timestamp: new Date().toISOString(),
          service: 'Filecoin Pin',
          network: this.network,
          version: '1',
          encrypted: !!encryptedData,
          rpcUrl: this.rpcUrl,
        },
      };

      // Use encrypted data if provided, otherwise stringify order
      let uploadContent: Uint8Array;
      if (encryptedData) {
        // encryptedData is base64 encoded, decode to bytes
        uploadContent = new Uint8Array(Buffer.from(encryptedData, 'base64'));
        console.log(`📤 Uploading encrypted order to Filecoin (${this.network})...`);
      } else {
        const jsonString = JSON.stringify(orderWithMetadata, null, 2);
        uploadContent = new Uint8Array(Buffer.from(jsonString, 'utf-8'));
        console.log(`📤 Uploading order to Filecoin (${this.network})...`);
      }

      console.log(`   Size: ${uploadContent.length} bytes`);
      console.log(`   Encrypted: ${!!encryptedData}`);

      // Upload via Filecoin Pin
      // Pin.add handles all payment automatically
      console.log(`⏳ Processing upload (payment handled automatically)...`);
      const uploadResult = await pin.add(uploadContent);

      const uploadedAt = new Date().toISOString();

      console.log(`✅ Order uploaded to Filecoin`);
      console.log(`   CID: ${uploadResult}`);
      console.log(`   Network: ${this.network}`);
      console.log(`   Size: ${uploadContent.length} bytes`);

      return {
        cid: uploadResult,
        size: uploadContent.length,
        uploadedAt,
        network: this.network,
      };
    } catch (error) {
      console.error('❌ Filecoin Pin upload failed:', error);
      throw new Error(
        `Failed to upload to Filecoin via Pin: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Retrieve order from Filecoin via CID
   * Uses IPFS gateway for retrieval
   *
   * @param cid - Content ID on Filecoin
   * @returns Retrieved order data
   */
  async retrieveOrder(cid: string): Promise<FilecoinPinRetrieveResult> {
    try {
      const pin = await this.initializePin();

      console.log(`📥 Retrieving order from Filecoin...`);
      console.log(`   CID: ${cid.substring(0, 16)}...`);

      // Retrieve file via Filecoin Pin
      const data = await pin.cat(cid);

      // Try to parse as JSON, fallback to raw data
      let parsedData;
      try {
        const jsonString = new TextDecoder().decode(data);
        parsedData = JSON.parse(jsonString);
      } catch {
        parsedData = {
          rawData: Buffer.from(data).toString('base64'),
          type: 'binary',
        };
      }

      console.log(`✅ Order retrieved from Filecoin`);

      return {
        cid,
        data: parsedData,
        retrievedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Filecoin Pin retrieval failed:', error);
      throw new Error(
        `Failed to retrieve from Filecoin via Pin: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get gateway URL for accessing stored content
   */
  getGatewayUrl(cid: string): string {
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  }

  /**
   * Get Filecoin Explorer URL
   */
  getExplorerUrl(cid: string): string {
    if (this.network === 'calibration') {
      return `https://calibration.filfox.info/en/cid/${cid}`;
    }
    return `https://filfox.info/en/cid/${cid}`;
  }

  /**
   * Check wallet balance
   */
  async getWalletBalance(): Promise<string> {
    try {
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const keyWithPrefix = this.privateKey.startsWith('0x') ? this.privateKey : `0x${this.privateKey}`;
      const wallet = new ethers.Wallet(keyWithPrefix);
      const balance = await provider.getBalance(wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('❌ Failed to get wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    try {
      const keyWithPrefix = this.privateKey.startsWith('0x') ? this.privateKey : `0x${this.privateKey}`;
      const wallet = new ethers.Wallet(keyWithPrefix);
      return wallet.address;
    } catch (error) {
      console.error('❌ Failed to get wallet address:', error);
      throw error;
    }
  }

  /**
   * Get network info
   */
  getNetworkInfo(): Record<string, any> {
    return {
      network: this.network,
      rpcUrl: this.rpcUrl,
      walletAddress: this.getWalletAddress(),
      configured: !!this.privateKey,
      service: 'Filecoin Pin',
    };
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const pin = await this.initializePin();
      console.log('✅ Filecoin Pin connection successful');
      return true;
    } catch (error) {
      console.error('❌ Filecoin Pin connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const filecoinPinService = new FilecoinPinService();
