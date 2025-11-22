# Filecoin Order Archive System

Permanent, immutable storage of e-commerce orders on the Filecoin/IPFS network.

## Overview

Every order placed in idcom is permanently archived on Filecoin, making it verifiable, immutable, and censorship-resistant. Each order receives a unique **CID (Content ID)** that serves as an immutable identifier.

## How It Works

```
Order Placed
    ↓
Order Data → JSON
    ↓
Upload to Lighthouse (IPFS + Filecoin)
    ↓
Get CID (Content Identifier)
    ↓
Save CID to Database
    ↓
User Receives QR with CID
    ↓
Anyone Can Verify Order Anytime
```

## Architecture

### Services

**`services/filecoin.service.ts`** - Singleton service handling all Filecoin operations
- `uploadOrder(orderData)` - Upload order to Filecoin
- `retrieveOrder(cid)` - Retrieve order by CID
- `generateVerifiableLink(cid)` - Get public link
- `generateRedundantLinks(cid)` - Multiple gateway URLs

### API Endpoints

**POST `/api/orders/archive-filecoin`**
- Upload order to Filecoin
- Returns: CID, IPFS URL, verifiable links

**GET `/api/orders/archive-filecoin?cid=QmXxxx`**
- Retrieve archived order by CID
- Returns: Full order data with metadata

### React Hooks

**`hooks/useFilecoinArchive.ts`**
```typescript
const { archiveOrder, retrieveOrder, isLoading, error, cid } = useFilecoinArchive();

// Archive order
const result = await archiveOrder({
  orderId: '12345',
  userId: 'user123',
  items: [...],
  total: 99.99,
  timestamp: new Date().toISOString()
});

// Retrieve order
const result = await retrieveOrder(cid);
```

### Pages

**`/verify-order/[cid]`** - Public verification page
- Load order by CID from Filecoin
- Display order details with verification badge
- Show archive metadata
- Provide links to raw data

## Setup

### 1. Get Lighthouse API Key

```bash
# Visit: https://lighthouse.storage/
# Sign up and generate API key
```

### 2. Configure Environment

```bash
# .env
LIGHTHOUSE_API_KEY=your_api_key_here
NEXT_PUBLIC_FILECOIN_GATEWAY=https://gateway.lighthouse.storage/ipfs
```

### 3. Install Dependencies

```bash
npm install @lighthouse-web3/sdk
```

## Usage

### In Checkout Flow

```typescript
import { useFilecoinArchive } from '@/hooks/useFilecoinArchive';

export function CheckoutComplete() {
  const { archiveOrder } = useFilecoinArchive();

  const handleOrderComplete = async (orderData) => {
    // Save to database first
    const dbOrder = await saveOrderToDatabase(orderData);

    // Then archive to Filecoin
    const result = await archiveOrder(dbOrder);

    if (result.success) {
      // Show QR with CID
      displayQRCode(result.cid);
      
      // Save CID to database
      await updateOrderWithCID(dbOrder.id, result.cid);
    }
  };
}
```

### Verification Flow

```typescript
// User visits: /verify-order/QmXxxx
// Component automatically retrieves and displays order
```

## Data Structure

### Order Stored on Filecoin

```json
{
  "orderId": "order-123",
  "userId": "user-456",
  "items": [
    {
      "id": "product-789",
      "name": "T-Shirt",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "total": 59.98,
  "timestamp": "2025-11-22T11:30:00Z",
  "_archived": {
    "timestamp": "2025-11-22T11:30:05Z",
    "service": "Filecoin/Lighthouse",
    "version": "1"
  }
}
```

## Benefits

### For Users
- **Proof of Purchase**: Permanent, verifiable receipt
- **Privacy**: Order stored on decentralized network
- **Access**: Retrieve order anytime from any gateway
- **Immutability**: Order cannot be modified or deleted

### For Business
- **Compliance**: Permanent audit trail for regulation
- **Trust**: Customers can verify orders independently
- **Marketing**: "Blockchain-verified purchases"
- **Cost**: Cheap permanent storage (~$20/month)

### For Ecosystem
- **Decentralization**: No single point of failure
- **Censorship Resistance**: Cannot be removed
- **Interoperability**: Works with IPFS ecosystem
- **Hackathon**: Wins with Filecoin + Protocol Labs

## Gateway URLs

Multiple gateways for redundancy:

```
https://gateway.lighthouse.storage/ipfs/{cid}
https://ipfs.io/ipfs/{cid}
https://nft.storage/ipfs/{cid}
ipfs://{cid}
```

If one fails, order can be retrieved from another.

## Cost Structure

### Lighthouse Storage

- **Free tier**: 50GB during development
- **Paid**: ~$0.004 per GB per month
- **For idcom**: ~$20/month for 5000 orders (each ~50KB)

### Smart Contract (Optional)

- **Deployment**: ~$5-10 on Base/Arbitrum
- **Per order**: ~$0.01-0.05 (optional, for on-chain verification)

## File Structure

```
/services
  └── filecoin.service.ts          # Main service

/app/api/orders
  └── archive-filecoin/route.ts    # API endpoints

/hooks
  └── useFilecoinArchive.ts        # React hook

/app/verify-order
  └── [cid]/page.tsx               # Verification page

/docs
  └── FILECOIN_ARCHIVE.md          # This file
```

## Error Handling

### Configuration Missing

```typescript
// If LIGHTHOUSE_API_KEY not set:
// - Returns 202 (Accepted)
// - Order saved to DB
// - Warning logged
// - Archival skipped
```

### Network Errors

```typescript
// Automatic retry with exponential backoff
// Falls back to database-only storage
// Error logged for manual review
```

## Future Enhancements

1. **Smart Contract Registry** - Order CIDs stored on-chain (Base)
2. **Batch Archival** - Archive multiple orders in one transaction
3. **Encryption** - Store private orders with access control
4. **Expiration** - Set automatic archive deletion dates
5. **Analytics** - Track retrieval patterns and verify authenticity

## Monitoring

Check Lighthouse dashboard for:
- Storage usage
- Cost per month
- Network health
- Retrieval performance

## Testing

```bash
# Test archive endpoint
curl -X POST http://localhost:3000/api/orders/archive-filecoin \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-123",
    "total": 99.99,
    "items": []
  }'

# Test retrieval
curl http://localhost:3000/api/orders/archive-filecoin?cid=QmXxxx
```

## References

- [Lighthouse Documentation](https://lighthouse.storage/)
- [Filecoin Documentation](https://docs.filecoin.io/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Protocol Labs](https://protocol.ai/)
