interface FABBarProps {
	onFilterClick: () => void
}

export function FABBar ({ onFilterClick }: FABBarProps) {
	return (
		<div className='fixed bottom-0 left-0 right-0 z-30 flex md:hidden
			items-center justify-center gap-4 bg-white/80 backdrop-blur-sm
			border-t border-border-light px-4 py-3'>
			<button
				onClick={onFilterClick}
				className='flex items-center justify-center rounded-full
					size-12 bg-primary/20 text-primary transition
					hover:bg-primary/30'
				aria-label='Filters'
			>
				⚙️
			</button>
			<button
				className='flex items-center justify-center rounded-full
					size-12 bg-primary/20 text-primary transition
					hover:bg-primary/30'
				aria-label='Favorites'
			>
				❤️
			</button>
		</div>
	)
}
