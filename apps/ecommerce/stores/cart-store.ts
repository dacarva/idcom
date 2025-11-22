import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
	id: string
	name: string
	price: number
	discountedPrice: number
	image: string
	quantity: number
}

interface CartState {
	items: CartItem[]
	addItem: (product: Omit<CartItem, 'quantity'>) => void
	removeItem: (id: string) => void
	updateQuantity: (id: string, quantity: number) => void
	clear: () => void
	getCount: () => number
	getSubtotal: () => number
}

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],

			addItem: (product) => {
				set((state) => {
					const existing = state.items.find((item) => item.id === product.id)
					if (existing) {
						return {
							items: state.items.map((item) =>
								item.id === product.id
									? { ...item, quantity: item.quantity + 1 }
									: item,
							),
						}
					}
					return {
						items: [...state.items, { ...product, quantity: 1 }],
					}
				})
			},

			removeItem: (id) => {
				set((state) => ({
					items: state.items.filter((item) => item.id !== id),
				}))
			},

			updateQuantity: (id, quantity) => {
				if (quantity <= 0) {
					get().removeItem(id)
					return
				}
				set((state) => ({
					items: state.items.map((item) =>
						item.id === id ? { ...item, quantity } : item,
					),
				}))
			},

			clear: () => {
				set({ items: [] })
			},

			getCount: () => {
				return get().items.reduce((sum, item) => sum + item.quantity, 0)
			},

			getSubtotal: () => {
				return get().items.reduce(
					(sum, item) => sum + item.discountedPrice * item.quantity,
					0,
				)
			},
		}),
		{
			name: 'cart-store',
		},
	),
)
