'use client'

export function Divider ({ label }: { label?: string }) {
	return (
		<div className='flex w-full items-center gap-4'>
			<hr className='flex-1 border-border-light' />
			{label && (
				<p className='text-sm font-medium text-text-light'>
					{label}
				</p>
			)}
			<hr className='flex-1 border-border-light' />
		</div>
	)
}
