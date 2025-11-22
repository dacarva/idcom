import { create } from 'zustand'

interface ProductsFilterState {
  searchQuery: string
  selectedCategory: string | null
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  clearFilters: () => void
}

export const useProductsFilterStore = create<ProductsFilterState>((set) => ({
  searchQuery: '',
  selectedCategory: null,

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category })
  },

  clearFilters: () => {
    set({
      searchQuery: '',
      selectedCategory: null,
    })
  },
}))
