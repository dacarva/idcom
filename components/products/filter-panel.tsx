export function FilterPanel () {
	return (
		<div className='flex flex-col gap-2'>
			{/* Search Input */}
			<input
				type='text'
				placeholder='Search products...'
				className='w-full rounded-lg bg-soft-mint/30 text-sm text-text-light placeholder:text-text-light/60 px-4 py-2 border-0 focus:outline-none mb-4'
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
			<div className='border-t border-border-light pt-4 flex items-center justify-between'>
				<p className='text-sm font-medium text-text-light'>
					Subsidized Items Only
				</p>
				<input type='checkbox' defaultChecked className='size-5' />
			</div>
		</div>
	)
}
