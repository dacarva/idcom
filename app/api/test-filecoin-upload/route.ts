/**
 * GET /api/test-filecoin-upload
 * Test endpoint for Filecoin Synapse SDK upload
 * Uploads a test order and returns the CID
 */

import { NextRequest, NextResponse } from 'next/server';
import { filecoinSynapseService } from '@/services/filecoin-synapse.service';
import { encryptionService } from '@/services/encryption.service';

export async function GET(request: NextRequest) {
  try {
    console.log('\n🚀 Testing Filecoin Synapse Upload via API\n');

    // Test 1: Check configuration
    const networkInfo = filecoinSynapseService.getNetworkInfo();
    console.log('📋 Network Info:', networkInfo);

    if (!networkInfo.configured) {
      return NextResponse.json(
        {
          error: 'Filecoin not configured',
          message: 'FILECOIN_PRIVATE_KEY not set',
        },
        { status: 500 }
      );
    }

    // Test 2: Check balance
    console.log('💰 Checking balance...');
    const balance = await filecoinSynapseService.getWalletBalance();
    console.log(`Balance: ${balance} tFIL`);

    if (parseFloat(balance) < 0.2) {
      return NextResponse.json(
        {
          error: 'Insufficient balance',
          message: `Need at least 0.2 tFIL, have ${balance}`,
        },
        { status: 500 }
      );
    }

    // Test 4: Create test order
    const testOrder = {
      id: `order-${Date.now()}`,
      orderId: 'API-TEST-001',
      amount: 99.99,
      currency: 'USD',
      items: [
        {
          product: 'Test Product',
          quantity: 1,
          price: 99.99,
        },
      ],
      customer: {
        name: 'Test User',
        email: 'test@example.com',
      },
      createdAt: new Date().toISOString(),
    };

    console.log('📦 Test order:', testOrder);

    // Test 5: Encrypt order
    console.log('🔐 Encrypting order...');
    const encryptionKey = encryptionService.generateKey();
    const encrypted = encryptionService.encrypt(JSON.stringify(testOrder), encryptionKey);
    console.log('✅ Order encrypted');

    // Test 6: Upload to Filecoin
    console.log('📤 Uploading to Filecoin via Synapse SDK...');
    const uploadResult = await filecoinSynapseService.uploadOrderToFilecoin(
      testOrder,
      encrypted.ciphertext
    );

    console.log('✅ Upload successful!');
    console.log('Upload result:', uploadResult);

    return NextResponse.json(
      {
        success: true,
        message: 'Filecoin upload test successful',
        data: {
          cid: uploadResult.cid,
          size: uploadResult.size,
          uploadedAt: uploadResult.uploadedAt,
          network: uploadResult.network,
          wallet: networkInfo.walletAddress,
          balance: balance,
          gateway: `https://gateway.lighthouse.storage/ipfs/${uploadResult.cid}`,
          explorer: `https://calibration.filfox.info/en/tx/${uploadResult.transactionHash}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json(
      {
        error: 'Upload test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
