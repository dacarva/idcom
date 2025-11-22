# IDCom - Ecommerce Platform for Refugees

IDCom is an ecommerce platform designed to offer discounts and fair prices to refugees. The platform provides an exclusive 30% discount on eligible products for verified refugees, helping them access essential goods at affordable prices.

## Overview

This is a [Next.js](https://nextjs.org) ecommerce application that integrates with blockchain-based identity verification to provide subsidy discounts to eligible refugees. The platform uses Self Protocol for privacy-preserving identity verification and Celo Sepolia blockchain for transparent eligibility verification.

## Features

- **Refugee Discount Verification**: QR code-based identity verification using Self Protocol
- **Blockchain Integration**: Real-time eligibility verification via Celo Sepolia smart contracts
- **30% Subsidy Discount**: Exclusive discount for verified refugees on eligible products
- **Privacy-Preserving**: Uses zero-knowledge proofs for identity verification
- **Transparent Verification**: Blockchain-based event listening for subsidy eligibility
- **Modern Ecommerce**: Full shopping cart, checkout, and order management

## Technology Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Blockchain**: Ethers.js v6 for Celo Sepolia integration
- **Identity Verification**: Self Protocol (@selfxyz/qrcode)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd idcom
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SELF_ENDPOINT=<Verifier contract address on Celo Sepolia>
NEXT_PUBLIC_SELF_ENDPOINT_TYPE=staging_celo
NEXT_PUBLIC_SELF_APP_NAME=idcom
NEXT_PUBLIC_SELF_SCOPE_SEED=idcom-subsidy
NEXT_PUBLIC_CELO_SEPOLIA_RPC=<Optional: Custom Celo Sepolia RPC endpoint>
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Subsidy Verification Process

1. **User Registration/Login**: Users create an account or log in to the platform
2. **QR Code Scan**: Users scan a QR code using the Self Protocol mobile app to verify their identity
3. **Blockchain Verification**: The platform polls the Celo Sepolia blockchain for `RefugeeDiscountEligibility` events
4. **Eligibility Check**: The smart contract verifies:
   - Nationality eligibility (Colombian or Palestinian)
   - Refugee status
   - Overall discount eligibility
5. **Discount Application**: If eligible, users receive a 30% discount on all eligible products

### Smart Contract Integration

The platform integrates with a Verifier smart contract deployed on Celo Sepolia that:
- Emits `RefugeeDiscountEligibility` events when verification completes
- Checks nationality and refugee status
- Determines discount eligibility based on verification results

## Project Structure

```
idcom/
├── app/
│   ├── ABIs/
│   │   └── Verifier.json          # Smart contract ABI
│   ├── verify-subsidy/
│   │   └── page.tsx               # Subsidy verification page
│   ├── products/
│   │   └── page.tsx               # Product listing page
│   ├── cart/
│   │   └── page.tsx               # Shopping cart
│   └── checkout/
│       └── page.tsx                # Checkout page
├── components/
│   ├── auth/                      # Authentication components
│   ├── checkout/                  # Checkout components
│   └── products/                  # Product components
├── hooks/
│   ├── useSelfQR.ts               # Self Protocol QR hook
│   └── useVerifierEvents.ts       # Blockchain event polling hook
├── lib/
│   └── blockchain.ts              # Blockchain utilities
└── stores/
    ├── user-store.ts              # User state management
    └── cart-store.ts              # Cart state management
```

## Key Components

### Subsidy Verification (`app/verify-subsidy/page.tsx`)
- QR code scanning interface
- Blockchain event polling
- Eligibility status display
- Automatic redirect after verification

### Blockchain Integration (`lib/blockchain.ts`)
- Celo Sepolia provider configuration
- Verifier contract instance creation
- Event filtering and parsing

### Event Polling (`hooks/useVerifierEvents.ts`)
- Polls for `RefugeeDiscountEligibility` events
- Extracts `isEligibleForDiscount` status
- Handles loading and error states

## Building for Production

```bash
npm run build
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Self Protocol](https://self.xyz) - Privacy-preserving identity verification
- [Celo Network](https://celo.org) - Mobile-first blockchain platform
- [Ethers.js Documentation](https://docs.ethers.org) - Ethereum library documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For support, please contact the development team or open an issue in the repository.
