'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HeartIcon } from '@/components/icons/heart'
import { useProductsFilterStore } from '@/stores/products-filter-store'
import { useFavoritesStore } from '@/stores/favorites-store'
import { useUserStore } from '@/stores/user-store'
import { useState, useEffect, useRef } from 'react'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { AiOutlineUser } from 'react-icons/ai'
import { BiLogOut } from 'react-icons/bi'

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
	const router = useRouter()
	const searchQuery = useProductsFilterStore((state) => state.searchQuery)
	const setSearchQuery = useProductsFilterStore((state) => state.setSearchQuery)
	const favoritesCount = useFavoritesStore((state) => state.getCount())
	const logout = useUserStore((state) => state.logout)
	const [mounted, setMounted] = useState(false)
	const [showUserMenu, setShowUserMenu] = useState(false)
	const userMenuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
				setShowUserMenu(false)
			}
		}

		if (showUserMenu) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showUserMenu])

	const handleLogout = () => {
		logout()
		setShowUserMenu(false)
		router.push('/login')
	}
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
			{showSearch && mounted && (
				<div className='hidden md:flex flex-1 justify-center px-8'>
					<input
						type='text'
						placeholder='Search products...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
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
				{showFavorites && mounted && (
					<Link href='/favorites'>
						<button className='hidden md:flex items-center justify-center rounded-full size-10 text-text-light hover:bg-primary/10 relative'>
							<HeartIcon className='text-text-light' />
							{favoritesCount > 0 && (
								<span className='absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-primary text-white text-xs font-bold rounded-full'>
									{favoritesCount}
								</span>
							)}
						</button>
					</Link>
				)}

				{/* Cart */}
				<Link href='/cart'>
					<button className='relative flex cursor-pointer items-center justify-center rounded-full size-10 bg-primary/20 text-[#0d7d0d] hover:bg-primary/30 transition-colors'>
						<AiOutlineShoppingCart className='w-6 h-6' />
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

				{/* User Avatar with Dropdown */}
				<div className='relative' ref={userMenuRef}>
					<button
						onClick={() => setShowUserMenu(!showUserMenu)}
						className='flex items-center justify-center rounded-full size-10 bg-primary/20 text-[#0d7d0d] hover:bg-primary/30 transition-colors'
					>
						<AiOutlineUser className='w-6 h-6' />
					</button>

					{/* Dropdown Menu */}
					{showUserMenu && (
						<div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border-light z-50'>
							<button
								onClick={handleLogout}
								className='w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg'
							>
								<BiLogOut className='w-5 h-5' />
								Logout
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	)
}
