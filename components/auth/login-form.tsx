'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { SocialButton } from '@/components/auth/social-button'
import { SubsidyModal } from '@/components/feedback/subsidy-modal'
import Link from 'next/link'

export function LoginForm () {
	const [showSubsidy, setShowSubsidy] = useState(false)

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setShowSubsidy(true)
	}

	return (
		<form onSubmit={handleSubmit} className='flex w-full flex-col gap-6'>
			<div className='flex flex-col gap-4'>
				<Input
					label='Email address'
					type='email'
					placeholder='Enter your email'
					required
				/>
				<Input
					label='Phone number'
					type='tel'
					placeholder='Enter your phone number'
					required
				/>
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

			<SubsidyModal
				isOpen={showSubsidy}
				onClose={() => setShowSubsidy(false)}
			/>
		</form>
	)
}
