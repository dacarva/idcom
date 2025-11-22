import { useState } from 'react'

export type ToastType = 'success' | 'error'

export interface Toast {
  message: string
  type: ToastType
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null)

  const show = (message: string, type: ToastType = 'success', duration = 3000) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), duration)
  }

  const success = (message: string, duration = 3000) => {
    show(message, 'success', duration)
  }

  const error = (message: string, duration = 3000) => {
    show(message, 'error', duration)
  }

  const clear = () => {
    setToast(null)
  }

  return {
    toast,
    show,
    success,
    error,
    clear,
  }
}
