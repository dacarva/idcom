import { NextRequest, NextResponse } from 'next/server';
import { filecoinService } from '@/services/filecoin.service';

/**
 * GET /api/filecoin/payment-init
 * Initialize Filecoin payment service
 * Should be called once at application startup
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   wallet: string,
 *   balance: string,
 *   depositTx?: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    console.log('\n🔗 Payment Service Initialization Request');

    // Get optional minBalance parameter (default 0.1 tFIL)
    const { searchParams } = new URL(request.url);
    const minBalanceParam = searchParams.get('minBalance');
    const minBalance = minBalanceParam ? parseFloat(minBalanceParam) : 0.1;

    // Setup payment service (initialize + smart deposit)
    await filecoinService.setupPayments(minBalance);

    // Get wallet info
    const walletAddress = filecoinService.getWalletAddress();
    const balance = await filecoinService.getBalance();

    console.log(`✅ Payment service initialized via API`);

    return NextResponse.json(
      {
        success: true,
        message: 'Filecoin payment service initialized',
        wallet: walletAddress,
        balance: `${balance} tFIL`,
        readyForUploads: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Payment initialization failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Payment initialization failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/filecoin/payment-status
 * Check payment service status
 *
 * Response:
 * {
 *   initialized: boolean,
 *   depositDone: boolean,
 *   wallet: string,
 *   balance: string
 * }
 */
export async function HEAD(request: NextRequest) {
  try {
    const walletAddress = filecoinService.getWalletAddress();
    const balance = await filecoinService.getBalance();

    return NextResponse.json(
      {
        initialized: true,
        wallet: walletAddress,
        balance: `${balance} tFIL`,
        readyForUploads: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        initialized: false,
        ready: false,
        error: error instanceof Error ? error.message : 'Service not ready',
      },
      { status: 503 }
    );
  }
}
