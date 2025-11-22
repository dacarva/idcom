'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface SubsidyModalProps {
	isOpen: boolean
	onClose: () => void
}

export function SubsidyModal ({ isOpen, onClose }: SubsidyModalProps) {
	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center
			bg-black/50 p-4'>
			<div className='flex w-full max-w-md flex-col items-center gap-6
				rounded-xl bg-white p-8 text-center shadow-lg'>
				{/* Icon */}
				<div className='flex size-20 items-center justify-center
					rounded-full bg-soft-mint'>
					<svg
						className='size-10 text-text-light'
						viewBox='0 0 24 24'
						fill='currentColor'
					>
						<path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
					</svg>
				</div>

				{/* Content */}
				<div className='flex flex-col gap-2'>
					<h1 className='text-3xl font-black text-text-light'>
						Your Subsidy is Active!
					</h1>
					<p className='text-base font-normal text-text-light/70'>
						Exclusive discounts will be automatically applied to
						all eligible essential products in your cart at
						checkout.
					</p>
				</div>

				{/* Actions */}
				<div className='flex flex-col items-center justify-center gap-4
					w-full'>
					<Link href='/products' className='w-full'>
						<Button className='w-full'>
							Start Shopping
						</Button>
					</Link>
					<button
						onClick={onClose}
						className='text-sm font-medium text-text-light/70
							hover:text-primary transition-colors'
					>
						How does it work?
					</button>
				</div>
			</div>
		</div>
	)
}
