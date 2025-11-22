'use client';

import { networks } from '../providers';

interface NetworkSelectorProps {
  selectedNetwork: keyof typeof networks;
  onNetworkChange: (network: keyof typeof networks) => void;
  disabled?: boolean;
}

export function NetworkSelector({ 
  selectedNetwork, 
  onNetworkChange,
  disabled = false 
}: NetworkSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Blockchain Network
      </label>
      <select
        value={selectedNetwork}
        onChange={(e) => onNetworkChange(e.target.value as keyof typeof networks)}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
      >
        <option value="baseSepolia">{networks.baseSepolia.name}</option>
        <option value="polygonAmoy">{networks.polygonAmoy.name}</option>
        <option value="rootstockTestnet">{networks.rootstockTestnet.name}</option>
        <option value="celoSepolia">{networks.celoSepolia.name}</option>
      </select>
    </div>
  );
}

