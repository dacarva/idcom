import { NextResponse } from 'next/server';
import { decodeXPaymentResponse } from "x402-fetch";

const MERCHANT_ADDRESS = '0x82c18fe11e336d5d0ab2e08932e3a6c64ad80d1b';

const FACILITATOR_URL = 'https://facilitator.payai.network';

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-PAYMENT, X-PAYMENT-RESPONSE,access-control-expose-headers, access-control-allow-headers, access-control-allow-methods, access-control-allow-origin, access-control-request-method, access-control-request-headers',
    'Access-Control-Expose-Headers': 'Content-Type, X-PAYMENT, X-PAYMENT-RESPONSE',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: getCorsHeaders() });
}

export async function GET(req: Request) {
  const corsHeaders = getCorsHeaders();
  // get asset address, name, amount, network from the query string of the request
  const { searchParams } = new URL(req.url);
  const asset = searchParams.get('asset');
  const name = searchParams.get('name');
  const amount = searchParams.get('amount');
  const network = searchParams.get('network');

  const paymentRequirements = {
    scheme: 'exact',
    network: network || 'base-sepolia',
    maxAmountRequired: amount?.toString() || '10000',
    resource: req.url,
    description: 'Demo x402 protected resource',
    mimeType: 'application/json',
    payTo: MERCHANT_ADDRESS,
    maxTimeoutSeconds: 120,
    outputSchema: null,
    asset: asset || '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    extra: {
      name: name || 'USDC',
      version: '2'
    }
  };
  console.log('paymentRequirements', paymentRequirements);

  const paymentHeader = req.headers.get('X-PAYMENT');

  if (!paymentHeader) { 
    return NextResponse.json(
      {
        x402Version: 1,
        error: "X-PAYMENT header is required",
        accepts: [paymentRequirements],
      },
      { status: 402, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {

    const decoded = decodeXPaymentResponse(paymentHeader);

    //BY PASS VERIFY AND SETTLE FOR DEVELOPMENT TESTING
    return NextResponse.json(
      {
        status: 'paid',
        message: 'Payment received and settled',
        orderId: `demo-${Date.now()}`,
      },
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

    const verifyResponse = await fetch(`${FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        x402Version: 1,
        paymentPayload: decoded,
        paymentRequirements,
      }),
    });
    if (!verifyResponse.ok) {
      const verifyError = await verifyResponse.json().catch(() => ({}));
      console.error('Error en x402 /verify:', verifyError);

      return NextResponse.json(
        {
          error: 'Payment verification failed',
          details: verifyError,
        },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      );
    }
    const verifyData = await verifyResponse.json();

    const settleResponse = await fetch(`${FACILITATOR_URL}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentPayload: decoded,
        paymentRequirements,
      }),
    });

    if (!settleResponse.ok) {
      const settleError = await settleResponse.json().catch(() => ({}));
      console.error('Error en x402 /settle:', settleError);

      return NextResponse.json(
        {
          error: 'Payment settlement failed',
          details: settleError,
        },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      );
    }

    const settleData = await settleResponse.json();

    return NextResponse.json(
      {
        status: 'paid',
        message: 'Pago x402 recibido y liquidado',
        orderId: `demo-${Date.now()}`,
        facilitator: {
          verify: verifyData,
          settle: settleData,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    console.error('Error procesando X-PAYMENT o llamando al facilitator:', error);

    return NextResponse.json(
      { error: 'Invalid X-PAYMENT header or facilitator error' },
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
}