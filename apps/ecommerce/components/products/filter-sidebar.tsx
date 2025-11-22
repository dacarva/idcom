import { FilterPanel } from '@/components/products/filter-panel'

export function FilterSidebar () {
	return (
		<aside className='hidden lg:block w-full max-w-xs sticky top-24 h-fit'>
			<div className='flex flex-col gap-4 rounded-xl border border-border-light bg-background-light p-4'>
				{/* Filter Header */}
				<div className='flex items-center gap-3'>
					<span className='text-xl'>⚙️</span>
					<div className='flex flex-col'>
						<p className='text-base font-medium text-text-light'>
							Filters
						</p>
						<p className='text-sm text-text-light/70'>
							Refine your search
						</p>
					</div>
				</div>

				{/* Divider */}
				<div className='border-t border-border-light pt-4'>
					<FilterPanel />
				</div>
			</div>
		</aside>
	)
}
