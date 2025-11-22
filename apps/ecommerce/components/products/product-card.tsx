'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import { useFavoritesStore } from '@/stores/favorites-store'
import { useUserStore } from '@/stores/user-store'

interface ProductCardProps {
	id: string
	name: string
	description: string
	price: number
	discountedPrice: number
	image: string
}

export function ProductCard (props: ProductCardProps) {
	const { id, name, description, price, discountedPrice, image } = props
	const addItem = useCartStore((state) => state.addItem)
	const isFavorite = useFavoritesStore((state) => state.isFavorite)
	const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
	const userHasSubsidy = useUserStore((state) => state.user?.hasSubsidy ?? false)

	const [mounted, setMounted] = useState(false)
	const [isFav, setIsFav] = useState(false)

	// Determine which price to show
	const displayPrice = userHasSubsidy ? discountedPrice : price
	const originalPrice = userHasSubsidy ? price : null

	useEffect(() => {
		setMounted(true)
		setIsFav(isFavorite(id))
		const unsubscribe = useFavoritesStore.subscribe(
			() => setIsFav(isFavorite(id)),
		)
		return unsubscribe
	}, [id, isFavorite])

	const handleAddToCart = () => {
		addItem({ id, name, price, discountedPrice, image })
	}

	const handleToggleFavorite = () => {
		toggleFavorite(id)
	}

	return (
		<div className='flex flex-col gap-4 rounded-xl border border-border-light
			bg-background-light p-4 transition-shadow hover:shadow-lg'>
			{/* Image with Favorite Button */}
			<div className='relative aspect-square w-full rounded-lg bg-gray-100
				overflow-hidden'>
				<img
					src={image}
					alt={name}
					className='h-full w-full object-cover'
				/>
				{mounted && (
					<button
						onClick={handleToggleFavorite}
						className='absolute top-2 right-2 p-2 rounded-full bg-white hover:bg-gray-100 transition-colors'
						aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
					>
						<svg
							className={`w-5 h-5 transition-colors ${
								isFav ? 'text-red-500' : 'text-gray-300'
							}`}
							fill={isFav ? 'currentColor' : 'none'}
							stroke='currentColor'
							strokeWidth={isFav ? 0 : 2}
							viewBox='0 0 24 24'
						>
							<path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
						</svg>
					</button>
				)}
			</div>

			{/* Content */}
			<div className='flex flex-col gap-2'>
				<h3 className='font-bold text-lg text-text-light'>
					{name}
				</h3>
				<p className='text-sm text-text-light/60'>
					{description}
				</p>
			</div>

			{/* Price */}
			<div className='flex flex-col gap-2 mt-auto'>
				<div className='flex items-baseline gap-2'>
					<span className='text-2xl font-bold text-primary'>
						${displayPrice.toFixed(2)}
					</span>
					{originalPrice && (
						<span className='text-sm text-text-light/60 line-through'>
							${originalPrice.toFixed(2)}
						</span>
					)}
				</div>

				{/* Add to Cart Button */}
				<Button
					onClick={handleAddToCart}
					className='w-full'
				>
					Add to Cart
				</Button>
			</div>
		</div>
	)
}
