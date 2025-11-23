import { NextRequest, NextResponse } from 'next/server'
import { filecoinService } from '@/services/filecoin.service'
import { orderService } from '@/services/order.service'
import { encryptionService } from '@/services/encryption.service'
import { walletService } from '@/services/wallet.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, userId, items, subtotal, subsidy, shipping, total, shippingAddress, paymentMethod, timestamp } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      )
    }

    // Prepare order data for Filecoin archival
    const orderData = {
      id: orderId,
      orderId,
      userId,
      items,
      subtotal,
      subsidy,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      timestamp: timestamp || new Date().toISOString(),
    }

    // Create wallet signature for order encryption
    const walletSignature = await walletService.createOrderSignature(
      `Order ${orderId} - ${orderData.total} USD`
    )
    console.log(`🔐 Wallet signature created: ${walletSignature.walletAddress.substring(0, 8)}...`)

    // Derive encryption key from wallet signature
    const encryptionKey = walletService.deriveEncryptionKey(
      walletSignature.walletAddress,
      walletSignature.signature,
      walletSignature.salt
    )
    console.log(`🔑 Encryption key derived from wallet`)

    // Archive order to Filecoin (non-blocking: background)
    let cid: string | null = null

    if (filecoinService.isConfigured()) {
      filecoinService
        .uploadOrder(orderData, encryptionKey)
        .then(async (uploadResult) => {
          try {
            cid = uploadResult.cid
            console.log(`✅ Background archival complete. CID: ${cid}`)
            // Update DB with CID once ready (best-effort)
            try {
              if (orderService.isConfigured()) {
                await orderService.updateOrderCid(orderId, cid)
                console.log(`✅ Order CID saved to DB: ${orderId} → ${cid}`)
              }
            } catch (dbUpdateErr) {
              console.warn('⚠️ Could not update order CID in DB:', dbUpdateErr)
            }
          } catch (e) {
            console.error('⚠️ Background archival post-processing failed:', e)
          }
        })
        .catch((archiveError) => {
          console.error('⚠️ Background Filecoin archival failed:', archiveError)
        })
    } else {
      console.warn('⚠️ Filecoin not configured, order saved locally only')
    }

    // Save order to Supabase database with encryption salt
    try {
      if (orderService.isConfigured()) {
        await orderService.saveOrder({
          ...orderData,
          cid,
          encryption_salt: walletSignature.salt,
        })
        console.log(`✅ Order saved to Supabase database`)
      } else {
        console.warn('⚠️ Supabase not configured, order saved to Filecoin only')
      }
    } catch (dbError) {
      console.error('⚠️ Database save failed:', dbError)
      // Don't fail checkout if database fails
    }

    return NextResponse.json(
      {
        success: true,
        orderId,
        cid, // will be null until background archival completes
        status: filecoinService.isConfigured() ? 'pending' : 'created',
        encryptionSalt: walletSignature.salt,
        message: filecoinService.isConfigured()
          ? 'Order created. Filecoin archival is running in the background.'
          : 'Order created (Filecoin archival skipped)',
      },
      { status: filecoinService.isConfigured() ? 202 : 201 }
    )
  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const amount = searchParams.get('amount')

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Generate payment link pointing to external wallet/payment backend
    const walletBackendUrl = process.env.NEXT_PUBLIC_WALLET_URL || 'http://localhost:3001'
    const externalPaymentLink = `${walletBackendUrl}/api/checkout?amount=${parsedAmount}`
    
    const paymentData = {
      status: 'success',
      paymentLink: externalPaymentLink,
      amount: parsedAmount,
      createdAt: new Date().toISOString(),
      orderId: `ORDER-${Date.now()}`,
    }

    return NextResponse.json(paymentData, { status: 200 })
  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
