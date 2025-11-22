'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useWallets, useX402Fetch } from '@privy-io/react-auth';
import { NetworkSelector } from './components/NetworkSelector';
import { networks } from './providers';
import { parseUnits } from 'ethers';

function formatBalance(rawBalance: bigint, decimals: number): string {
  if (decimals <= 0) return rawBalance.toString();

  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = rawBalance / divisor;
  const fractionalPart = rawBalance % divisor;

  return `${wholePart.toString()}.${fractionalPart
    .toString()
    .padStart(decimals, '0')
    .slice(0, 4)}`;
}

async function fetchErc20Balance(
  rpcUrl: string,
  tokenAddress: string,
  walletAddress: string
): Promise<bigint> {
  // balanceOf(address) selector: 0x70a08231
  const methodId = '0x70a08231';
  const addrWithout0x = walletAddress.toLowerCase().replace(/^0x/, '');
  const paddedAddress = addrWithout0x.padStart(64, '0');
  const data = methodId + paddedAddress;

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: tokenAddress,
          data,
        },
        'latest',
      ],
      id: 1,
    }),
  });

  const json = await response.json();
  if (!json.result) {
    throw new Error('No result in eth_call');
  }

  return BigInt(json.result);
}

export default function Home() {
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const { wrapFetchWithPayment } = useX402Fetch();
  
  const [selectedNetwork, setSelectedNetwork] = useState<keyof typeof networks>('rootstockTestnet');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [switchingNetwork, setSwitchingNetwork] = useState(false);

  const handleNetworkChange = async (networkKey: keyof typeof networks) => {
    if (!authenticated || !wallets[0]) {
      setSelectedNetwork(networkKey);
      return;
    }
    
    setSwitchingNetwork(true);
    try {
      const network = networks[networkKey];
      const wallet = wallets[0];
      
      if (wallet.switchChain) {
        await wallet.switchChain(network.id);
      } else {
        console.log('Switching to network:', network.name);
        alert(`Please switch to ${network.name} from your wallet.`);
      }
      
      setSelectedNetwork(networkKey);
      setBalance(null);
      setTokenBalance(null);
    } catch (error) {
      console.error('Error switching network:', error);
      setSelectedNetwork(networkKey);
      setBalance(null);
      setTokenBalance(null);
    } finally {
      setSwitchingNetwork(false);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!authenticated || !wallets[0]?.address) return;

      try {
        const network = networks[selectedNetwork];
        const response = await fetch(network.rpcUrls.default.http[0], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [wallets[0].address, 'latest'],
            id: 1,
          }),
        });

        const data = await response.json();
        if (data.result) {
          const balanceInWei = BigInt(data.result);
          const decimals = network.nativeCurrency.decimals;
          const balanceFormatted = formatBalance(balanceInWei, decimals);
          setBalance(balanceFormatted);
        }

        const tokenConfig = (network as (typeof networks)[keyof typeof networks] & {
          token?: { symbol: string; decimals: number; address: string };
        }).token;

        if (tokenConfig && tokenConfig.address !== '0x0000000000000000000000000000000000000000') {
          const tokenRawBalance = await fetchErc20Balance(
            network.rpcUrls.default.http[0],
            tokenConfig.address,
            wallets[0].address
          );

          const formattedTokenBalance = formatBalance(
            tokenRawBalance,
            tokenConfig.decimals
          );

          setTokenBalance(formattedTokenBalance);
        } else {
          setTokenBalance(null);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('Error');
        setTokenBalance('Error');
      }
    };

    fetchBalance();
  }, [authenticated, wallets, selectedNetwork]);

  const handlePayment = async () => {
    if (!paymentUrl.trim()) {
      setResult({ error: 'Por favor ingresa una URL de pago' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const walletAddress = wallets[0]?.address;
      
      if (!walletAddress) {
        setResult({ error: 'No wallet available' });
        setLoading(false);
        return;
      }

      const fetchWithPayment = wrapFetchWithPayment({
        walletAddress,
        fetch: globalThis.fetch,
      });

      const url = new URL(paymentUrl);

      const amount = url.searchParams.get('amount');
      if (!amount) {
        setResult({ error: 'No amount found in the URL' });
        setLoading(false);
        return;
      }
      const amountInWei = parseUnits(amount, networks[selectedNetwork].token?.decimals || 6);

      const baseUrl = url.origin + url.pathname;

      // add network, asset and name symbol to the url
      const response = await fetchWithPayment(`${baseUrl}?amount=${amountInWei}&network=${networks[selectedNetwork].network}&asset=${networks[selectedNetwork].token?.address}&name=${networks[selectedNetwork].token?.symbol}&amount=${amount}`);
      const data = await response.json();
      
      setResult({
        status: response.status,
        data,
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                x402 Wallet
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Connect your wallet to start
              </p>
            </div>

            <NetworkSelector
              selectedNetwork={selectedNetwork}
              onNetworkChange={handleNetworkChange}
              disabled={switchingNetwork}
            />
            {switchingNetwork && (
              <p className="text-xs text-gray-500 mt-2">Switching network...</p>
            )}

            <button
              onClick={login}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-base shadow-md hover:shadow-lg"
            >
              Login / Connect wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  const walletAddress = wallets[0]?.address;
  const currentNetwork = networks[selectedNetwork];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              x402 Wallet
            </h1>
            <button
              onClick={async () => {
                try {
                  await logout();
                } catch (error) {
                  console.error('Error during logout:', error);
                }
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Network Selector */}
          <div className="mb-6">
            <NetworkSelector
              selectedNetwork={selectedNetwork}
              onNetworkChange={handleNetworkChange}
              disabled={switchingNetwork}
            />
            {switchingNetwork && (
              <p className="text-xs text-gray-500 mt-2">Switching network...</p>
            )}
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6">
            <p className="text-sm opacity-90 mb-1">Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {balance !== null ? balance : '...'}
              </span>
              <span className="text-lg opacity-90">
                {currentNetwork.nativeCurrency.symbol}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
              {tokenBalance !== null ? tokenBalance : "..."}{" "}
              </span>
              <span className="text-lg opacity-90">
                {currentNetwork.token?.symbol || "..."}
              </span>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-600 mb-2">Wallet address</p>
            <p className="font-mono text-sm text-gray-900 break-all">
              {walletAddress || 'No wallet found'}
            </p>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Make x402 payment
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product URL
              </label>
              <input
                type="url"
                value={paymentUrl}
                onChange={(e) => setPaymentUrl(e.target.value)}
                placeholder="https://example.com/api/checkout"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !paymentUrl.trim()}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? 'Procesando...' : 'Pagar'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-900 text-sm">Resultado:</h3>
              <pre className="text-xs overflow-auto text-gray-900 whitespace-pre-wrap break-words">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
