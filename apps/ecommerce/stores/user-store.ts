import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  hasSubsidy: boolean
}

interface UserState {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, name: string) => void
  logout: () => void
  activateSubsidy: () => void
  deactivateSubsidy: () => void
  verifySubsidy: () => void
  skipSubsidyVerification: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: (email, name) => {
        const hasSubsidy = email === 'verified@idcom.com'
        set({
          user: {
            id: `user_${Date.now()}`,
            email,
            name,
            hasSubsidy,
          },
          isLoggedIn: true,
        })
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
        })
      },

      activateSubsidy: () => {
        set((state) => {
          if (state.user) {
            return {
              user: {
                ...state.user,
                hasSubsidy: true,
              },
            }
          }
          return state
        })
      },

      deactivateSubsidy: () => {
        set((state) => {
          if (state.user) {
            return {
              user: {
                ...state.user,
                hasSubsidy: false,
              },
            }
          }
          return state
        })
      },

      verifySubsidy: () => {
        set((state) => {
          if (state.user) {
            return {
              user: {
                ...state.user,
                hasSubsidy: true,
              },
            }
          }
          return state
        })
      },

      skipSubsidyVerification: () => {
        set((state) => {
          if (state.user) {
            return {
              user: {
                ...state.user,
                hasSubsidy: false,
              },
            }
          }
          return state
        })
      },
    }),
    {
      name: 'user-store',
    },
  ),
)
