'use client'

import { useToast } from '@/hooks/useToast'

export function useToastNotification() {
  return useToast()
}

interface ToastProps {
  toast: ReturnType<typeof useToast>['toast']
}

export function ToastNotification({ toast }: ToastProps) {
  if (!toast) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:transform md:-translate-x-1/2 md:w-96 z-50 animate-in fade-in slide-in-from-bottom-2">
      <div
        className={`rounded-lg px-6 py-4 text-center font-medium shadow-lg ${
          toast.type === 'success'
            ? 'bg-primary text-[#0d1b0d]'
            : 'bg-red-100 text-red-600 border border-red-200'
        }`}
      >
        {toast.message}
      </div>
    </div>
  )
}
