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

    // Archive order to Filecoin (with encryption)
    let cid: string | null = null
    let archiveResult = null
    
    try {
      if (filecoinService.isConfigured()) {
        const uploadResult = await filecoinService.uploadOrder(orderData, encryptionKey)
        cid = uploadResult.cid
        archiveResult = uploadResult
        console.log(`✅ Order archived to Filecoin with CID: ${cid}`)
      } else {
        console.warn('⚠️ Filecoin not configured, order saved locally only')
      }
    } catch (archiveError) {
      console.error('⚠️ Filecoin archival failed, but order creation continues:', archiveError)
      // Don't fail checkout if Filecoin fails
    }

    // Save order to Supabase database with wallet signature
    try {
      if (orderService.isConfigured()) {
        await orderService.saveOrder({
          ...orderData,
          cid,
          wallet_address: walletSignature.walletAddress,
          wallet_signature: walletSignature.signature,
          encryption_salt: walletSignature.salt,
        })
        console.log(`✅ Order saved to Supabase database with wallet signature`)
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
        cid,
        walletAddress: walletSignature.walletAddress,
        walletSignature: walletSignature.signature,
        encryptionSalt: walletSignature.salt,
        message: cid ? 'Order created and archived to Filecoin (wallet-secured)' : 'Order created (Filecoin archival skipped)',
      },
      { status: 201 }
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
