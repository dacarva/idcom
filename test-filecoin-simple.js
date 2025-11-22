/**
 * Simple test: Check wallet and RPC connection
 */

require('dotenv').config({ path: '.env.local' });

const { ethers } = require('ethers');

async function test() {
  console.log('\n🚀 Filecoin Wallet Test\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Load credentials
    console.log('\n📋 Test 1: Load Environment');
    const privateKey = process.env.FILECOIN_PRIVATE_KEY;
    const rpcUrl = process.env.FILECOIN_RPC_URL;
    const network = process.env.FILECOIN_NETWORK;

    if (!privateKey) {
      throw new Error('FILECOIN_PRIVATE_KEY not set');
    }
    if (!rpcUrl) {
      throw new Error('FILECOIN_RPC_URL not set');
    }

    console.log(`✅ Network: ${network}`);
    console.log(`✅ RPC: ${rpcUrl}`);
    console.log(`✅ Private key: ${privateKey.substring(0, 10)}...`);

    // Test 2: Create wallet
    console.log('\n🔐 Test 2: Create Wallet');
    const keyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const wallet = new ethers.Wallet(keyWithPrefix);
    console.log(`✅ Wallet address: ${wallet.address}`);

    // Test 3: Connect to RPC
    console.log('\n🔌 Test 3: Connect to RPC');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network_info = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network_info.name}`);
    console.log(`✅ Chain ID: ${network_info.chainId}`);

    // Test 4: Check balance
    console.log('\n💰 Test 4: Check Balance');
    const connectedWallet = wallet.connect(provider);
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`✅ Balance: ${balanceInEth} tFIL`);

    if (parseFloat(balanceInEth) === 0) {
      console.warn('⚠️  Wallet has 0 balance. Please get test FIL from faucet.');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
