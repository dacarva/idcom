'use client'

import { useProductsFilterStore } from '@/stores/products-filter-store'

const categories = [
	{ id: 'Pantry Staples', label: 'Pantry Staples', emoji: '🛒' },
	{ id: 'Dairy', label: 'Dairy', emoji: '🥛' },
	{ id: 'Household Goods', label: 'Household Goods', emoji: '🧹' },
	{ id: 'Personal Care', label: 'Personal Care', emoji: '🧼' },
]

export function FilterPanel () {
	const searchQuery = useProductsFilterStore((state) => state.searchQuery)
	const setSearchQuery = useProductsFilterStore((state) => state.setSearchQuery)
	const selectedCategory = useProductsFilterStore((state) => state.selectedCategory)
	const setSelectedCategory = useProductsFilterStore((state) => state.setSelectedCategory)

	return (
		<div className='flex flex-col gap-2'>
			{/* Search Input */}
			<input
				type='text'
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				placeholder='Search products...'
				className='w-full rounded-lg bg-soft-mint/30 text-sm text-text-light placeholder:text-text-light/60 px-4 py-2 border-0 focus:outline-none mb-4'
			/>

			{/* Categories */}
			<div className='flex flex-col gap-2 mb-6'>
				<p className='text-sm font-medium text-text-light/70 mb-2'>
					Categories
				</p>
				{categories.map((category) => (
					<button
						key={category.id}
						onClick={() =>
							setSelectedCategory(
								selectedCategory === category.id ? null : category.id,
							)
						}
						className={`flex items-center gap-3 px-3 py-2 rounded-lg text-text-light transition-colors ${
							selectedCategory === category.id
								? 'bg-primary/20'
								: 'hover:bg-primary/10'
						}`}
					>
						<span>{category.emoji}</span>
						<span>{category.label}</span>
					</button>
				))}
			</div>

			{/* Toggle */}
			<div className='border-t border-border-light pt-4 flex items-center justify-between'>
				<p className='text-sm font-medium text-text-light'>
					Subsidized Items Only
				</p>
				<input type='checkbox' defaultChecked className='size-5' />
			</div>
		</div>
	)
}
