interface ProductsBannerProps {
	visible: boolean
	onClose: () => void
}

export function ProductsBanner ({ visible, onClose }: ProductsBannerProps) {
	if (!visible) return null

	return (
		<div className='mb-8 flex items-center justify-between rounded-lg bg-soft-mint/30 p-4'>
			<p className='text-sm font-medium text-text-light'>
				Eligible users save on essentials!
				<a href='#' className='ml-2 font-bold text-primary underline'>
					Learn more
				</a>
			</p>
			<button
				onClick={onClose}
				className='text-text-light/70 hover:text-text-light'
			>
				✕
			</button>
		</div>
	)
}
