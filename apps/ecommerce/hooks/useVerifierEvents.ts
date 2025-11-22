import { useEffect, useState, useRef } from 'react'
import { ethers } from 'ethers'
import { getVerifierContract, getVerifierContractAddress } from '@/lib/blockchain'

interface RefugeeDiscountEligibilityEvent {
  passportHash: string
  nationality: string
  isEligibleNationality: boolean
  isRefugee: boolean
  isEligibleForDiscount: boolean
  blockNumber: number
  transactionHash: string
}

interface UseVerifierEventsReturn {
  eligibilityEvent: RefugeeDiscountEligibilityEvent | null
  isLoading: boolean
  error: Error | null
  startPolling: () => void
  stopPolling: () => void
}

const POLL_INTERVAL = 3000 // 3 seconds
const BLOCKS_TO_CHECK = 10 // Check last 10 blocks

export function useVerifierEvents(): UseVerifierEventsReturn {
  const [eligibilityEvent, setEligibilityEvent] = useState<RefugeeDiscountEligibilityEvent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(false)

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    isPollingRef.current = false
    setIsLoading(false)
  }

  const checkForEvents = async () => {
    if (isPollingRef.current && eligibilityEvent) {
      // Already found an event, stop polling
      stopPolling()
      return
    }

    try {
      const contract = getVerifierContract()
      const provider = contract.runner?.provider as ethers.JsonRpcProvider
      
      if (!provider) {
        throw new Error('Provider not available')
      }

      // Get current block number
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - BLOCKS_TO_CHECK)

      // Query for RefugeeDiscountEligibility events
      const filter = contract.filters.RefugeeDiscountEligibility()
      const events = await contract.queryFilter(filter, fromBlock, currentBlock)

      if (events.length > 0) {
        // Get the most recent event
        const latestEvent = events[events.length - 1]
        
        // Type guard: check if it's an EventLog with args property
        if ('args' in latestEvent && latestEvent.args && Array.isArray(latestEvent.args) && latestEvent.args.length >= 5) {
          const eventData: RefugeeDiscountEligibilityEvent = {
            passportHash: String(latestEvent.args[0]),
            nationality: String(latestEvent.args[1]),
            isEligibleNationality: Boolean(latestEvent.args[2]),
            isRefugee: Boolean(latestEvent.args[3]),
            isEligibleForDiscount: Boolean(latestEvent.args[4]),
            blockNumber: latestEvent.blockNumber,
            transactionHash: latestEvent.transactionHash,
          }

          setEligibilityEvent(eventData)
          setError(null)
          stopPolling()
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check for events')
      setError(error)
      console.error('Error checking for events:', error)
    }
  }

  const startPolling = () => {
    if (isPollingRef.current) {
      return // Already polling
    }

    setIsLoading(true)
    setError(null)
    setEligibilityEvent(null)
    isPollingRef.current = true

    // Check immediately
    checkForEvents()

    // Then poll at intervals
    pollingIntervalRef.current = setInterval(() => {
      checkForEvents()
    }, POLL_INTERVAL)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  return {
    eligibilityEvent,
    isLoading,
    error,
    startPolling,
    stopPolling,
  }
}

