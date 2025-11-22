import { NextRequest, NextResponse } from 'next/server'
import { filecoinService } from '@/services/filecoin.service'
import { encryptionService } from '@/services/encryption.service'
import { walletService } from '@/services/wallet.service'
import { orderService } from '@/services/order.service'

interface DecryptRequest {
  cid: string
}

/**
 * POST /api/orders/decrypt
 * Retrieves encrypted order from Filecoin and decrypts it
 * In production, this would call Oasis ROFL for decryption in TEE
 * For now, we decrypt locally (user has provided their encryption key)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DecryptRequest
    const { cid } = body

    if (!cid) {
      return NextResponse.json(
        { error: 'Missing cid' },
        { status: 400 }
      )
    }

    console.log(`🔓 Decryption requested for CID: ${cid.substring(0, 8)}...`)

    // Retrieve encrypted order from Filecoin
    let retrievedOrder: any
    try {
      const result = await filecoinService.retrieveOrder(cid)
      retrievedOrder = result.data
    } catch (error) {
      console.error('❌ Failed to retrieve order from Filecoin:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve order from Filecoin' },
        { status: 500 }
      )
    }

    // Verify this is an encrypted order
    if (!retrievedOrder.type || retrievedOrder.type !== 'encrypted_order') {
      console.warn('⚠️ Order is not encrypted')
      return NextResponse.json(
        { error: 'Order is not encrypted' },
        { status: 400 }
      )
    }

    // Extract encryption components
    const { ciphertext, nonce } = retrievedOrder

    if (!ciphertext || !nonce) {
      return NextResponse.json(
        { error: 'Invalid encrypted data format' },
        { status: 400 }
      )
    }

    // Load wallet data for this order from Supabase
    // For now we derive server-side using the stored mock signature
    let walletAddress: string | null = null
    let walletSignature: string | null = null
    let encryptionSalt: string | null = null

    try {
      if (orderService.isConfigured()) {
        const order = await orderService.getOrderByCid(cid)
        walletAddress = order?.wallet_address || null
        walletSignature = order?.wallet_signature || null
        encryptionSalt = order?.encryption_salt || null
      }
    } catch (e) {
      console.warn('⚠️ Could not load order wallet data from DB, proceeding without it')
    }

    if (!walletAddress || !walletSignature || !encryptionSalt) {
      return NextResponse.json(
        { error: 'Missing wallet data for decryption' },
        { status: 400 }
      )
    }

    // Derive encryption key from wallet signature
    const encryptionKey = walletService.deriveEncryptionKey(
      walletAddress,
      walletSignature,
      encryptionSalt
    )

    // Decrypt the order
    let decryptedData: any
    try {
      const result = encryptionService.decrypt(ciphertext, nonce, encryptionKey)
      decryptedData = result.data
    } catch (decryptError) {
      console.error('❌ Decryption failed:', decryptError)
      return NextResponse.json(
        { error: decryptError instanceof Error ? decryptError.message : 'Decryption failed' },
        { status: 401 }
      )
    }

    console.log(`✅ Order decrypted successfully (CID: ${cid.substring(0, 8)}...)`)

    return NextResponse.json(
      {
        success: true,
        cid,
        order: decryptedData,
        decryptedAt: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Decrypt API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
