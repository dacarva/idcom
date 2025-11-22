'use client'

import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'ghost'
	size?: 'md' | 'sm'
}

export function Button (props: PropsWithChildren<ButtonProps>) {
	const {
		className,
		variant = 'primary',
		size = 'md',
		children,
		...rest
	} = props

	const base = 'inline-flex items-center justify-center rounded-full ' +
		'transition-all disabled:opacity-50 disabled:cursor-not-allowed '

	const sizes = size === 'sm'
		? 'h-10 px-4 text-sm font-semibold'
		: 'h-12 px-5 text-base font-bold'

	const variants = variant === 'ghost'
		? 'bg-transparent text-text-light hover:bg-soft-mint/20'
		: 'bg-primary text-text-light hover:opacity-90 active:scale-95'

	return (
		<button
			{...rest}
			className={cn(base, sizes, variants, className)}
		>
			{children}
		</button>
	)
}
