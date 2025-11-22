/**
 * Filecoin Pin Wrapper - uses dynamic import to avoid bundling issues
 * Only works on server side due to Node.js dependencies
 */

import { ethers } from 'ethers';

export async function uploadOrderToFilecoinPin(
  orderData: Record<string, any>,
  encryptedData?: string
): Promise<{ cid: string; size: number; uploadedAt: string; network: string }> {
  try {
    // Dynamic import to avoid bundling in client
    const { FilecoinPin } = await import('filecoin-pin');

    const privateKey = process.env.FILECOIN_PRIVATE_KEY;
    const rpcUrl = process.env.FILECOIN_RPC_URL || 'https://rpc.ankr.com/filecoin_testnet';
    const network = process.env.FILECOIN_NETWORK || 'calibration';

    if (!privateKey) {
      throw new Error('FILECOIN_PRIVATE_KEY not configured');
    }

    const keyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

    console.log(`🔐 Initializing Filecoin Pin...`);

    const pin = new FilecoinPin({
      privateKey: keyWithPrefix,
      rpcURL: rpcUrl,
    });

    console.log(`✅ Filecoin Pin initialized`);

    // Prepare data
    const orderWithMetadata = {
      ...orderData,
      _archived: {
        timestamp: new Date().toISOString(),
        service: 'Filecoin Pin',
        network: network,
        version: '1',
        encrypted: !!encryptedData,
      },
    };

    let uploadContent: Uint8Array;
    if (encryptedData) {
      uploadContent = new Uint8Array(Buffer.from(encryptedData, 'base64'));
      console.log(`📤 Uploading encrypted order (${uploadContent.length} bytes)...`);
    } else {
      const jsonString = JSON.stringify(orderWithMetadata, null, 2);
      uploadContent = new Uint8Array(Buffer.from(jsonString, 'utf-8'));
      console.log(`📤 Uploading order (${uploadContent.length} bytes)...`);
    }

    // Upload
    console.log(`⏳ Processing upload...`);
    const cid = await pin.add(uploadContent);

    console.log(`✅ Upload successful!`);
    console.log(`   CID: ${cid}`);
    console.log(`   Size: ${uploadContent.length} bytes`);

    return {
      cid,
      size: uploadContent.length,
      uploadedAt: new Date().toISOString(),
      network,
    };
  } catch (error) {
    console.error('❌ Filecoin Pin upload failed:', error);
    throw new Error(
      `Failed to upload to Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function retrieveOrderFromFilecoinPin(cid: string): Promise<Record<string, any>> {
  try {
    // Dynamic import
    const { FilecoinPin } = await import('filecoin-pin');

    const privateKey = process.env.FILECOIN_PRIVATE_KEY;
    const rpcUrl = process.env.FILECOIN_RPC_URL || 'https://rpc.ankr.com/filecoin_testnet';

    if (!privateKey) {
      throw new Error('FILECOIN_PRIVATE_KEY not configured');
    }

    const keyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

    const pin = new FilecoinPin({
      privateKey: keyWithPrefix,
      rpcURL: rpcUrl,
    });

    console.log(`📥 Retrieving from Filecoin (CID: ${cid.substring(0, 16)}...)`);

    const data = await pin.cat(cid);

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

    console.log(`✅ Retrieved successfully`);
    return parsedData;
  } catch (error) {
    console.error('❌ Filecoin Pin retrieval failed:', error);
    throw new Error(
      `Failed to retrieve from Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function getWalletAddress(): string {
  const privateKey = process.env.FILECOIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('FILECOIN_PRIVATE_KEY not configured');
  }

  const keyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const wallet = new ethers.Wallet(keyWithPrefix);
  return wallet.address;
}

export async function getWalletBalance(): Promise<string> {
  const privateKey = process.env.FILECOIN_PRIVATE_KEY;
  const rpcUrl = process.env.FILECOIN_RPC_URL || 'https://rpc.ankr.com/filecoin_testnet';

  if (!privateKey) {
    throw new Error('FILECOIN_PRIVATE_KEY not configured');
  }

  const keyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(keyWithPrefix);
  const balance = await provider.getBalance(wallet.address);
  return ethers.formatEther(balance);
}
