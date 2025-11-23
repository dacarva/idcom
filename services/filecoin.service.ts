import { Synapse } from '@filoz/synapse-sdk';
import type { UploadResult as SynapseUploadResult } from '@filoz/synapse-sdk';
import { ethers } from 'ethers';
import { encrypt, generateKey } from './encryption.service';

export interface UploadResult {
  cid: string;
  ipfsUrl: string;
  fileSize: number;
  uploadedAt: string;
  transactionHash?: string;
}

export interface RetrieveResult {
  cid: string;
  data: Record<string, any>;
  retrievedAt: string;
}

const gatewayUrl = process.env.NEXT_PUBLIC_FILECOIN_GATEWAY || 'https://gateway.lighthouse.storage/ipfs';
const network: 'calibration' | 'mainnet' = (process.env.FILECOIN_NETWORK as 'calibration' | 'mainnet') || 'calibration';
const rpcUrl = process.env.FILECOIN_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1';
const privateKey = process.env.FILECOIN_PRIVATE_KEY || '';

// Payment service state
let synapse: Synapse | null = null;

/**
 * Initialize Filecoin payment service
 */
export async function initializePayments(): Promise<void> {
  if (synapse) return;
  if (!privateKey) throw new Error('FILECOIN_PRIVATE_KEY not configured');
  const keyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  console.log('🔐 Initializing Filecoin...');
  synapse = await Synapse.create({ privateKey: keyWithPrefix, rpcURL: rpcUrl });
  console.log('✅ Filecoin initialized');
}

/**
 * Make a deposit for storage payments
 */
export async function makeDeposit(amountInTFIL: number = 0.5): Promise<string> {
  if (!synapse) await initializePayments();
  console.log(`💳 Making deposit of ${amountInTFIL} tFIL...`);
  const depositAmount = ethers.parseUnits(amountInTFIL.toString(), 'ether');
  try {
    const tx = await synapse!.payments.deposit(depositAmount);
    console.log(`📄 Deposit tx: ${tx.hash}`);
    tx.wait()
      .then(() => console.log('✅ Deposit confirmed'))
      .catch((err) => console.warn('⚠️ Deposit confirmation issue:', err.message));
    return tx.hash;
  } catch (error) {
    console.error('❌ Deposit failed:', error);
    throw error;
  }
}

/**
 * Get current payment balance
 */
export async function getBalance(): Promise<string> {
  if (!synapse) await initializePayments();
  try {
    const balance = await synapse!.payments.balance();
    return ethers.formatEther(balance);
  } catch (error) {
    console.warn('⚠️ Could not fetch balance:', error);
    return 'unknown';
  }
}

/**
 * Get wallet address
 */
export function getWalletAddress(): string {
  const keyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const wallet = new ethers.Wallet(keyWithPrefix);
  return wallet.address;
}

/**
 * Setup payment service - only deposits if balance is below minimum
 */
export async function setupPayments(minBalance: number = 0.1): Promise<void> {
  console.log('\n🚀 Filecoin Setup');
  console.log('='.repeat(60));
  try {
    await initializePayments();
    const balance = await getBalance();
    const balanceNum = parseFloat(balance);
    console.log(`💰 Wallet balance: ${balance} tFIL`);
    console.log(`📊 Minimum threshold: ${minBalance} tFIL`);
    if (balanceNum < minBalance) {
      console.log(`\n⚠️ Balance too low, making deposit...`);
      const txHash = await makeDeposit(0.5);
      console.log(`\n✅ Deposit initiated`);
      console.log(`   TX: ${txHash}`);
    } else {
      console.log(`\n✅ Balance sufficient, no deposit needed`);
    }
    console.log(`\n✅ Filecoin ready for uploads\n`);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

/**
 * Convert PieceCID/PieceLink to string
 * Handles both string and object formats from Synapse SDK
 */
function cidToString(pieceCid: any): string {
  if (typeof pieceCid === 'string') return pieceCid;
  // Try to call toV1().toString() if available (PieceLink object)
  if (pieceCid && typeof pieceCid.toV1 === 'function') {
    try {
      return pieceCid.toV1().toString();
    } catch (e) {
      // Fall through to other methods
    }
  }
  // Fallback: try toString() directly
  if (pieceCid && typeof pieceCid.toString === 'function') {
    return pieceCid.toString();
  }
  // Last resort: check for IPLD format
  if (pieceCid && typeof pieceCid === 'object' && pieceCid['/']) {
    return pieceCid['/'];
  }
  return 'unknown';
}

/**
 * Upload order to Filecoin (with encryption)
 */
export async function uploadOrder(orderData: Record<string, any>, encryptionKey?: string): Promise<UploadResult> {
  try {
    await initializePayments();
    const synapseClient = synapse;

    // Generate or use provided encryption key
    let generatedKey = encryptionKey || generateKey();

    const orderWithMetadata = {
      ...orderData,
      _archived: {
        timestamp: new Date().toISOString(),
        service: 'Filecoin Synapse SDK',
        network,
        version: '1',
        encrypted: true,
      },
    };

    // Encrypt order data
    const encryptionResult = encrypt(orderWithMetadata, generatedKey);
    const uploadContent = new Uint8Array(Buffer.from(encryptionResult.ciphertext, 'base64'));

    console.log(`📤 Uploading encrypted order to Filecoin (${network})...`);
    console.log(`   Size: ${uploadContent.length} bytes`);

    // Upload with retry logic
    let uploadResult: SynapseUploadResult | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📤 Upload attempt ${attempt}/3...`);
        uploadResult = await synapseClient!.storage.upload(uploadContent);
        break;
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt} failed:`, error instanceof Error ? error.message : error);
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
        else throw error;
      }
    }

    if (!uploadResult) throw new Error('Upload failed after all retries');
    const cid = cidToString(uploadResult.pieceCid);
    const uploadedAt = new Date().toISOString();

    console.log(`✅ Order uploaded to Filecoin`);
    console.log(`   CID: ${cid}`);
    console.log(`   Wallet: ${getWalletAddress()}`);

    return { cid, ipfsUrl: `ipfs://${cid}`, fileSize: uploadResult.size, uploadedAt, transactionHash: undefined };
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw new Error(`Failed to upload to Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieve order from Filecoin by CID
 */
export async function retrieveOrder(cid: string): Promise<RetrieveResult> {
  try {
    await initializePayments();
    const synapseClient = synapse;

    console.log(`📥 Retrieving order from Filecoin...`);
    console.log(`   CID: ${cid.substring(0, 16)}...`);

    const data = await synapseClient!.storage.download(cid);

    let parsedData;
    try {
      const jsonString = new TextDecoder().decode(data);
      parsedData = JSON.parse(jsonString);
    } catch {
      parsedData = { rawData: Buffer.from(data).toString('base64'), type: 'binary' };
    }

    console.log(`✅ Order retrieved from Filecoin`);

    return { cid, data: parsedData, retrievedAt: new Date().toISOString() };
  } catch (error) {
    console.error('❌ Retrieval failed:', error);
    throw new Error(`Failed to retrieve from Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a public verifiable link for an order
 */
export function generateVerifiableLink(cid: string): string {
  return `${gatewayUrl}/${cid}`;
}

/**
 * Generate multiple gateway URLs for redundancy
 */
export function generateRedundantLinks(cid: string): string[] {
  return [
    `${gatewayUrl}/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://nft.storage/ipfs/${cid}`,
    `ipfs://${cid}`,
  ].filter(Boolean);
}

/**
 * Check if Filecoin is configured
 */
export function isConfigured(): boolean {
  return !!process.env.FILECOIN_PRIVATE_KEY;
}


// Export as object for backward compatibility
export const filecoinService = {
  // Payment operations
  initializePayments,
  makeDeposit,
  getBalance,
  setupPayments,
  getWalletAddress,
  // Upload operations
  uploadOrder,
  retrieveOrder,
  generateVerifiableLink,
  generateRedundantLinks,
  isConfigured,
};
