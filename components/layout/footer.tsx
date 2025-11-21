import Link from 'next/link'

export function Footer () {
	return (
		<footer className='w-full p-6 text-center'>
			<nav aria-label='Enlaces de pie'>
				<ul className='flex flex-col items-center justify-center gap-4
					@[480px]:flex-row @[480px]:gap-8'>
					<li>
						<Link
							href='#'
							className='text-sm text-text-light/70 hover:text-primary
								dark:text-text-dark/70 dark:hover:text-primary'
						>
							Sobre Nosotros
						</Link>
					</li>
					<li>
						<Link
							href='#'
							className='text-sm text-text-light/70 hover:text-primary
								dark:text-text-dark/70 dark:hover:text-primary'
						>
							Ayuda
						</Link>
					</li>
					<li>
						<Link
							href='#'
							className='text-sm text-text-light/70 hover:text-primary
								dark:text-text-dark/70 dark:hover:text-primary'
						>
							Términos de Servicio
						</Link>
					</li>
				</ul>
			</nav>
		</footer>
	)
}
