import { ProductCard } from '@/components/products/product-card'
import products from '@/data/products.json'

export function ProductsGrid () {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
			{products.map((product) => (
				<ProductCard key={product.id} {...product} />
			))}
		</div>
	)
}
