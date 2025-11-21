'use client'

import type { ButtonHTMLAttributes } from 'react'

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: React.ReactNode
	label: string
}

export function SocialButton (props: SocialButtonProps) {
	const { icon, label, className, ...rest } = props

	return (
		<button
			{...rest}
			className={
				'flex w-full items-center justify-center gap-3 ' +
				'rounded-lg border border-border-light ' +
				'bg-background-light text-text-light ' +
				'px-4 py-2.5 text-sm font-semibold ' +
				'transition-colors hover:bg-soft-mint/20 ' +
				(className || '')
			}
		>
			{icon}
			<span>{label}</span>
		</button>
	)
}
