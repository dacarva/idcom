import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./app/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				primary: '#A8D8B9',
				accent: '#F9DCC4',
				'soft-mint': '#A8D8B9',
				'background-light': '#F7F9F7',
				'background-dark': '#3D4A4D',
				'text-light': '#3D4A4D',
				'text-dark': '#F7F9F7',
				'border-light': '#cfe7cf',
				'border-dark': '#365936',
			},
			fontFamily: {
				display: ['var(--font-plus-jakarta)'],
			},
			borderRadius: {
				DEFAULT: '0.25rem',
				lg: '0.5rem',
				xl: '0.75rem',
				full: '9999px',
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
}

export default config
