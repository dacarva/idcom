#!/usr/bin/env ts-node
/**
 * Test Filecoin Synapse Upload
 * Tests real upload to Filecoin Calibration testnet via Synapse SDK
 */

import { filecoinSynapseService } from './services/filecoin-synapse.service';
import { encryptionService } from './services/encryption.service';
import { walletService } from './services/wallet.service';

async function runTests() {
  console.log('\n🚀 Filecoin Synapse Upload Test Suite\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Check configuration
    console.log('\n📋 Test 1: Check Configuration');
    const networkInfo = filecoinSynapseService.getNetworkInfo();
    console.log(`✅ Network: ${networkInfo.network}`);
    console.log(`✅ Wallet: ${networkInfo.walletAddress}`);
    console.log(`✅ RPC: ${networkInfo.rpcUrl}`);
    console.log(`✅ Configured: ${networkInfo.configured}`);

    // Test 2: Test connection
    console.log('\n🔌 Test 2: Test Connection to Filecoin');
    const connected = await filecoinSynapseService.testConnection();
    if (!connected) {
      throw new Error('Failed to connect to Filecoin');
    }
    console.log('✅ Connected to Filecoin Calibration testnet');

    // Test 3: Check balance
    console.log('\n💰 Test 3: Check Wallet Balance');
    const balance = await filecoinSynapseService.getWalletBalance();
    console.log(`✅ Balance: ${balance} tFIL`);

    // Test 4: Create mock order
    console.log('\n📦 Test 4: Create Mock Order');
    const mockOrder = {
      id: `order-${Date.now()}`,
      orderId: 'TEST-001',
      amount: 99.99,
      currency: 'USD',
      items: [
        {
          product: 'Test Product',
          quantity: 2,
          price: 49.99,
        },
      ],
      customer: {
        name: 'Test User',
        email: 'test@example.com',
      },
      createdAt: new Date().toISOString(),
    };
    console.log(`✅ Order created:`, JSON.stringify(mockOrder, null, 2));

    // Test 5: Encrypt order
    console.log('\n🔐 Test 5: Encrypt Order');
    const encryptionKey = encryptionService.generateKey();
    console.log(`✅ Encryption key generated: ${encryptionKey.substring(0, 16)}...`);

    const encrypted = encryptionService.encrypt(JSON.stringify(mockOrder), encryptionKey);
    console.log(`✅ Order encrypted`);
    console.log(`   Ciphertext: ${encrypted.ciphertext.substring(0, 32)}...`);
    console.log(`   Nonce: ${encrypted.nonce.substring(0, 16)}...`);

    // Test 6: Upload to Filecoin (encrypted)
    console.log('\n📤 Test 6: Upload Encrypted Order to Filecoin');
    const uploadResult = await filecoinSynapseService.uploadOrderToFilecoin(
      mockOrder,
      encrypted.ciphertext + '||' + encrypted.nonce // Combine ciphertext and nonce
    );
    console.log(`✅ Upload successful!`);
    console.log(`   CID: ${uploadResult.cid}`);
    console.log(`   Size: ${uploadResult.size} bytes`);
    console.log(`   Network: ${uploadResult.network}`);
    console.log(`   Uploaded at: ${uploadResult.uploadedAt}`);

    // Test 7: Retrieve from Filecoin
    console.log('\n📥 Test 7: Retrieve Order from Filecoin');
    const retrieved = await filecoinSynapseService.retrieveOrderFromFilecoin(uploadResult.cid);
    console.log(`✅ Retrieved successfully!`);
    console.log(`   CID: ${retrieved.cid.substring(0, 16)}...`);
    console.log(`   Retrieved at: ${retrieved.retrievedAt}`);

    // Test 8: Gateway URLs
    console.log('\n🌐 Test 8: Gateway & Explorer URLs');
    const gatewayUrl = filecoinSynapseService.getGatewayUrl(uploadResult.cid);
    const explorerUrl = filecoinSynapseService.getExplorerUrl(uploadResult.transactionHash);
    console.log(`✅ Gateway: ${gatewayUrl}`);
    console.log(`✅ Explorer: ${explorerUrl}`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed!\n');

    return {
      success: true,
      cid: uploadResult.cid,
      order: mockOrder,
      encrypted,
    };
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
