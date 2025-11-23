/**
 * GET /api/test-filecoin-upload
 * Test endpoint for Filecoin Synapse SDK upload
 * Uploads a test order and returns the CID
 */

import { NextRequest, NextResponse } from 'next/server';
import { filecoinService, isConfigured, getWalletAddress } from '@/services/filecoin.service';
import { generateKey, encrypt } from '@/services/encryption.service';

export async function GET(request: NextRequest) {
  try {
    console.log('\n🚀 Testing Filecoin Upload via API\n');

    // Test 1: Check configuration
    if (!isConfigured()) {
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
    const balance = await filecoinService.getBalance();
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

    // Test 3: Create test order
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

    console.log('📎 Test order:', testOrder);

    // Test 4: Encrypt order
    console.log('🔐 Encrypting order...');
    const encryptionKey = generateKey();
    const encrypted = encrypt(testOrder, encryptionKey);
    console.log('✅ Order encrypted');

    // Test 5: Upload to Filecoin
    console.log('📤 Uploading to Filecoin...');
    const uploadResult = await filecoinService.uploadOrder(
      testOrder,
      encryptionKey
    );

    console.log('✅ Upload successful!');
    console.log('Upload result:', uploadResult);

    return NextResponse.json(
      {
        success: true,
        message: 'Filecoin upload test successful',
        data: {
          cid: uploadResult.cid,
          fileSize: uploadResult.fileSize,
          uploadedAt: uploadResult.uploadedAt,
          wallet: getWalletAddress(),
          balance,
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
