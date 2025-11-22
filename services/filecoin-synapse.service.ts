import { Synapse, RPC_URLS } from '@filoz/synapse-sdk';
import { ethers } from 'ethers';

interface FilecoinUploadResult {
  cid: string;
  size: number;
  uploadedAt: string;
  network: 'calibration' | 'mainnet';
  transactionHash?: string;
}

interface FilecoinRetrieveResult {
  cid: string;
  data: Record<string, any>;
  retrievedAt: string;
}

/**
 * FilecoinSynapseService - Direct Synapse SDK integration with wallet
 * Uses private key to interact with Filecoin Calibration Testnet
 * Compliant with ETHGlobal Filecoin grant requirements
 */
class FilecoinSynapseService {
  private synapse: Synapse | null = null;
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
   * Initialize Synapse SDK with wallet
   */
  private async initializeSynapse(): Promise<Synapse> {
    if (this.synapse) {
      return this.synapse;
    }

    try {
      if (!this.privateKey) {
        throw new Error('FILECOIN_PRIVATE_KEY not configured');
      }

      // Ensure privateKey has 0x prefix
      const keyWithPrefix = this.privateKey.startsWith('0x') ? this.privateKey : `0x${this.privateKey}`;

      console.log(`🔐 Initializing Synapse with wallet on ${this.network}...`);
      
      this.synapse = await Synapse.create({
        privateKey: keyWithPrefix,
        rpcURL: this.rpcUrl,
      });

      console.log(`✅ Synapse initialized for ${this.network}`);
      return this.synapse;
    } catch (error) {
      console.error('❌ Failed to initialize Synapse:', error);
      throw error;
    }
  }

  /**
   * Upload encrypted order to Filecoin via Synapse
   * 
   * @param orderData - Order data to upload
   * @param encryptedData - Pre-encrypted order data (base64 encoded)
   * @returns Upload result with CID and metadata
   */
  async uploadOrderToFilecoin(
    orderData: Record<string, any>,
    encryptedData?: string
  ): Promise<FilecoinUploadResult> {
    try {
      const synapse = await this.initializeSynapse();

      // Ensure wallet has sufficient balance for storage
      console.log(`💰 Checking and preparing payment balance...`);
      try {
        // Get balance
        const balance = await this.getWalletBalance();
        const balanceNum = parseFloat(balance);
        
        if (balanceNum < 0.2) {
          throw new Error(`Insufficient balance: ${balance} tFIL. Need at least 0.2 tFIL for storage + gas.`);
        }

        // Deposit with operator approval all-in-one
        console.log(`💳 Setting up payments with operator approval...`);
        try {
          const depositAmount = ethers.parseUnits('0.1', 'ether');
          const operatorAddress = '0x02925630df557F957f70E112bA06e50965417CA0'; // Synapse operator
          const rateAllowance = ethers.parseUnits('1000', 'ether');
          const lockupAllowance = ethers.parseUnits('10', 'ether');
          const maxLockupPeriod = BigInt(86400); // 1 day in seconds
          
          console.log(`💳 Depositing and approving operator...`);
          
          const tx = await synapse.payments.depositWithPermitAndApproveOperator(
            depositAmount,
            operatorAddress,
            rateAllowance,
            lockupAllowance,
            maxLockupPeriod
          );
          
          console.log(`📄 Setup tx: ${tx.hash}`);
          const receipt = await tx.wait();
          console.log(`✅ Deposit and operator approval confirmed`);
        } catch (depositError) {
          console.warn(`⚠️ Setup warning:`, depositError instanceof Error ? depositError.message : depositError);
          // Try simple deposit as fallback
          try {
            console.log(`💡 Trying simple deposit as fallback...`);
            const depositAmount = ethers.parseUnits('0.1', 'ether');
            const depositTx = await synapse.payments.deposit(depositAmount);
            await depositTx.wait();
            console.log(`✅ Simple deposit confirmed`);
          } catch (fallbackError) {
            console.warn(`⚠️ Fallback deposit also failed`, fallbackError);
          }
        }
      } catch (balanceError) {
        console.error(`❌ Balance check failed:`, balanceError instanceof Error ? balanceError.message : balanceError);
        throw balanceError;
      }

      // Don't need explicit service approval - deposit handles it
      console.log(`💡 Storage preparation complete`);
      
      // Small delay to ensure deposit is confirmed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Prepare order with metadata
      const orderWithMetadata = {
        ...orderData,
        _archived: {
          timestamp: new Date().toISOString(),
          service: 'Filecoin Synapse SDK',
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

      // Upload via Synapse SDK
      // The SDK handles the storage deal creation
      const uploadResult = await synapse.storage.upload(uploadContent);

      // Extract CID from result (could be string or object)
      let cid: string;
      if (typeof uploadResult === 'string') {
        cid = uploadResult;
      } else if (uploadResult?.cid) {
        cid = uploadResult.cid;
      } else if (uploadResult?.hash) {
        cid = uploadResult.hash;
      } else {
        // Fallback: convert to string
        cid = uploadResult?.toString() || String(uploadResult);
      }

      const uploadedAt = new Date().toISOString();

      console.log(`✅ Order uploaded to Filecoin`);
      console.log(`   CID: ${cid}`);
      console.log(`   Network: ${this.network}`);
      console.log(`   Size: ${uploadContent.length} bytes`);

      return {
        cid,
        size: uploadContent.length,
        uploadedAt,
        network: this.network,
        transactionHash: cid,
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
   * Retrieve order from Filecoin via CID
   * 
   * @param cid - Content ID on Filecoin
   * @returns Retrieved order data
   */
  async retrieveOrderFromFilecoin(cid: string): Promise<FilecoinRetrieveResult> {
    try {
      const synapse = await this.initializeSynapse();

      console.log(`📥 Retrieving order from Filecoin...`);
      console.log(`   CID: ${cid.substring(0, 16)}...`);

      // Retrieve file via Synapse SDK
      const data = await synapse.storage.download(cid);
      
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
      console.error('❌ Synapse retrieval failed:', error);
      throw new Error(
        `Failed to retrieve from Filecoin via Synapse: ${
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
  getExplorerUrl(txHash?: string): string {
    if (!txHash) return '';
    if (this.network === 'calibration') {
      return `https://calibration.filfox.info/en/tx/${txHash}`;
    }
    return `https://filfox.info/en/tx/${txHash}`;
  }

  /**
   * Check wallet balance
   */
  async getWalletBalance(): Promise<string> {
    try {
      const synapse = await this.initializeSynapse();
      // Get balance from provider
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const keyWithPrefix = this.privateKey.startsWith('0x') ? this.privateKey : `0x${this.privateKey}`;
      const wallet = new ethers.Wallet(keyWithPrefix, provider);
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
    };
  }

  /**
   * Test connection to Filecoin
   */
  async testConnection(): Promise<boolean> {
    try {
      const synapse = await this.initializeSynapse();
      console.log('✅ Synapse connection successful');
      return true;
    } catch (error) {
      console.error('❌ Synapse connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const filecoinSynapseService = new FilecoinSynapseService();
