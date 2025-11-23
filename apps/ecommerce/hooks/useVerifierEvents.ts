
import { useEffect, useState, useRef } from 'react'
import { checkEligibility, RefugeeDiscountEligibilityEvent } from '@/app/actions/verify-subsidy'

interface UseVerifierEventsReturn {
  eligibilityEvent: RefugeeDiscountEligibilityEvent | null
  isLoading: boolean
  error: Error | null
  startPolling: () => void
  stopPolling: () => void
}

const POLL_INTERVAL = 3000 // 3 seconds

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
      // Call the Server Action
      const eventData = await checkEligibility()

      if (eventData) {
        setEligibilityEvent(eventData)
        setError(null)
        stopPolling()
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

