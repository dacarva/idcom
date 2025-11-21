import Link from 'next/link'

export default function Page () {
	return (
		<div className='flex min-h-screen w-full flex-col justify-between
			p-4'>
			<div className='flex flex-1 items-center justify-center'>
				<div className='flex w-full max-w-sm flex-col items-center
					gap-8 text-center'>
					<h1 className='text-4xl font-black leading-tight
						tracking-tight'>
						Your essentials, more affordable.
					</h1>
					<p className='text-base font-normal leading-normal
						text-text-light/80'>
						Shop essential products with discounts.
					</p>
					<Link href='/login'>
						<button
							className='flex cursor-pointer items-center justify-center
							overflow-hidden rounded-full h-12 px-8
							bg-primary text-text-light text-base
							font-bold leading-normal
							transition-all hover:opacity-90'
							aria-label='Sign in'
							title='Sign in'
						>
							<span className='truncate'>Get Started</span>
						</button>
					</Link>
				</div>
			</div>
			<footer className='w-full text-center'>
				<div className='flex flex-col items-center justify-center gap-4'>
					<a className='text-sm text-text-light/60 hover:text-primary
						transition-colors' href='#'>
						About Us
					</a>
					<a className='text-sm text-text-light/60 hover:text-primary
						transition-colors' href='#'>
						Help
					</a>
					<a className='text-sm text-text-light/60 hover:text-primary
						transition-colors' href='#'>
						Terms of Service
					</a>
				</div>
			</footer>
		</div>
	)
}
