import { NextRequest, NextResponse } from 'next/server';
import { filecoinService } from '@/services/filecoin.service';

/**
 * POST /api/orders/archive-filecoin
 * Archives an order to Filecoin (permanent, immutable storage)
 * 
 * Request body:
 * {
 *   orderId: string,
 *   userId: string,
 *   items: Array,
 *   total: number,
 *   timestamp: string,
 *   ... any other order data
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   cid: string (Content ID - unique immutable identifier),
 *   ipfsUrl: string,
 *   verifiableLink: string,
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const orderData = await request.json();

    // Validate required fields
    if (!orderData.orderId) {
      return NextResponse.json(
        { error: 'Missing orderId in request body' },
        { status: 400 }
      );
    }

    // Check if Filecoin service is configured
    if (!filecoinService.isConfigured()) {
      return NextResponse.json(
        {
          warning: 'Filecoin archival is not configured',
          message: 'Order saved to database but not archived to Filecoin',
        },
        { status: 202 }
      );
    }

    // Kick off background upload (do not await)
    const startedAt = new Date().toISOString();
    filecoinService
      .uploadOrder(orderData)
      .then((uploadResult) => {
        try {
          const verifiableLink = filecoinService.generateVerifiableLink(uploadResult.cid);
          console.log(
            `✅ Background archive complete | CID: ${uploadResult.cid} | Link: ${verifiableLink}`
          );
        } catch {}
      })
      .catch((e) => {
        console.error('❌ Background archive failed:', e);
      });

    // Return immediately with pending status
    return NextResponse.json(
      {
        success: true,
        status: 'pending',
        message: 'Archival queued. Check order detail later for CID.',
        startedAt,
        orderId: orderData.orderId,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('❌ Archive endpoint error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to archive order',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/archive-filecoin?cid=QmXxxx
 * Retrieves an archived order from Filecoin by CID
 */
export async function GET(request: NextRequest) {
  try {
    // Get CID from query parameters
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');

    if (!cid) {
      return NextResponse.json(
        { error: 'Missing CID parameter' },
        { status: 400 }
      );
    }

    // Retrieve order from Filecoin
    const retrieveResult = await filecoinService.retrieveOrder(cid);

    return NextResponse.json(
      {
        success: true,
        cid: retrieveResult.cid,
        order: retrieveResult.data,
        retrievedAt: retrieveResult.retrievedAt,
        message: '✅ Order successfully retrieved from Filecoin',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Retrieval endpoint error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve order',
      },
      { status: 500 }
    );
  }
}
