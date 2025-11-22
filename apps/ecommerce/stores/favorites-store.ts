import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favorites: string[]
  addFavorite: (productId: string) => void
  removeFavorite: (productId: string) => void
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  getCount: () => number
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (productId) => {
        set((state) => {
          if (!state.favorites.includes(productId)) {
            return {
              favorites: [...state.favorites, productId],
            }
          }
          return state
        })
      },

      removeFavorite: (productId) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== productId),
        }))
      },

      toggleFavorite: (productId) => {
        const isFav = get().isFavorite(productId)
        if (isFav) {
          get().removeFavorite(productId)
        } else {
          get().addFavorite(productId)
        }
      },

      isFavorite: (productId) => {
        return get().favorites.includes(productId)
      },

      getCount: () => {
        return get().favorites.length
      },
    }),
    {
      name: 'favorites-store',
    },
  ),
)
