import { ethers } from 'ethers'
import VerifierABI from '@/app/ABIs/Verifier.json'

// Celo Sepolia network configuration
const CELO_SEPOLIA_CHAIN_ID = 11142220
const DEFAULT_CELO_SEPOLIA_RPC = 'https://rpc.ankr.com/celo_sepolia' // Public Infura endpoint

// Prefer env var if set, otherwise fall back to public RPC
const CELO_SEPOLIA_RPC =
  process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC?.trim() || DEFAULT_CELO_SEPOLIA_RPC

// Get provider for Celo Sepolia
export function getCeloSepoliaProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(CELO_SEPOLIA_RPC, {
    name: 'Celo Sepolia',
    chainId: CELO_SEPOLIA_CHAIN_ID,
  })
}

// Get Verifier contract instance
export function getVerifierContract(): ethers.Contract {
  const contractAddress = process.env.NEXT_PUBLIC_SELF_ENDPOINT
  
  if (!contractAddress) {
    throw new Error('NEXT_PUBLIC_SELF_ENDPOINT environment variable is not set')
  }

  if (!ethers.isAddress(contractAddress)) {
    throw new Error(`Invalid contract address: ${contractAddress}`)
  }

  const provider = getCeloSepoliaProvider()
  return new ethers.Contract(contractAddress, VerifierABI, provider)
}

// Get contract address
export function getVerifierContractAddress(): string {
  const contractAddress = process.env.NEXT_PUBLIC_SELF_ENDPOINT
  
  if (!contractAddress) {
    throw new Error('NEXT_PUBLIC_SELF_ENDPOINT environment variable is not set')
  }

  if (!ethers.isAddress(contractAddress)) {
    throw new Error(`Invalid contract address: ${contractAddress}`)
  }

  return contractAddress
}

