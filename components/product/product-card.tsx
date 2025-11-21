'use client'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'

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

	const handleAddToCart = () => {
		addItem({ id, name, price, discountedPrice, image })
	}

	return (
		<div className='flex flex-col gap-4 rounded-xl border border-border-light
			bg-background-light p-4 transition-shadow hover:shadow-lg'>
			{/* Image */}
			<div className='aspect-square w-full rounded-lg bg-gray-100
				overflow-hidden'>
				<img
					src={image}
					alt={name}
					className='h-full w-full object-cover'
				/>
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
						${discountedPrice.toFixed(2)}
					</span>
					<span className='text-sm text-text-light/60 line-through'>
						${price.toFixed(2)}
					</span>
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
