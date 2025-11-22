# IDCom - Monorepo

IDCom is a monorepo containing an ecommerce platform designed to offer discounts and fair prices to refugees, along with a wallet application and smart contracts.

## Repository Structure

This is a monorepo managed with npm workspaces, containing three main workspaces:

1. **apps/ecommerce** - Next.js ecommerce application with refugee subsidy verification
2. **apps/wallet** - Wallet application (to be added)
3. **packages/contracts** - Foundry-based smart contracts (to be added)

```
idcom/
├── apps/
│   ├── ecommerce/          # Ecommerce application
│   └── wallet/             # Wallet application (empty, ready for files)
├── packages/
│   └── contracts/         # Smart contracts (empty, ready for Foundry project)
├── .devcontainer/         # Development container configuration
├── package.json           # Root workspace configuration
└── README.md             # This file
```

## Prerequisites

- Node.js 22 or higher
- npm 10 or higher
- Foundry (for smart contracts development)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd idcom
```

2. Install all workspace dependencies:
```bash
npm install
```

This will install dependencies for all workspaces (ecommerce, wallet, contracts).

### Development

#### Run Ecommerce App
```bash
npm run dev:ecommerce
# or
npm run dev  # defaults to ecommerce
```

The ecommerce app will be available at [http://localhost:3000](http://localhost:3000)

#### Run Wallet App
```bash
npm run dev:wallet
```

The wallet app will be available at [http://localhost:3001](http://localhost:3001)

#### Build Contracts
```bash
npm run build:contracts
```

#### Test Contracts
```bash
npm run test:contracts
```

### Workspace-Specific Commands

You can also run commands in specific workspaces:

```bash
# Run dev in ecommerce workspace
npm run dev --workspace=@idcom/ecommerce

# Run build in wallet workspace
npm run build --workspace=@idcom/wallet

# Run lint in ecommerce workspace
npm run lint --workspace=@idcom/ecommerce
```

## Workspaces

### apps/ecommerce

Next.js ecommerce application that integrates with blockchain-based identity verification to provide subsidy discounts to eligible refugees.

**Features:**
- Refugee discount verification via QR code scanning (Self Protocol)
- Blockchain integration for eligibility verification (Celo Sepolia)
- 30% subsidy discount for verified refugees
- Full shopping cart and checkout functionality

**Technology Stack:**
- Next.js 16 with React 19
- Tailwind CSS 4
- Zustand for state management
- Ethers.js v6 for blockchain integration
- Self Protocol for identity verification

**Environment Variables:**
Create `apps/ecommerce/.env.local`:
```env
NEXT_PUBLIC_SELF_ENDPOINT=<Verifier contract address on Celo Sepolia>
NEXT_PUBLIC_SELF_ENDPOINT_TYPE=staging_celo
NEXT_PUBLIC_SELF_APP_NAME=idcom
NEXT_PUBLIC_SELF_SCOPE_SEED=idcom-subsidy
NEXT_PUBLIC_CELO_SEPOLIA_RPC=<Optional: Custom Celo Sepolia RPC endpoint>
```

### apps/wallet

Wallet application (to be added from another repository).

**Port:** 3001

### packages/contracts

Foundry-based smart contracts for the IDCom platform (to be added from another repository).

**Technology:**
- Foundry for development and testing
- Solidity smart contracts
- Celo Sepolia network deployment

## Adding Files from Another Repository

When adding files from another repository to `apps/wallet` or `packages/contracts`, consider the following:

### Checklist Before Pasting
- [ ] Remove `node_modules/` folders
- [ ] Remove lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- [ ] Remove build artifacts (`.next/`, `out/`, `dist/`, `build/`, `cache/`)
- [ ] Update `package.json` name to workspace format (`@idcom/wallet` or `@idcom/contracts`)
- [ ] Review and update all import paths
- [ ] Update config file paths (`tsconfig.json`, `next.config.ts`, `foundry.toml`)
- [ ] Check for hardcoded port numbers (wallet should use 3001)
- [ ] Review environment variable paths
- [ ] After pasting, run `npm install` at root to install all workspaces

### Path Updates Required
- **Import paths**: Update relative imports to account for monorepo structure
- **Package references**: Update `package.json` name field to match workspace naming
- **Config files**: Update paths in `tsconfig.json`, `next.config.ts`, `foundry.toml`
- **Environment variables**: Create workspace-specific env files (e.g., `apps/wallet/.env.local`)

### Workspace Dependencies
If wallet or contracts need to reference ecommerce code, use workspace protocol:
```json
{
  "dependencies": {
    "@idcom/ecommerce": "workspace:*"
  }
}
```

## Development Container

This repository includes a VS Code Dev Container configuration with:
- Node.js 22
- Foundry installed
- VS Code extensions for TypeScript, ESLint, Tailwind CSS, and Solidity
- Port forwarding for ecommerce (3000) and wallet (3001)

To use the dev container:
1. Open the repository in VS Code
2. When prompted, click "Reopen in Container"
3. The container will build and install all dependencies

## Building for Production

```bash
# Build ecommerce app
npm run build:ecommerce

# Build wallet app
npm run build:wallet

# Build contracts
npm run build:contracts
```

## Scripts Reference

### Root Level Scripts
- `npm run dev` - Run ecommerce app in development mode
- `npm run dev:ecommerce` - Run ecommerce app
- `npm run dev:wallet` - Run wallet app
- `npm run build` - Build ecommerce app
- `npm run build:ecommerce` - Build ecommerce app
- `npm run build:wallet` - Build wallet app
- `npm run build:contracts` - Build smart contracts
- `npm run lint` - Lint ecommerce app
- `npm run lint:ecommerce` - Lint ecommerce app
- `npm run lint:wallet` - Lint wallet app
- `npm run test:contracts` - Test smart contracts

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [npm Workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces)
- [Self Protocol](https://self.xyz)
- [Celo Network](https://celo.org)

## Contributing

Contributions are welcome! Please ensure your changes work within the monorepo structure and update relevant workspace configurations as needed.

## License

This project is private and proprietary.
