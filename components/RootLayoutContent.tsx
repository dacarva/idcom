'use client';

import { useInitFilecoin } from '@/hooks/useInitFilecoin'

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
	useInitFilecoin();
	return (
		<>
			<main role='main'>{children}</main>
		</>
	)
}
