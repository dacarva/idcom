# Filecoin Payment Service Architecture

## Overview

The Filecoin integration has been refactored to separate payment/deposit setup from the upload flow. This creates a cleaner, more ordered architecture where:

1. **Payment Service** (`FilecoinPaymentService`) - Handles deposits separately, runs once at startup
2. **Synapse Service** (`FilecoinSynapseService`) - Simple, fast upload-only service that assumes payments are ready
3. **API Endpoints** - Minimal, focused endpoints for initialization and operations

## Architecture Diagram

```
┌─────────────────────────────────────┐
│     Application Startup              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ GET /api/filecoin/payment-init      │
│ (Initialize payment service once)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  FilecoinPaymentService             │
│  ├─ Initialize Synapse SDK          │
│  ├─ Make deposit transaction         │
│  ├─ Cache Synapse instance          │
│  └─ Ready for uploads               │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    ┌─────────┐   ┌──────────────────────┐
    │ Upload  │   │ GET /api/filecoin/   │
    │ Orders  │   │ payment-status       │
    │         │   │ (Check if ready)     │
    └─────────┘   └──────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ FilecoinSynapseService.upload()      │
│ ├─ Get cached Synapse from payment   │
│ ├─ Encrypt order (optional)          │
│ ├─ Upload to Filecoin (fast)         │
│ └─ Return CID immediately            │
└──────────────────────────────────────┘
```

## Service Architecture

### FilecoinPaymentService

**File**: `services/filecoin-payment.service.ts`

**Responsibility**: Handle Filecoin payment setup independently

**Key Methods**:
- `initialize()` - Create Synapse SDK instance
- `makeDeposit(amountInTFIL)` - Make a one-time deposit for storage
- `getSynapse()` - Return cached Synapse instance for uploads
- `getBalance()` - Check current payment balance
- `getWalletAddress()` - Get wallet address
- `setupPaymentService()` - Complete setup (init + deposit)

**Characteristics**:
- Runs once at application startup
- Cached Synapse instance available to other services
- Fire-and-forget deposit (returns tx hash immediately, confirms asynchronously)
- Exported as singleton

### FilecoinSynapseService

**File**: `services/filecoin-synapse.service.ts`

**Responsibility**: Simple, fast uploads to Filecoin

**Key Methods**:
- `uploadOrderToFilecoin(orderData, encryptedData)` - Upload order (now fast!)
- `retrieveOrderFromFilecoin(cid)` - Retrieve order by CID
- `getWalletBalance()` - Delegates to payment service
- `getWalletAddress()` - Delegates to payment service

**Changes**:
- Removed inline deposit logic
- Now uses Synapse instance from payment service
- Assumes payments are already configured
- Much faster uploads (no deposit/approval overhead)

## API Endpoints

### Payment Initialization

**Endpoint**: `GET /api/filecoin/payment-init`

**Purpose**: Initialize payment service at startup

**Smart Logic**: Only makes a deposit if balance falls below the minimum threshold (default: 0.1 tFIL)

**Usage**:
```bash
# Call once at startup (only deposits if balance is low)
curl http://localhost:3000/api/filecoin/payment-init

# Or with custom minimum balance threshold
curl http://localhost:3000/api/filecoin/payment-init?minBalance=0.2
```

**Response (Balance Sufficient)**:
```json
{
  "success": true,
  "message": "Filecoin payment service initialized",
  "wallet": "0x3b19a30d840167c98ECA2Aa8C6f4F110e8cD34F1",
  "balance": "199.99 tFIL",
  "depositReady": false,
  "readyForUploads": true
}
```

**Response (Deposit Made)**:
```json
{
  "success": true,
  "message": "Filecoin payment service initialized",
  "wallet": "0x3b19a30d840167c98ECA2Aa8C6f4F110e8cD34F1",
  "balance": "0.05 tFIL",
  "depositReady": true,
  "readyForUploads": true
}
```

### Payment Status Check

**Endpoint**: `HEAD /api/filecoin/payment-init`

**Purpose**: Check if payment service is ready

**Usage**:
```bash
curl -I http://localhost:3000/api/filecoin/payment-init
```

**Response**: 200 OK if ready, 503 if not

### Order Upload

**Endpoint**: `POST /api/orders/archive-filecoin`

**Purpose**: Upload order to Filecoin

**Usage**:
```bash
curl -X POST http://localhost:3000/api/orders/archive-filecoin \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-123",
    "items": [...],
    "total": 99.99
  }'
```

**Response**:
```json
{
  "success": true,
  "cid": "bafyXXXXX...",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "transactionHash": "0x..."
}
```

## Deployment Instructions

### 1. Environment Variables

```bash
FILECOIN_PRIVATE_KEY=<wallet-private-key>
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
FILECOIN_NETWORK=calibration
```

### 2. Initialize Payment Service

When your application starts:

```typescript
// In your startup code
const response = await fetch('/api/filecoin/payment-init');
const result = await response.json();

if (result.success) {
  console.log('✅ Filecoin payment service ready');
} else {
  console.error('❌ Filecoin payment service failed');
}
```

Or simply call the endpoint via curl/webhook:

```bash
curl http://localhost:3000/api/filecoin/payment-init
```

### 3. Test Upload

```bash
# Check status
curl http://localhost:3000/api/test-filecoin-upload

# Or use the payment status endpoint
curl -I http://localhost:3000/api/filecoin/payment-init
```

## Performance Benefits

### Before (Monolithic)
- First upload: ~2m50s (includes deposit setup)
- Subsequent uploads: ~30-60s (cached payment)
- Each upload endpoint handles payment setup

### After (Separated)
- Payment setup: ~30-60s (done once at startup)
- All uploads: ~5-10s (pure upload, no payment overhead)
- Clean separation of concerns

## Key Design Decisions

1. **Singleton Pattern**: Payment service is a singleton to ensure one Synapse instance
2. **Fire-and-Forget**: Deposits confirm asynchronously without blocking uploads
3. **Cached Synapse**: Synapse instance cached after initialization
4. **Delegation**: Upload service delegates wallet operations to payment service
5. **API for Initialization**: Payment setup triggered via API endpoint for flexibility

## Troubleshooting

### Uploads failing with "no payment"
1. Check payment service was initialized: `curl http://localhost:3000/api/filecoin/payment-init`
2. Verify wallet balance: `curl http://localhost:3000/api/test-filecoin-upload`
3. Check deposit tx confirmed on Filecoin Calibration Testnet

### Slow uploads
- Ensure payment service was called at startup
- If payment service not ready, first upload will be slow (includes deposit)
- Subsequent uploads should be fast (~5-10s)

### Insufficient balance
- Need at least 0.2 tFIL for storage + gas
- Request more tFIL from Filecoin Calibration Testnet faucet
- Current wallet: `0x3b19a30d840167c98ECA2Aa8C6f4F110e8cD34F1`

## Future Improvements

1. **Health Check Endpoint** - Periodic verification that payment service is still responsive
2. **Auto-Redeposit** - Automatically refill deposit when balance runs low
3. **Multiple Wallets** - Support multiple payment wallets for redundancy
4. **Metrics** - Track upload times and payment costs
5. **Monitoring** - Alert if payment service fails or deposits are not confirmed
