import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

export function Hero () {
	return (
		<section className='relative flex flex-1 items-center justify-center p-4'>
			<div className='flex w-full max-w-lg flex-col items-center'>
				<div className='@container w-full'>
					<div className='p-4'>
						<div
							className={cn(
								'flex min-h-[480px] flex-col items-center',
								'justify-center gap-8 rounded-lg bg-cover bg-center',
								'bg-no-repeat text-center',
							)}
							style={{
								backgroundImage:
									"linear-gradient(rgba(247,249,247,0.5) 0%, " +
									"rgba(247,249,247,0.8) 100%), " +
									"url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEKXqN9tXseMCmj9DS-yS4_b6QNNUpmWWJs3yXPfCIaVP0RZNxGIeKUU_c-55L_D_4lmwMP4zRG5wkrHmthzxQrm5Mu-BpbHF-tGQiHrl0f-UZ2mlb9NksOxRi2VuXrF0FSE5DMFudZqqzdORRnhfkA5kMsOSTLDy-ZRBtyCcgOGybnou95lt497Dr4LVrg5tZpmYyODGybb5oqOyxtmUyi3FQMMLwvlysl6HpZi7Ny3qGtLtaJancZY2_7hVvP3VPcfddth6C9IA')",
							}}
							data-alt='Fondo suave con hojas verdes'
						>
							<h1 className='text-4xl font-black tracking-tight @[480px]:text-5xl'>
								Seus essenciais, mais acessíveis.
							</h1>
							<h2 className='text-base font-normal'>
								Compre com subsídio e simplifique seu dia.
							</h2>
							<Link href='/login' className='mt-2' tabIndex={0}>
								<Button aria-label='Entrar' title='Entrar'>
									Entrar
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
