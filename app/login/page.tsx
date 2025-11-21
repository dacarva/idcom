import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage () {
	return (
		<div className='flex min-h-screen w-full flex-col lg:flex-row'>
			{/* Left Pane: Image (hidden on mobile, visible on lg+) */}
			<div
				className='relative hidden h-full w-full lg:flex lg:flex-1
					bg-cover bg-center bg-no-repeat'
				style={{
					backgroundImage:
						"linear-gradient(to bottom, rgba(0,0,0,0), " +
						"rgba(0,0,0,0.3)), " +
						"url('https://lh3.googleusercontent.com/aida-public/AB6AXuCK4EgK_09-P9IaVEcozEjEBH-VShI9OEaY5fzY6U3sbtKMh-QSTtixhHHXwx7gYdJaiSxHaQ7cR2Tp8Xscib8uS-pMqeknXLnn7rBFB6vo-bDSykIyXz8gEyXEiWUyh12bU8pNXx03hnguBcd8z5dTRKeYxPsgrpPQWMpymWNau2STe6g8UGwOCfjAd1HHmfMWYTgXAitu5byduXhOhE_Ob0qgM_0A4WEQvjQ83fesGKQwqFO1nAA2dDkHjr0lWSxp4LkJ0Xs1-go')",
				}}
				data-alt='Essential products and vegetables'
			/>

			{/* Right Pane: Form */}
			<div
				className='flex w-full flex-1 items-center justify-center
					bg-background-light p-4 sm:p-8 md:p-12 lg:p-16'
			>
				<div className='flex w-full max-w-md flex-col items-center gap-8'>
					{/* Header */}
					<div className='flex w-full flex-col items-center gap-4'>
						<div className='flex items-center gap-2 text-2xl font-bold'>
							{/* Leaf icon */}
							<svg
								className='size-6 text-primary'
								viewBox='0 0 24 24'
								fill='currentColor'
							>
								<path d='M12 2C12 2 8 6 8 12c0 2.21 1.79 4 4 4s4-1.79 4-4c0-6-4-10-4-10z' />
							</svg>
									<span className='text-text-light'>Idcommerce</span>
						</div>

						<div className='flex flex-col gap-2 text-center'>
							<h1 className='text-3xl font-black tracking-tight
								text-text-light sm:text-4xl'>
								Sign in to get started
							</h1>
							<p className='text-base font-normal text-text-light/70'>
								Shop essential products with exclusive
								discounts for members.
							</p>
						</div>
					</div>

					{/* Form */}
					<LoginForm />
				</div>
			</div>
		</div>
	)
}
