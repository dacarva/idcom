import Link from 'next/link'
import { HeartIcon } from '@/components/icons/heart'

interface ProductsHeaderProps {
	cartCount: number
	onMobileFilterClick: () => void
}

export function ProductsHeader ({ cartCount, onMobileFilterClick }: ProductsHeaderProps) {
	return (
		<header className='sticky top-0 z-20 flex items-center justify-between border-b border-border-light px-4 py-3 sm:px-8 md:px-10 lg:px-20 bg-background-light/80 backdrop-blur-sm'>
			<div className='flex items-center gap-3'>
				<span className='text-3xl text-primary'>🍃</span>
				<h1 className='text-xl font-bold text-text-light'>
					Idcommerce
				</h1>
			</div>

			{/* Search (hidden on mobile) */}
			<div className='hidden md:flex flex-1 justify-center px-8'>
				<input
					type='text'
					placeholder='Search products...'
					className='w-full max-w-md rounded-lg bg-soft-mint/30 text-sm text-text-light placeholder:text-text-light/60 px-4 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50'
				/>
			</div>

			{/* Right Actions */}
			<div className='flex items-center gap-4'>
				<nav className='hidden lg:flex gap-6 text-sm font-medium'>
					<a href='#' className='text-text-light'>Home</a>
					<a href='#' className='text-text-light'>My Orders</a>
				</nav>
				<button className='hidden md:flex items-center justify-center rounded-full size-10 text-text-light hover:bg-primary/10'>
					<HeartIcon className='text-text-light' />
				</button>
				<Link href='/cart'>
					<button className='relative flex cursor-pointer items-center justify-center rounded-full size-10 bg-primary/20'>
						🛒
						{cartCount > 0 && (
							<span className='absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold size-5'>
								{cartCount}
							</span>
						)}
					</button>
				</Link>
				<div className='size-10 rounded-full bg-gradient-to-br from-soft-mint to-primary'></div>
			</div>
		</header>
	)
}
