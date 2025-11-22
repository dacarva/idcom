'use client';

import { useMemo } from 'react';
import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth';

type TokenConfig = {
  symbol: string;
  decimals: number;
  address: `0x${string}`;
};

export const networks = {
  baseSepolia: {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://sepolia.base.org'],
      },
    },
    blockExplorers: {
      default: {
        name: 'BaseScan',
        url: 'https://sepolia.basescan.org',
      },
    },
    testnet: true,
    token: {
      symbol: 'USDC',
      decimals: 6,
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
    } satisfies TokenConfig,
  },
  polygonAmoy: {
    id: 80002,
    name: 'Polygon Amoy Testnet',
    network: 'polygon-amoy',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://rpc-amoy.polygon.technology'],
      },
    },
    blockExplorers: {
      default: {
        name: 'PolygonScan',
        url: 'https://www.oklink.com/amoy‍',
      },
    },
    testnet: true,
    token: {
      symbol: 'USDC',
      decimals: 6,
      address: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582' as `0x${string}`,
    } satisfies TokenConfig,
  },
  rootstockTestnet: {
    id: 31,
    name: 'Rootstock Testnet',
    network: 'rootstock-testnet',
    nativeCurrency: {
      name: 'Rootstock Bitcoin',
      symbol: 'tRBTC',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://public-node.testnet.rsk.co'],
      },
    },
    blockExplorers: {
      default: {
        name: 'RSK Testnet Explorer',
        url: 'https://explorer.testnet.rsk.co',
      },
    },
    testnet: true,
    token: {
      symbol: 'USDRIF',
      decimals: 18,
      address: '0x8dbF326E12a9fF37ED6ddf75adA548c2640a6482' as `0x${string}`,
    } satisfies TokenConfig,
  },
  celoSepolia: {
    id: 11142220,
    name: 'Celo Sepolia',
    network: 'celo-sepolia',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://forno.celo-sepolia.celo-testnet.org/'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Celo Sepolia Explorer',
        url: 'https://celo-sepolia.blockscout.com',
      },
    },
    testnet: true,
    token: {
      symbol: 'USDC',
      decimals: 6,
      address: '0x01C5C0122039549AD1493B8220cABEdD739BC44E' as `0x${string}`,
    } satisfies TokenConfig,
  },
};

export function Providers({ 
  children, 
  defaultChain 
}: { 
  children: React.ReactNode;
  defaultChain?: typeof networks.rootstockTestnet;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set');
  }

  const privyConfig = useMemo((): PrivyClientConfig => ({
    defaultChain: defaultChain || networks.rootstockTestnet,
    embeddedWallets: {
      ethereum: {
        createOnLogin: 'users-without-wallets',
      },
    },
    supportedChains: [
      networks.rootstockTestnet, 
      networks.polygonAmoy, 
      networks.baseSepolia, 
      networks.celoSepolia
    ],
    appearance: {
      walletList: ['metamask', 'coinbase_wallet', 'wallet_connect'],
      theme: 'light',
      accentColor: '#6366f1',
    },
  }), [defaultChain]);

  return (
    <PrivyProvider
      key={defaultChain?.id}
      appId={appId}
      config={privyConfig}
    >
      {children}
    </PrivyProvider>
  );
}

