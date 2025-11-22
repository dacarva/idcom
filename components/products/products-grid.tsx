'use client'

import { ProductCard } from '@/components/products/product-card'
import { useProductsFilterStore } from '@/stores/products-filter-store'
import products from '@/data/products.json'

export function ProductsGrid () {
	const searchQuery = useProductsFilterStore((state) => state.searchQuery)
	const selectedCategory = useProductsFilterStore((state) => state.selectedCategory)

	const filteredProducts = products.filter((product) => {
		const matchesSearch =
			searchQuery === '' ||
			product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.description.toLowerCase().includes(searchQuery.toLowerCase())

		const matchesCategory =
			selectedCategory === null ||
			product.category === selectedCategory

		return matchesSearch && matchesCategory
	})

	return (
		<div className='w-full'>
			{filteredProducts.length > 0 ? (
				<>
					<p className='text-sm text-gray-600 mb-4'>
						Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
					</p>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
						{filteredProducts.map((product) => (
							<ProductCard key={product.id} {...product} />
						))}
					</div>
				</>
			) : (
				<div className='flex flex-col items-center justify-center py-12'>
					<svg
						className='w-12 h-12 text-gray-300 mb-4'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={1.5}
							d='M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m0 0F3.75 9.375m0 0c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125m0 0v-3.75'
						/>
					</svg>
					<p className='text-gray-500 text-center'>
						No products found matching your search
					</p>
				</div>
			)}
		</div>
	)
}
