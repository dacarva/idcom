import { FilterPanel } from '@/components/products/filter-panel'

interface FilterDrawerProps {
	open: boolean
	onClose: () => void
}

export function FilterDrawer ({ open, onClose }: FilterDrawerProps) {
	if (!open) return null

	return (
		<div className='fixed inset-0 z-40 md:hidden'>
			<div onClick={onClose} className='absolute inset-0 bg-black/50' />
			<div className='absolute bottom-0 left-0 right-0 bg-background-light rounded-t-xl p-6 max-h-[80vh] overflow-y-auto'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-bold text-text-light'>Search & Filters</h2>
					<button onClick={onClose} className='text-text-light text-2xl'>
						×
					</button>
				</div>

				<FilterPanel />
			</div>
		</div>
	)
}
