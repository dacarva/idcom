'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { SocialButton } from '@/components/auth/social-button'
import { useUserStore } from '@/stores/user-store'
import Link from 'next/link'

export function LoginForm () {
	const router = useRouter()
	const login = useUserStore((state) => state.login)
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (email && phone) {
			// Extract name from email for now
			const name = email.split('@')[0]
			login(email, name)
			// If email is verified demo, go straight to products
			if (email === 'verified@idcom.com') {
				router.push('/products')
			} else {
				router.push('/verify-subsidy')
			}
		}
	}

	return (
		<form onSubmit={handleSubmit} className='flex w-full flex-col gap-6'>
			<div className='flex flex-col gap-4'>
				<Input
					label='Email address'
					type='email'
					placeholder='Enter your email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<Input
					label='Phone number'
					type='tel'
					placeholder='Enter your phone number'
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					required
				/>
				<div className='space-y-2'>
					<button
						type='button'
						onClick={() => {
							setEmail('demo@idcom.com')
							setPhone('+1 (555) 123-4567')
						}}
						className='w-full text-xs text-text-light/60 hover:text-primary transition-colors p-2 rounded hover:bg-primary/5 text-left'
					>
						📋 Demo (Unverified): demo@idcom.com
					</button>
					<button
						type='button'
						onClick={() => {
							setEmail('verified@idcom.com')
							setPhone('+1 (555) 987-6543')
						}}
						className='w-full text-xs text-text-light/60 hover:text-primary transition-colors p-2 rounded hover:bg-primary/5 text-left'
					>
						✓ Demo (Verified): verified@idcom.com
					</button>
				</div>
			</div>

			<Button className='w-full' type='submit'>
				Continue
			</Button>

			<Divider label='OR' />

			<div className='flex flex-col gap-3'>
				<SocialButton
					icon={
						<img
							src='https://lh3.googleusercontent.com/aida-public/AB6AXuBQ2QRwpHdSKiSBNjtuuD_5R-Dr2hYL94FwVLVqay4XBsyWrAljFb5xE2bJev5o8UJ3AL11lwbSczZozs69RkiPGBXtpS1L6oxPiXAKh19CPPqNU-EdKLa3IMI20R5hWtdIkgHz_30dNXaTz9Bw-UEIfWIBzKfsnIAz7e59grW2sLVAx6_8Jpy0IgBL0svcUsgSo9uuU5_GkY1KtTFAQeeoZqCbhhSWhEh4OwIaCwZpLNNxYWmgM1RmH5cjvwQhTiXPvCA8PJW_ugg'
							alt='Google logo'
							className='h-6 w-6'
						/>
					}
					label='Continue with Google'
				/>
				<SocialButton
					icon={
						<img
							src='https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3CLtxsyoRzhzC_nn1dF39-sFzKX-2GHtKWTZ-2svR35vDmSGNLlYQjgy0XYIibJ-ghjTR970xe7eQQ4W7aqRaXMFNiqnQ2M56ZmmOFyRFi2xZ9iVpMTFwdpEYhfbmcEPAL1ANAKbtKicS_ndzUnDq5K8rGYhGIgEsKfbpjA6L3nabfsI2BTuzoVWML18orr6AclX1Yj1vVT9vLnNOZmSSNOD_7rJ61Z9fnMUcdnC1BkaswlnRAXOMykfkkosLwre_IJ37nc_ioc'
							alt='Apple logo'
							className='h-6 w-6'
						/>
					}
					label='Continue with Apple'
				/>
			</div>

			<div className='flex flex-wrap items-center justify-center gap-x-4 gap-y-2'>
				<Link
					href='#'
					className='text-xs text-text-light/70 hover:text-primary
						transition-colors'
				>
					Terms of Service
				</Link>
				<Link
					href='#'
					className='text-xs text-text-light/70 hover:text-primary
						transition-colors'
				>
					Privacy Policy
				</Link>
			</div>
		</form>
	)
}
