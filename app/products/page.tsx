'use client'

import { FABBar } from '@/components/mobile/fab-bar'
import { AppHeader } from '@/components/layout/app-header'
import { FilterDrawer } from '@/components/products/filter-drawer'
import { FilterSidebar } from '@/components/products/filter-sidebar'
import { ProductsBanner } from '@/components/products/products-banner'
import { ProductsGrid } from '@/components/products/products-grid'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/stores/cart-store'

export default function ProductsPage () {
	const [bannerVisible, setBannerVisible] = useState(true)
	const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
	const [cartCount, setCartCount] = useState(0)
	const getCount = useCartStore((state) => state.getCount)

	useEffect(() => {
		setCartCount(getCount())
		const unsubscribe = useCartStore.subscribe(
			() => setCartCount(getCount()),
		)
		return unsubscribe
	}, [])

	return (
		<div className='relative flex min-h-screen w-full flex-col'>
			<AppHeader
				cartCount={cartCount}
				showSearch
				showFavorites
			/>

			<FilterDrawer open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} />

			{/* Main Content */}
			<div className='flex flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-10 lg:px-20 py-8'>
				<div className='flex w-full gap-8'>
					<FilterSidebar />

					{/* Product Grid */}
					<main className='flex-1'>
						<ProductsBanner visible={bannerVisible} onClose={() => setBannerVisible(false)} />
						<ProductsGrid />
					</main>
				</div>
			</div>

			{/* Mobile FAB Bar */}
			<FABBar onFilterClick={() => setMobileFilterOpen(true)} />
			{/* Padding for FAB bar */}
			<div className='md:hidden h-20'></div>

			{/* Footer */}
			<footer className='border-t border-border-light mt-12 px-4 py-8 sm:px-8 md:px-10 lg:px-20'>
				<div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
					<p className='text-sm text-text-light/70'>
						© 2024 idcom. All rights reserved.
					</p>
					<div className='flex gap-6'>
						<a href='#' className='text-sm font-medium hover:text-primary transition-colors'>
							About Us
						</a>
						<a href='#' className='text-sm font-medium hover:text-primary transition-colors'>
							FAQ
						</a>
						<a href='#' className='text-sm font-medium hover:text-primary transition-colors'>
							Support
						</a>
					</div>
				</div>
			</footer>
		</div>
	)
}
