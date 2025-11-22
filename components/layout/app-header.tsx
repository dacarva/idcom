import Link from 'next/link'
import { HeartIcon } from '@/components/icons/heart'

interface AppHeaderProps {
	cartCount?: number
	showSearch?: boolean
	showNav?: boolean
	showFavorites?: boolean
	onMobileMenuClick?: () => void
	navItems?: Array<{ label: string; href: string }>
}

export function AppHeader ({
	cartCount = 0,
	showSearch = false,
	showNav = false,
	showFavorites = false,
	onMobileMenuClick,
	navItems = [],
}: AppHeaderProps) {
	return (
		<header className='sticky top-0 z-20 flex items-center justify-between border-b border-border-light px-4 py-3 sm:px-8 md:px-10 lg:px-20 bg-background-light/80 backdrop-blur-sm'>
			{/* Logo */}
			<div className='flex items-center gap-3'>
				<span className='text-3xl text-primary'>🍃</span>
				<h1 className='text-xl font-bold text-text-light'>
					idcom
				</h1>
			</div>

			{/* Search */}
			{showSearch && (
				<div className='hidden md:flex flex-1 justify-center px-8'>
					<input
						type='text'
						placeholder='Search products...'
						className='w-full max-w-md rounded-lg bg-soft-mint/30 text-sm text-text-light placeholder:text-text-light/60 px-4 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50'
					/>
				</div>
			)}

			{/* Right Actions */}
			<div className='flex items-center gap-4'>
				{/* Navigation */}
				{showNav && navItems.length > 0 && (
					<nav className='hidden lg:flex gap-6 text-sm font-medium'>
						{navItems.map((item, idx) => (
							<Link
								key={`${item.label}-${idx}`}
								href={item.href}
								className='text-text-light hover:text-primary transition'
							>
								{item.label}
							</Link>
						))}
					</nav>
				)}

				{/* Favorites */}
				{showFavorites && (
					<button className='hidden md:flex items-center justify-center rounded-full size-10 text-text-light hover:bg-primary/10'>
						<HeartIcon className='text-text-light' />
					</button>
				)}

				{/* Cart */}
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

				{/* Mobile menu trigger */}
				{onMobileMenuClick && (
					<button
						onClick={onMobileMenuClick}
						className='flex md:hidden items-center gap-2 text-text-light'
					>
						⚙️
					</button>
				)}

				{/* Avatar */}
				<div className='size-10 rounded-full bg-gradient-to-br from-soft-mint to-primary' />
			</div>
		</header>
	)
}
