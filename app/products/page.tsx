'use client'

import Link from 'next/link'
import { ProductCard } from '@/components/product/product-card'
import { HeartIcon } from '@/components/icons/heart'
import products from '@/data/products.json'
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
		<div className='relative flex min-h-screen w-full flex-col
			bg-background-light'>
			{/* Top Navigation */}
			<header className='sticky top-0 z-20 flex items-center
				justify-between border-b border-border-light px-4 py-3
				sm:px-8 md:px-10 lg:px-20 bg-background-light/80
				backdrop-blur-sm'>
				<div className='flex items-center gap-3'>
					<span className='text-3xl text-primary'>🍃</span>
					<h1 className='text-xl font-bold text-text-light'>
						Idcommerce
					</h1>
				</div>

				{/* Search (hidden on mobile) */}
				<div className='hidden md:flex flex-1 justify-center px-8'>
					<input
						type='text'
						placeholder='Search products...'
						className='w-full max-w-md rounded-lg
							bg-soft-mint/30 text-sm text-text-light
							placeholder:text-text-light/60
							px-4 py-2 border-0 focus:outline-none
							focus:ring-2 focus:ring-primary/50'
					/>
				</div>

				{/* Right Actions */}
				<div className='flex items-center gap-4'>
					<nav className='hidden lg:flex gap-6 text-sm font-medium'>
						<a href='#' className='text-text-light'>Home</a>
						<a href='#' className='text-text-light'>My Orders</a>
					</nav>
					<button className='hidden md:flex items-center
						justify-center rounded-full size-10 text-text-light
						hover:bg-primary/10'>
						<HeartIcon className='text-text-light' />
					</button>
					<button
						onClick={() => setMobileFilterOpen(true)}
						className='flex md:hidden items-center gap-2 text-text-light'
					>
						⚙️
					</button>
					<Link href='/cart'>
						<button className='relative flex cursor-pointer items-center
							justify-center rounded-full size-10
							bg-primary/20'>
							🛒
							{cartCount > 0 && (
								<span className='absolute -top-1 -right-1 flex
									items-center justify-center rounded-full
									bg-red-500 text-white text-xs font-bold
									size-5'>
									{cartCount}
								</span>
							)}
						</button>
					</Link>
					<div className='size-10 rounded-full
						bg-gradient-to-br from-soft-mint to-primary'>
					</div>
				</div>
			</header>

			{/* Mobile Filter Drawer */}
			{mobileFilterOpen && (
				<div className='fixed inset-0 z-40 md:hidden'>
					<div
						onClick={() => setMobileFilterOpen(false)}
						className='absolute inset-0 bg-black/50'
					/>
					<div className='absolute bottom-0 left-0 right-0 bg-background-light rounded-t-xl p-6 max-h-[80vh] overflow-y-auto'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-xl font-bold text-text-light'>Search & Filters</h2>
							<button
								onClick={() => setMobileFilterOpen(false)}
								className='text-text-light text-2xl'
							>
								×
							</button>
						</div>

						{/* Search Input */}
						<input
							type='text'
							placeholder='Search products...'
							className='w-full rounded-lg bg-soft-mint/30 text-sm
								text-text-light placeholder:text-text-light/60
								px-4 py-2 border-0 focus:outline-none mb-6'
						/>

						{/* Categories */}
						<div className='flex flex-col gap-2 mb-6'>
							<p className='text-sm font-medium text-text-light/70 mb-2'>
								Categories
							</p>
							<a href='#' className='flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20 text-text-light'>
								🛒 <span>Pantry Staples</span>
							</a>
							<a href='#' className='flex items-center gap-3 px-3 py-2 rounded-lg text-text-light hover:bg-primary/10'>
								🥛 <span>Dairy</span>
							</a>
							<a href='#' className='flex items-center gap-3 px-3 py-2 rounded-lg text-text-light hover:bg-primary/10'>
								🧹 <span>Household Goods</span>
							</a>
							<a href='#' className='flex items-center gap-3 px-3 py-2 rounded-lg text-text-light hover:bg-primary/10'>
								🧼 <span>Personal Care</span>
							</a>
						</div>

						{/* Toggle */}
						<div className='border-t border-border-light pt-6 flex items-center justify-between'>
							<p className='text-sm font-medium text-text-light'>
								Subsidized Items Only
							</p>
							<input type='checkbox' defaultChecked className='size-5' />
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className='flex flex-1 w-full max-w-[1440px] mx-auto
				px-4 sm:px-8 md:px-10 lg:px-20 py-8'>
				<div className='flex w-full gap-8'>
					{/* Sidebar Filters (desktop only) */}
					<aside className='hidden lg:block w-full max-w-xs
						sticky top-24 h-fit'>
						<div className='flex flex-col gap-4 rounded-xl
							border border-border-light bg-background-light p-4'>
							{/* Filter Header */}
							<div className='flex items-center gap-3'>
								<span className='text-xl'>⚙️</span>
								<div className='flex flex-col'>
									<p className='text-base font-medium
										text-text-light'>
										Filters
									</p>
									<p className='text-sm text-text-light/70'>
										Refine your search
									</p>
								</div>
							</div>

							{/* Categories */}
							<div className='flex flex-col gap-2 border-t
								border-border-light pt-4'>
								<a href='#' className='flex items-center gap-3 px-3 py-2
									rounded-lg bg-primary/20 text-text-light'>
									🛒 <span>Pantry Staples</span>
								</a>
								<a href='#' className='flex items-center gap-3 px-3 py-2
									rounded-lg text-text-light hover:bg-primary/10'>
									🥛 <span>Dairy</span>
								</a>
								<a href='#' className='flex items-center gap-3 px-3 py-2
									rounded-lg text-text-light hover:bg-primary/10'>
									🧹 <span>Household Goods</span>
								</a>
								<a href='#' className='flex items-center gap-3 px-3 py-2
									rounded-lg text-text-light hover:bg-primary/10'>
									🧼 <span>Personal Care</span>
								</a>
							</div>

							{/* Toggle */}
							<div className='border-t border-border-light pt-4
								flex items-center justify-between'>
								<p className='text-sm font-medium text-text-light'>
									Subsidized Items Only
								</p>
								<input type='checkbox' defaultChecked
									className='size-5' />
							</div>
						</div>
					</aside>

					{/* Product Grid */}
					<main className='flex-1'>
						{/* Info Banner */}
						{bannerVisible && (
							<div className='mb-8 flex items-center justify-between
								rounded-lg bg-soft-mint/30 p-4'>
								<p className='text-sm font-medium text-text-light'>
									Eligible users save on essentials!
									<a href='#' className='ml-2 font-bold text-primary
										underline'>
										Learn more
									</a>
								</p>
								<button
									onClick={() => setBannerVisible(false)}
									className='text-text-light/70
										hover:text-text-light'
								>
									✕
								</button>
							</div>
						)}

						{/* Grid */}
						<div className='grid grid-cols-1 sm:grid-cols-2
							lg:grid-cols-2 xl:grid-cols-3 gap-6'>
							{products.map((product) => (
								<ProductCard
									key={product.id}
									{...product}
								/>
							))}
						</div>
					</main>
				</div>
			</div>

			{/* Footer */}
			<footer className='border-t border-border-light mt-12
				px-4 py-8 sm:px-8 md:px-10 lg:px-20'>
				<div className='flex flex-col items-center
					justify-between gap-4 md:flex-row'>
					<p className='text-sm text-text-light/70'>
						© 2024 Idcommerce. All rights reserved.
					</p>
					<div className='flex gap-6'>
						<a href='#' className='text-sm font-medium
							hover:text-primary transition-colors'>
							About Us
						</a>
						<a href='#' className='text-sm font-medium
							hover:text-primary transition-colors'>
							FAQ
						</a>
						<a href='#' className='text-sm font-medium
							hover:text-primary transition-colors'>
							Support
						</a>
					</div>
				</div>
			</footer>
		</div>
	)
}
