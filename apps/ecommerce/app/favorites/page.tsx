'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { ProductCard } from '@/components/products/product-card'
import { useFavoritesStore } from '@/stores/favorites-store'
import { useCartStore } from '@/stores/cart-store'
import products from '@/data/products.json'

export default function FavoritesPage() {
  const favorites = useFavoritesStore((state) => state.favorites)
  const getCartCount = useCartStore((state) => state.getCount)
  const [mounted, setMounted] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    setCartCount(getCartCount())
    const unsubscribe = useCartStore.subscribe(() => {
      setCartCount(getCartCount())
    })
    return unsubscribe
  }, [getCartCount])

  if (!mounted) return null

  const favoriteProducts = products.filter((product) =>
    favorites.includes(product.id),
  )

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <AppHeader cartCount={cartCount} showFavorites showSearch />

      <main className="flex-1 w-full">
        <div className="px-4 sm:px-6 lg:px-8 flex-1 w-full max-w-7xl mx-auto py-8 lg:py-12">
          {/* Breadcrumb */}
          <div className="space-y-4 mb-8">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
                { label: 'Favorites' },
              ]}
            />
            <h1 className="text-[#0d1b0d] text-4xl font-black leading-tight tracking-[-0.033em]">
              My Favorites
            </h1>
          </div>

          {/* Content */}
          {favoriteProducts.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-6">
                You have {favoriteProducts.length} favorite
                {favoriteProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {favoriteProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
              <p className="text-gray-500 text-center mb-6">
                You haven't added any products to your favorites yet
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-primary text-[#0d1b0d] text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
