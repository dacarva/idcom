import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/user-store'

interface UseQRVerificationOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useQRVerification(options?: UseQRVerificationOptions) {
  const router = useRouter()
  const verifySubsidy = useUserStore((state) => state.verifySubsidy)

  /**
   * Call this function when the QR code is scanned
   * @param qrData - The scanned QR code data/string
   */
  const handleQRScanned = useCallback(
    async (qrData: string) => {
      try {
        // Send QR data to backend for validation
        const response = await fetch('/api/verify-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ qrData }),
        })

        const result = await response.json()

        if (result.isValid) {
          // ✅ Update the global store - this activates subsidy for the user
          verifySubsidy()

          // Callback if provided
          if (options?.onSuccess) {
            options.onSuccess()
          }

          // Redirect to products
          router.push('/products')
        } else {
          const error = result.message || 'Invalid QR code'
          if (options?.onError) {
            options.onError(error)
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'QR verification failed'
        if (options?.onError) {
          options.onError(errorMessage)
        }
      }
    },
    [verifySubsidy, router, options],
  )

  return { handleQRScanned }
}
