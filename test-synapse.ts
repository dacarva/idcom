/**
 * Test script for Synapse SDK Filecoin integration
 * Tests: encryption, upload to Filecoin, retrieval, and decryption
 */

import { encryptionService } from './services/encryption.service';
import { walletService } from './services/wallet.service';
import { synapseFilecoinService } from './services/synapse-filecoin.service';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>) {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, duration });
    console.log(`✅ ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, duration, error: errorMsg });
    console.log(`❌ ${name} - ${errorMsg}`);
  }
}

async function main() {
  console.log('🧪 Testing Synapse SDK Filecoin Integration\n');
  console.log('Network:', synapseFilecoinService.getNetwork());
  console.log('Configured:', synapseFilecoinService.isConfigured() ? 'Yes' : 'No');
  console.log('---\n');

  // Test 1: Encryption key generation
  await runTest('Generate encryption key', async () => {
    const key = encryptionService.generateKey();
    if (!key || key.length === 0) {
      throw new Error('Failed to generate encryption key');
    }
  });

  // Test 2: Wallet signature creation
  let walletSignature: Awaited<ReturnType<typeof walletService.createOrderSignature>>;
  await runTest('Create wallet signature', async () => {
    walletSignature = await walletService.createOrderSignature(
      'Order TEST-001 - $99.99'
    );
    if (!walletSignature.signature || !walletSignature.walletAddress) {
      throw new Error('Failed to create wallet signature');
    }
  });

  // Test 3: Derive encryption key from wallet signature
  let derivedKey: string;
  await runTest('Derive encryption key from wallet', async () => {
    if (!walletSignature) {
      throw new Error('Wallet signature not available');
    }
    derivedKey = walletService.deriveEncryptionKey(
      walletSignature.walletAddress,
      walletSignature.signature,
      walletSignature.salt
    );
    if (!derivedKey) {
      throw new Error('Failed to derive encryption key');
    }
  });

  // Test 4: Encrypt order data
  let encryptedResult: Awaited<ReturnType<typeof encryptionService.encrypt>>;
  const mockOrder = {
    id: 'ORDER-TEST-001',
    userId: 'user-123',
    items: [{ name: 'Test Product', price: 99.99 }],
    total: 99.99,
    timestamp: new Date().toISOString(),
  };

  await runTest('Encrypt order data', async () => {
    if (!derivedKey) {
      throw new Error('Derived key not available');
    }
    encryptedResult = encryptionService.encrypt(mockOrder, derivedKey);
    if (!encryptedResult.ciphertext || !encryptedResult.nonce) {
      throw new Error('Failed to encrypt order');
    }
  });

  // Test 5: Upload encrypted order to Synapse/Filecoin
  let cid: string;
  await runTest('Upload encrypted order to Filecoin (Synapse)', async () => {
    if (!derivedKey) {
      throw new Error('Derived key not available');
    }
    const uploadResult = await synapseFilecoinService.uploadOrderToSynapse(
      mockOrder,
      derivedKey
    );
    if (!uploadResult.cid) {
      throw new Error('Failed to get CID from upload');
    }
    cid = uploadResult.cid;
    console.log(`   CID: ${cid.substring(0, 16)}...`);
    if (uploadResult.transactionHash) {
      console.log(`   TX: ${uploadResult.transactionHash.substring(0, 16)}...`);
    }
  });

  // Test 6: Retrieve order from Filecoin
  let retrievedData: Record<string, any>;
  await runTest('Retrieve order from Filecoin (Synapse)', async () => {
    if (!cid) {
      throw new Error('CID not available');
    }
    const retrieveResult = await synapseFilecoinService.retrieveOrderFromSynapse(cid);
    if (!retrieveResult.data) {
      throw new Error('Failed to retrieve order data');
    }
    retrievedData = retrieveResult.data;
  });

  // Test 7: Decrypt retrieved order
  await runTest('Decrypt retrieved order', async () => {
    if (!derivedKey || !encryptedResult) {
      throw new Error('Encryption materials not available');
    }
    if (!retrievedData) {
      throw new Error('Retrieved data not available');
    }

    // Extract ciphertext and nonce from retrieved data
    const { ciphertext, nonce } = retrievedData;
    if (!ciphertext || !nonce) {
      throw new Error('Ciphertext or nonce missing from retrieved data');
    }

    const decryptedResult = encryptionService.decrypt(ciphertext, nonce, derivedKey);
    if (!decryptedResult.data) {
      throw new Error('Failed to decrypt order');
    }

    // Verify decrypted data matches original
    if (decryptedResult.data.id !== mockOrder.id) {
      throw new Error('Decrypted data does not match original order');
    }
  });

  // Test 8: Get storage deal info
  await runTest('Get storage deal info', async () => {
    if (!cid) {
      throw new Error('CID not available');
    }
    const dealInfo = await synapseFilecoinService.getStorageDealInfo(cid);
    if (!dealInfo) {
      throw new Error('Failed to get deal info');
    }
  });

  // Test 9: Get payment info
  await runTest('Get payment info', async () => {
    if (!cid) {
      throw new Error('CID not available');
    }
    const paymentInfo = await synapseFilecoinService.getPaymentInfo(cid);
    if (!paymentInfo) {
      throw new Error('Failed to get payment info');
    }
  });

  // Test 10: Gateway URL generation
  await runTest('Generate gateway URL', async () => {
    if (!cid) {
      throw new Error('CID not available');
    }
    const gatewayUrl = synapseFilecoinService.getGatewayUrl(cid);
    if (!gatewayUrl || !gatewayUrl.includes(cid)) {
      throw new Error('Invalid gateway URL');
    }
  });

  // Summary
  console.log('\n---\n📊 Test Summary');
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`⏱️  Total time: ${totalTime}ms`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
    console.log('✨ Synapse SDK Filecoin integration is working correctly');
    console.log('📦 Orders are encrypted and stored permanently on Filecoin');
  } else {
    console.log('\n⚠️  Some tests failed:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
}

main().catch(console.error);
