import { create } from 'zustand'

interface FilecoinState {
  initialized: boolean
  loading: boolean
  error: string | null
  initialize: () => Promise<void>
}

export const useFilecoinStore = create<FilecoinState>((set) => ({
  initialized: false,
  loading: true,
  error: null,

  initialize: async () => {
    // Prevent multiple initializations
    set({ loading: true })

    try {
      console.log('🚀 Initializing Filecoin Payment Service...')
      const response = await fetch('/api/filecoin/payment-init', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Init failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Filecoin initialized:', data)

      set({
        initialized: true,
        loading: false,
        error: null,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Filecoin initialization failed:', errorMsg)

      set({
        initialized: false,
        loading: false,
        error: errorMsg,
      })
    }
  },
}))
