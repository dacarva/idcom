import { NextRequest, NextResponse } from 'next/server'
import { filecoinService } from '@/services/filecoin.service'
import { encryptionService } from '@/services/encryption.service'
import { walletService } from '@/services/wallet.service'
import { orderService } from '@/services/order.service'

interface Order {
  encryption_salt: string | null;
}

interface DecryptRequest {
  cid: string
  walletAddress: string
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
    const { cid, walletAddress } = body

    if (!cid || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing cid or walletAddress' },
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

    // Load encryption salt from Supabase
    let encryptionSalt: string | null = null

    try {
      if (orderService.isConfigured()) {
        const order = await orderService.getOrderByCid(cid)
        if (order) {
          encryptionSalt = order.encryption_salt || null
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not load order salt from DB')
    }

    if (!encryptionSalt) {
      return NextResponse.json(
        { error: 'Missing encryption salt for decryption' },
        { status: 400 }
      )
    }

    // User must provide a wallet address that was used to encrypt
    // The client will sign a message with this wallet to prove ownership
    // For now, we create a temporary signature from the provided address
    console.log(`🔑 Using wallet address for decryption: ${walletAddress.substring(0, 8)}...`)

    // Create a decryption signature (in production, this would come from the client)
    // For now, we use a deterministic message
    const decryptionMessage = `Decrypt order ${cid}`
    const tempSignature = walletService.createDeterministicSignature(walletAddress, decryptionMessage)

    // Derive encryption key from wallet address + deterministic signature
    const encryptionKey = walletService.deriveEncryptionKey(
      walletAddress,
      tempSignature,
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
