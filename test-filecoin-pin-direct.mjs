import { FilecoinPin } from 'filecoin-pin';
import { ethers } from 'ethers';

const privateKey = process.env.FILECOIN_PRIVATE_KEY;
const rpcUrl = process.env.FILECOIN_RPC_URL || 'https://rpc.ankr.com/filecoin_testnet';

if (!privateKey) {
  console.error('❌ FILECOIN_PRIVATE_KEY not set');
  process.exit(1);
}

const keyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

console.log('🔐 Initializing Filecoin Pin...');

try {
  const pin = new FilecoinPin({
    privateKey: keyWithPrefix,
    rpcURL: rpcUrl,
  });

  console.log('✅ FilecoinPin initialized successfully');
  console.log('📦 Testing with sample data...');
  
  const testData = new Uint8Array(Buffer.from('Hello, Filecoin Pin!'));
  console.log(`📤 Uploading ${testData.length} bytes...`);
  
  // Note: This will fail without proper setup, but we just want to test imports
  console.log('✅ FilecoinPin instance created and ready');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
