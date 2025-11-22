import { useEffect, useMemo, useRef, useState } from 'react'
import { SelfAppBuilder, type SelfApp, getUniversalLink } from '@selfxyz/qrcode'
import { ethers } from 'ethers'

interface UseSelfQRProps {
  userId: string
  scope?: string
  appName?: string
  userDefinedData?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useSelfQR({
  userId,
  scope,
  appName,
  userDefinedData,
  onSuccess,
  onError,
}: UseSelfQRProps) {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const [universalLink, setUniversalLink] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Resolve a stable, valid userId for Self (hex address). If invalid, use ZeroAddress.
  const resolvedUserId = useMemo(() => (
    userId && ethers.isAddress(userId) ? userId : ethers.ZeroAddress
  ), [userId])

  // Build a stable init key so the effect only runs when meaningful inputs change
  const endpointType = (process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE || 'staging_celo') as 'staging_celo' | 'celo' | 'https' | 'staging_https'
  const initKey = useMemo(() => JSON.stringify({
    appName: appName || process.env.NEXT_PUBLIC_SELF_APP_NAME || 'idcom',
    scope: scope || process.env.NEXT_PUBLIC_SELF_SCOPE_SEED || 'idcom-subsidy',
    endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || '',
    endpointType,
    userId: resolvedUserId,
    userDefinedData: userDefinedData || '',
    minimumAge: 18,
  }), [appName, scope, resolvedUserId, userDefinedData, endpointType])

  const lastInitKey = useRef<string | null>(null)

  useEffect(() => {
    if (lastInitKey.current === initKey && selfApp) return
    lastInitKey.current = initKey
    setIsLoading(true)

    try {
      console.log('Initializing Self QR with config:', JSON.parse(initKey))
      const app = new SelfAppBuilder({
        version: 2,
        appName: appName || process.env.NEXT_PUBLIC_SELF_APP_NAME || 'idcom',
        scope: scope || process.env.NEXT_PUBLIC_SELF_SCOPE_SEED || 'idcom-subsidy',
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || '',
        logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
        userId: resolvedUserId,
        endpointType,
        userIdType: 'hex',
        userDefinedData: userDefinedData || '',
        disclosures: {
          // What you want to verify from users identity:
          minimumAge: 18,
          // ofac: true,
          // Note: Nationality checking is done in the smart contract's customVerificationHook
          // No excludedCountries needed - contract verifies Colombian or Palestinian nationality

          // What you want users to reveal:
          // name: false,
          // issuing_state: true,
          nationality: true, // Required: Contract verifies nationality is COL or PSE
          // date_of_birth: true,
          // passport_number: false,
          // gender: true,
          // expiry_date: false,
        },
      }).build()

      setSelfApp(app)
      setUniversalLink(getUniversalLink(app))
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize Self app')
      setError(error)
      onError?.(error)
      console.error('Failed to initialize Self app:', error)
    } finally {
      setIsLoading(false)
    }
  }, [initKey, endpointType, appName, scope, userDefinedData, onError])

  const copyToClipboard = async () => {
    if (!universalLink) return false

    try {
      await navigator.clipboard.writeText(universalLink)
      return true
    } catch (err) {
      console.error('Failed to copy link:', err)
      return false
    }
  }

  const openSelfApp = () => {
    if (!universalLink) return
    window.open(universalLink, '_blank')
  }

  return {
    selfApp,
    universalLink,
    isLoading,
    error,
    copyToClipboard,
    openSelfApp,
  }
}
