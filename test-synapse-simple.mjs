#!/usr/bin/env node
/**
 * Simple test: Upload to Filecoin via Synapse SDK
 */

import { Synapse } from '@filoz/synapse-sdk';
import { ethers } from 'ethers';

async function test() {
  console.log('\n🚀 Synapse SDK Upload Test\n');
  console.log('='.repeat(60));

  try {
    // 1. Load config
    console.log('\n📋 Step 1: Load configuration');
    const privateKey = process.env.FILECOIN_PRIVATE_KEY;
    const rpcUrl = process.env.FILECOIN_RPC_URL || 'https://rpc.ankr.com/filecoin_testnet';

    if (!privateKey) {
      throw new Error('FILECOIN_PRIVATE_KEY not set');
    }

    const keyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const wallet = new ethers.Wallet(keyWithPrefix);

    console.log(`✅ Wallet: ${wallet.address}`);
    console.log(`✅ RPC: ${rpcUrl}`);

    // 2. Check balance
    console.log('\n💰 Step 2: Check balance');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(wallet.address);
    const balanceInTFIL = ethers.formatEther(balance);
    console.log(`✅ Balance: ${balanceInTFIL} tFIL`);

    // 3. Initialize Synapse
    console.log('\n🔐 Step 3: Initialize Synapse SDK');
    const synapse = await Synapse.create({
      privateKey: keyWithPrefix,
      rpcURL: rpcUrl,
    });
    console.log(`✅ Synapse initialized`);

    // 4. Get addresses
    console.log('\n🏢 Step 4: Get Synapse addresses');
    const warmStorageAddress = synapse.getWarmStorageAddress();
    const paymentsAddress = synapse.getPaymentsAddress();
    console.log(`   WarmStorage: ${warmStorageAddress}`);
    console.log(`   Payments: ${paymentsAddress}`);

    // 5. Check payment balance
    console.log('\n💳 Step 5: Check payment balance');
    try {
      const paymentBalance = await synapse.payments.balance();
      console.log(`✅ Payment balance: ${ethers.formatEther(paymentBalance)} tFIL`);
    } catch (e) {
      console.warn(`⚠️  Could not check payment balance`);
    }

    // 6. Deposit with operator approval
    console.log('\n💳 Step 6: Deposit with operator approval');
    const depositAmount = ethers.parseUnits('0.1', 'ether');
    const operatorAddress = '0x02925630df557F957f70E112bA06e50965417CA0';
    const rateAllowance = ethers.parseUnits('1000', 'ether');
    const lockupAllowance = ethers.parseUnits('10', 'ether');
    const maxLockupPeriod = BigInt(86400);

    console.log(`   Deposit amount: ${ethers.formatEther(depositAmount)} tFIL`);
    console.log(`   Rate allowance: ${ethers.formatEther(rateAllowance)}`);
    console.log(`   Lockup allowance: ${ethers.formatEther(lockupAllowance)}`);
    console.log(`   Max lockup period: ${maxLockupPeriod} seconds`);

    const setupTx = await synapse.payments.depositWithPermitAndApproveOperator(
      depositAmount,
      operatorAddress,
      rateAllowance,
      lockupAllowance,
      maxLockupPeriod
    );

    console.log(`📄 Setup tx: ${setupTx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    const receipt = await setupTx.wait();
    console.log(`✅ Deposit and approval confirmed`);

    // 7. Create test data
    console.log('\n📦 Step 7: Create test order');
    const testOrder = {
      id: `order-${Date.now()}`,
      orderId: 'SYNAPSE-TEST-001',
      amount: 99.99,
      currency: 'USD',
      createdAt: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(testOrder, null, 2);
    const uploadData = new Uint8Array(Buffer.from(jsonString, 'utf-8'));
    console.log(`✅ Order created (${uploadData.length} bytes)`);

    // 8. Upload to Filecoin
    console.log('\n📤 Step 8: Upload to Filecoin');
    console.log(`⏳ Uploading ${uploadData.length} bytes...`);
    const uploadResult = await synapse.storage.upload(uploadData);

    console.log(`✅ Upload successful!`);
    console.log(`   CID: ${uploadResult.cid || uploadResult}`);
    console.log(`   Type: ${typeof uploadResult}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!\n');

    return uploadResult;
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

test();
