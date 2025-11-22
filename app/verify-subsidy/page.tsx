'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/stores/user-store'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { MdEmojiEmotions } from 'react-icons/md'

export default function VerifySubsidyPage() {
  const router = useRouter()
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)
  const user = useUserStore((state) => state.user)
  const verifySubsidy = useUserStore((state) => state.verifySubsidy)
  const skipSubsidyVerification = useUserStore((state) => state.skipSubsidyVerification)
  const isVerified = user?.hasSubsidy ?? false

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
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
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
          ) : (
            <div className="w-full max-w-xs aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg border-2 border-dashed border-[#cfe7cf] flex items-center justify-center mb-6 relative overflow-hidden">
              {/* Visual QR Code Representation */}
              <svg
                className="w-full h-full p-8 text-[#4c9a4c]"
                viewBox="0 0 200 200"
                fill="currentColor"
              >
                {/* QR Pattern */}
                <rect x="20" y="20" width="20" height="20" />
                <rect x="40" y="20" width="20" height="20" />
                <rect x="60" y="20" width="20" height="20" />
                <rect x="80" y="20" width="20" height="20" />
                <rect x="100" y="20" width="20" height="20" />
                <rect x="120" y="20" width="20" height="20" />
                <rect x="140" y="20" width="20" height="20" />
                <rect x="160" y="20" width="20" height="20" />

                <rect x="20" y="40" width="20" height="20" />
                <rect x="160" y="40" width="20" height="20" />
                <rect x="50" y="50" width="20" height="20" />
                <rect x="80" y="60" width="20" height="20" />
                <rect x="120" y="50" width="20" height="20" />

                <rect x="20" y="80" width="20" height="20" />
                <rect x="40" y="90" width="20" height="20" />
                <rect x="80" y="100" width="20" height="20" />
                <rect x="140" y="80" width="20" height="20" />
                <rect x="160" y="100" width="20" height="20" />

                <rect x="20" y="140" width="20" height="20" />
                <rect x="40" y="140" width="20" height="20" />
                <rect x="60" y="140" width="20" height="20" />
                <rect x="80" y="140" width="20" height="20" />
                <rect x="100" y="140" width="20" height="20" />
                <rect x="120" y="140" width="20" height="20" />
                <rect x="140" y="140" width="20" height="20" />
                <rect x="160" y="140" width="20" height="20" />

                <rect x="20" y="160" width="20" height="20" />
                <rect x="160" y="160" width="20" height="20" />
                <rect x="50" y="170" width="20" height="20" />
                <rect x="120" y="170" width="20" height="20" />
              </svg>

              {/* Scanning Line Animation */}
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 animate-pulse" />
            </div>
          )}

          <p className="text-sm text-[#0d1b0d] text-center mb-4">
            {isVerified ? 'Enjoy your exclusive discount on eligible products!' : 'Point your camera at the QR code to verify your subsidy eligibility'}
          </p>
        </div>

        {!isVerified && (
          <>
            {/* Status Display */}
            <div className="w-full flex items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-primary/10 border-2 border-primary text-[#0d1b0d] text-base font-bold leading-normal tracking-[0.015em] mb-4">
              <div className="flex items-center gap-2">
                <AiOutlineLoading3Quarters className="w-5 h-5 text-primary animate-spin" />
                <span>Waiting for QR Scan</span>
              </div>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="w-full flex items-center justify-center overflow-hidden rounded-lg h-14 px-4 border-2 border-[#cfe7cf] text-[#4c9a4c] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#cfe7cf]/10 transition-colors"
            >
              Skip for Now
            </button>
          </>
        )}

        {isVerified && (
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-primary text-[#0d1b0d] text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
          >
            Go Back
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
