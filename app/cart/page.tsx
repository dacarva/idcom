'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'

export default function CartPage () {
	const items = useCartStore((state) => state.items)
	const getSubtotal = useCartStore((state) => state.getSubtotal)
	const updateQuantity = useCartStore((state) => state.updateQuantity)
	const removeItem = useCartStore((state) => state.removeItem)

	 const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return null
	}

	const subtotal = getSubtotal()
	const subsidy = subtotal * 0.3
	const shipping = 5.0
	const total = subtotal - subsidy + shipping

	return (
		<div className='flex min-h-screen w-full flex-col'>
			{/* Header */}
			<header className='sticky top-0 z-10 w-full border-b border-gray-200
				bg-white/80 backdrop-blur-sm'>
				<div className='container mx-auto px-4'>
					<div className='flex h-16 items-center justify-between'>
						<Link
							href='/'
							className='flex items-center gap-4 text-gray-900'
						>
							<span className='text-2xl'>🍃</span>
							<h2 className='text-lg font-bold tracking-tight'>
								Essentials Subsidy
							</h2>
						</Link>

						<nav className='hidden items-center gap-8 md:flex'>
							<Link href='/products'
								className='text-sm font-medium hover:text-green-600'>
								Continue Shopping
							</Link>
							<a href='#'
								className='text-sm font-medium hover:text-green-600'>
								Categories
							</a>
							<a href='#'
								className='text-sm font-medium hover:text-green-600'>
								Help
							</a>
						</nav>

						<div className='flex items-center gap-3'>
						<Link href='/cart'>
							<button className='flex h-10 w-10 items-center
								justify-center rounded-full bg-green-100
								text-green-600'>
								🛒
							</button>
						</Link>
							<div className='ml-2 h-10 w-10 rounded-full
								bg-gradient-to-br from-green-300 to-green-500'>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Main */}
			<main className='flex-grow'>
				<div className='container mx-auto px-4 py-8 md:py-12'>
					{/* Breadcrumbs */}
					<div className='mb-6 flex flex-wrap items-center gap-2'>
						<Link href='/'
							className='text-sm font-medium text-green-600
								hover:underline'>
							Home
						</Link>
						<span className='text-sm font-medium text-gray-400'>
							/
						</span>
						<Link href='/products'
							className='text-sm font-medium text-green-600
								hover:underline'>
							Products
						</Link>
						<span className='text-sm font-medium text-gray-400'>
							/
						</span>
						<span className='text-sm font-medium text-gray-900'>
							Shopping Cart
						</span>
					</div>

					{/* Heading */}
					<div className='mb-8 flex flex-wrap items-end
						justify-between gap-4'>
						<div className='flex flex-col'>
							<h1 className='text-4xl font-extrabold
								tracking-tight text-gray-900'>
								Your Cart
							</h1>
							<p className='mt-1 text-base text-gray-600'>
								You have {items.length} item{items.length !== 1 ? 's' : ''} in your cart.
							</p>
						</div>
					</div>

					{/* Grid */}
					<div className='grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12'>
						{/* Left: Items */}
						<div className='space-y-4 lg:col-span-2'>
							{items.length === 0 ? (
								<div className='flex flex-col items-center
									justify-center rounded-lg border border-gray-200
									bg-white p-8 text-center'>
									<p className='text-lg font-semibold text-gray-900'>
										Your cart is empty
									</p>
									<Link href='/products'>
										<Button className='mt-4'>
											Continue Shopping
										</Button>
									</Link>
								</div>
							) : (
								items.map((item) => (
									<div
										key={item.id}
										className='flex items-center gap-4
											rounded-lg border border-gray-200
											bg-white p-4 shadow-sm'
									>
										<img
											src={item.image}
											alt={item.name}
											className='h-20 w-20 flex-shrink-0
												rounded-md object-cover'
										/>

										<div className='flex-grow'>
											<p className='font-semibold text-gray-900
												line-clamp-1'>
												{item.name}
											</p>
											<p className='text-sm text-gray-600
												line-clamp-1'>
												{item.id}
											</p>
											<p className='mt-2 text-lg font-bold
												text-gray-900'>
												${item.discountedPrice.toFixed(2)}
											</p>
										</div>

										<div className='flex flex-col items-end gap-2'>
											<div className='flex items-center gap-2
												text-gray-900'>
												<button
													onClick={() => updateQuantity(
														item.id,
														item.quantity - 1,
													)}
													className='flex h-8 w-8
														items-center justify-center
														rounded-full bg-gray-100
														font-medium transition
														hover:bg-green-100'
												>
													−
												</button>
												<input
													type='number'
													value={item.quantity}
													onChange={(e) => {
														const qty = parseInt(
															e.target.value,
														) || 1
														updateQuantity(item.id, qty)
													}}
													className='w-8 border-none
														bg-transparent p-0
														text-center font-medium
														focus:outline-none
														focus:ring-0'
													min='1'
													max='20'
												/>
												<button
													onClick={() => updateQuantity(
														item.id,
														item.quantity + 1,
													)}
													className='flex h-8 w-8
														items-center justify-center
														rounded-full bg-gray-100
														font-medium transition
														hover:bg-green-100'
												>
													+
												</button>
											</div>
											<button
												onClick={() => removeItem(item.id)}
												className='flex items-center gap-1
													text-sm text-gray-600
													hover:text-red-500'
											>
												🗑️ Remove
											</button>
										</div>
									</div>
								))
							)}
						</div>

						{/* Right: Summary */}
						<div className='lg:col-span-1'>
							<div className='sticky top-24 rounded-lg border
								border-gray-200 bg-gray-50 p-6 shadow-sm'>
								<h2 className='text-xl font-bold text-gray-900'>
									Order Summary
								</h2>

								<div className='mt-6 space-y-4'>
									<div className='flex justify-between'>
										<span className='text-gray-600'>
											Subtotal
										</span>
										<span className='font-medium
											text-gray-900'>
											${subtotal.toFixed(2)}
										</span>
									</div>

									<div className='flex justify-between'>
										<div className='flex items-center gap-1.5'>
											<span className='text-gray-600'>
												30% Subsidy
											</span>
											<span title='Discount for eligible users.'
												className='text-gray-400 cursor-help'>
												ℹ️
											</span>
										</div>
										<span className='font-medium
											text-green-600'>
											-${subsidy.toFixed(2)}
										</span>
									</div>

									<div className='flex justify-between'>
										<span className='text-gray-600'>
											Shipping
										</span>
										<span className='font-medium
											text-gray-900'>
											${shipping.toFixed(2)}
										</span>
									</div>

									<div className='border-t border-gray-300'></div>

									<div className='flex items-center
										justify-between text-lg font-bold
										text-gray-900'>
										<span>Total</span>
										<span>${total.toFixed(2)}</span>
									</div>
								</div>

								<Link href='/checkout'>
									<Button className='mt-8 w-full'>
										Proceed to Checkout
									</Button>
								</Link>

								<p className='mt-4 text-center text-xs
									text-gray-500'>
									Subsidy is available for eligible
									customers. Terms and conditions apply.
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}
