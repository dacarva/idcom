'use client'

import Link from 'next/link'
import { BsQrCodeScan } from 'react-icons/bs'
import { AiOutlineHeart } from 'react-icons/ai'
import { MdTune } from 'react-icons/md'
import { useUserStore } from '@/stores/user-store'

interface FABBarProps {
	onFilterClick: () => void
}

export function FABBar ({ onFilterClick }: FABBarProps) {
	const userHasSubsidy = useUserStore((state) => state.user?.hasSubsidy ?? false)
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
				<MdTune className='w-6 h-6 text-[#0d7d0d]' />
			</button>
			<Link href='/verify-subsidy'>
				<button
					className='relative flex items-center justify-center rounded-full
						size-12 bg-primary/20 text-primary transition
						hover:bg-primary/30'
					aria-label='Verify subsidy with QR'
				>
					<BsQrCodeScan className='w-6 h-6 text-[#0d7d0d]' />
					{userHasSubsidy && (
						<span className='absolute top-0 right-0 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-xs font-bold'>
							✓
						</span>
					)}
				</button>
			</Link>
			<Link href='/favorites'>
				<button
					className='flex items-center justify-center rounded-full
						size-12 bg-primary/20 text-primary transition
						hover:bg-primary/30'
					aria-label='Favorites'
				>
					<AiOutlineHeart className='w-6 h-6 text-[#0d7d0d]' />
				</button>
			</Link>
		</div>
	)
}
