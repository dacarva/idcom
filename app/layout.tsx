import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
	subsets: ['latin'],
	weight: ['400', '700', '800'],
	variable: '--font-plus-jakarta',
	display: 'swap',
})

export const metadata: Metadata = {
	title: 'idcom - Essential Products',
	description: 'Shop essential products with exclusive discounts',
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
}

export default function RootLayout (
	{ children }: { children: React.ReactNode },
) {
	return (
		<html lang='es' className='light'>
			<body className={`${plusJakarta.className} bg-background-light`}>
				<main role='main'>{children}</main>
			</body>
		</html>
	)
}
