import { NextRequest, NextResponse } from 'next/server'

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

    // TODO: Integrate with payment provider (Stripe, PayPal, etc.)
    // Generate payment link pointing to external wallet/payment backend
    const walletBackendUrl = process.env.NEXT_PUBLIC_WALLET_URL || 'http://localhost:3001'
    // WE ARE USING A FIXED AMOUNT FOR NOW, BECAUSE FOR TESTING THAT IS THE MAX AMOUNT ALLOWED
    const externalPaymentLink = `${walletBackendUrl}/api/payment?amount=0.1`
    
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
