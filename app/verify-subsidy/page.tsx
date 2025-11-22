'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/stores/user-store'
import { useSelfQR } from '@/hooks/useSelfQR'
import { useToastNotification, ToastNotification } from '@/components/ui/toast'
import { CopyableLink } from '@/components/ui/copyable-link'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { MdEmojiEmotions } from 'react-icons/md'

const SelfQRcodeWrapper = dynamic(
  () => import('@selfxyz/qrcode').then((m) => m.SelfQRcodeWrapper),
  { ssr: false }
)

export default function VerifySubsidyPage() {
  const router = useRouter()
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)
  const user = useUserStore((state) => state.user)
  const verifySubsidy = useUserStore((state) => state.verifySubsidy)
  const skipSubsidyVerification = useUserStore((state) => state.skipSubsidyVerification)
  const isVerified = user?.hasSubsidy ?? false
  const { toast, success: showSuccess, error: showError } = useToastNotification()

  const { selfApp, isLoading: qrLoading, universalLink, error: qrError } = useSelfQR({
    userId: user?.id || '',
    userDefinedData: `Subsidy verification for ${user?.email}`,
    onSuccess: () => {
      verifySubsidy()
    },
  })

  useEffect(() => {
    console.log('QR State:', { selfApp, qrLoading, universalLink, qrError, userId: user?.id })
  }, [selfApp, qrLoading, universalLink, qrError, user?.id])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  const handleVerifyQR = () => {
    verifySubsidy()
    router.push('/products')
  }

  const handleSkip = () => {
    skipSubsidyVerification()
    router.push('/products')
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center px-4">
      <ToastNotification toast={toast} />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-[#0d1b0d] text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
            {isVerified ? 'Subsidy Verified!' : 'Verify Your Subsidy'}
          </h1>
          <p className="text-[#4c9a4c] text-base">
            {isVerified ? 'You have an active 30% discount' : 'Scan the QR code to activate your 30% discount'}
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-xl border border-[#e7f3e7] p-8 mb-8 flex flex-col items-center">
        {isVerified ? (
            <div className="w-full max-w-xs aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-dashed border-primary flex items-center justify-center mb-6">
              <MdEmojiEmotions className="w-32 h-32 text-primary" />
            </div>
          ) : qrLoading ? (
            <div className="w-[256px] h-[256px] bg-gray-100 rounded-lg border-2 border-dashed border-[#cfe7cf] flex items-center justify-center mb-6 animate-pulse">
              <p className="text-gray-500 text-sm">Loading QR Code...</p>
            </div>
          ) : selfApp ? (
            <div className="mb-6 flex flex-col items-center gap-4 w-full max-w-xs">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => {
                  verifySubsidy()
                }}
                onError={() => {
                  console.error('Error verifying with Self Protocol')
                }}
              />
              {universalLink && (
                <CopyableLink
                  link={universalLink}
                  label="Verification link"
                  onCopySuccess={() => showSuccess('Verification link copied!')}
                  onCopyError={() => showError('Failed to copy link')}
                />
              )}
            </div>
          ) : (
            <div className="w-[256px] h-[256px] bg-red-100 rounded-lg border-2 border-dashed border-red-300 flex items-center justify-center mb-6">
              <p className="text-red-600 text-sm">Failed to load QR code</p>
            </div>
          )}

          <p className="text-sm text-[#0d1b0d] text-center mb-4">
            {isVerified ? 'Enjoy your exclusive discount on eligible products!' : 'Point your camera at the QR code to verify your subsidy eligibility'}
          </p>

          {!isVerified && (
            <div className="w-full max-w-xs flex items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 text-[#0d1b0d] text-sm font-bold leading-normal tracking-[0.015em] mx-auto">
              <div className="flex items-center gap-2">
                <AiOutlineLoading3Quarters className="w-5 h-5 text-primary animate-spin" />
                <span>Waiting for QR Scan</span>
              </div>
            </div>
          )}
        </div>

        {!isVerified && (
          <button
            onClick={handleSkip}
            className="w-full flex items-center justify-center overflow-hidden rounded-lg h-14 px-4 border-2 border-[#cfe7cf] text-[#4c9a4c] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#cfe7cf]/10 transition-colors mt-8"
          >
            Skip for Now
          </button>
        )}

        {isVerified && (
          <button
            onClick={() => router.push('/products')}
            className="w-full flex items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-primary text-[#0d1b0d] text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
          >
            Continue to Products
          </button>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-[#0d1b0d]">
            <span className="font-bold">💡 Tip:</span> Verifying your subsidy will give you an exclusive 30% discount on all eligible products.
          </p>
        </div>
      </div>
    </div>
  )
}
