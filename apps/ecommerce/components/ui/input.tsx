'use client'

import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	function Input (props, ref) {
		const { label, className, ...rest } = props

		return (
			<label className='flex flex-col gap-2'>
				{label && (
					<span className='text-sm font-medium text-text-light'>
						{label}
					</span>
				)}
				<input
					ref={ref}
					className={
						'w-full rounded-lg border border-border-light ' +
						'bg-background-light text-text-light ' +
						'placeholder:text-text-light/50 ' +
						'h-12 px-4 py-3 text-base font-normal ' +
						'focus:outline-none focus:ring-2 focus:ring-primary ' +
						'focus:ring-offset-2 focus:ring-offset-background-light ' +
						'transition-all ' +
						(className || '')
					}
					{...rest}
				/>
			</label>
		)
	},
)
