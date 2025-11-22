import Link from 'next/link'

export function Navbar () {
	return (
		<header
			className='flex items-center justify-between px-4 py-3'
			role='banner'
		>
			<Link
				href='/'
				className='flex items-center gap-2'
				aria-label='Ir al inicio'
				tabIndex={0}
			>
				<div className='size-6 text-text-light dark:text-text-dark'>
					<svg
						viewBox='0 0 48 48'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
						aria-hidden='true'
					>
						<path
							d='M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z'
							fill='currentColor'
						/>
					</svg>
				</div>
				<h1 className='text-base font-bold tracking-tight'>
					Essentials
				</h1>
			</Link>

			<nav aria-label='Navegación principal'>
				<ul className='flex items-center gap-4 text-sm font-medium'>
					<li>
						<Link
							href='/products'
							className='hover:text-primary transition-colors'
						>
							Catálogo
						</Link>
					</li>
					<li>
						<Link
							href='/login'
							className='hover:text-primary transition-colors'
						>
							Entrar
						</Link>
					</li>
				</ul>
			</nav>
		</header>
	)
}
