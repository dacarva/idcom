'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'

interface OrderItem {
  id: string
  name: string
  price: number
  discountedPrice: number
  image: string
  quantity: number
}

interface Order {
  id: string
  items: OrderItem[]
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
  }
  paymentMethod: {
    type: 'wallet' | 'card'
  }
  subtotal: number
  subsidy: number
  shipping: number
  total: number
  date: string
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const lastOrderJson = localStorage.getItem('lastOrder')
    if (!lastOrderJson) {
      router.push('/products')
      return
    }
    try {
      const lastOrder = JSON.parse(lastOrderJson)
      setOrder(lastOrder)
    } catch {
      router.push('/products')
    }
  }, [router])

  if (!mounted || !order) {
    return null
  }

  const orderDate = new Date(order.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <AppHeader cartCount={0} />

      <main className="flex-1 w-full">
        <div className="px-4 sm:px-6 lg:px-8 flex-1 w-full max-w-4xl mx-auto py-12 lg:py-16">
          {/* Success Card */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-[#0d1b0d] text-4xl font-black leading-tight tracking-[-0.033em] mb-3">
              Order Confirmed!
            </h1>
            <p className="text-[#4c9a4c] text-lg mb-2">
              Order Number: <span className="font-bold">{order.id}</span>
            </p>
            <p className="text-[#0d1b0d] text-base">
              We've sent the details to your email
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Items */}
              <div className="bg-white rounded-xl p-6 border border-[#e7f3e7]">
                <h2 className="text-[#0d1b0d] text-xl font-bold mb-6">
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-[#e7f3e7] last:border-b-0"
                    >
                      <div
                        className="w-20 h-20 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                        style={{
                          backgroundImage: `url(${item.image})`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#0d1b0d] truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-[#4c9a4c]">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-[#0d1b0d]">
                          ${item.discountedPrice.toFixed(2)} each
                        </p>
                      </div>
                      <p className="font-bold text-[#0d1b0d] flex-shrink-0">
                        ${(item.discountedPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl p-6 border border-[#e7f3e7]">
                <h2 className="text-[#0d1b0d] text-xl font-bold mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-2 text-[#0d1b0d]">
                  <p className="font-medium">
                    {order.shippingAddress.firstName}{' '}
                    {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl p-6 border border-[#e7f3e7]">
                <h3 className="text-[#0d1b0d] text-lg font-bold mb-4">
                  Summary
                </h3>
                <div className="space-y-3 text-base mb-4">
                  <div className="flex justify-between text-[#0d1b0d]">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                    <div className="flex justify-between text-[#0d1b0d]">
                      <span>Shipping</span>
                      <span>${order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Subsidy (30%)</span>
                      <span>-${order.subsidy.toFixed(2)}</span>
                    </div>
                </div>
                <div className="border-t border-[#e7f3e7] pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0d1b0d]">Total</span>
                    <span className="text-2xl font-black text-primary">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 border border-[#e7f3e7]">
                <h3 className="text-[#0d1b0d] text-lg font-bold mb-4">
                  Payment Method
                </h3>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-primary flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {order.paymentMethod.type === 'wallet' ? (
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-5-9h10v2H7z" />
                    ) : (
                      <path d="M20 8H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-1 11H5v-4h14v4zm0-6H5v-2h14v2z" />
                    )}
                  </svg>
                  <span className="text-[#0d1b0d] font-medium">
                    {order.paymentMethod.type === 'wallet'
                      ? 'Wallet'
                      : 'Credit / Debit Card'}
                  </span>
                </div>
              </div>

              {/* Order Date */}
              <div className="bg-white rounded-xl p-6 border border-[#e7f3e7]">
                <h3 className="text-[#0d1b0d] text-lg font-bold mb-2">
                  Order Date
                </h3>
                <p className="text-[#0d1b0d]">{orderDate}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="flex items-center justify-center overflow-hidden rounded-lg h-14 px-8 bg-primary text-[#0d1b0d] text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => {
                const orderData = JSON.stringify(order, null, 2)
                const element = document.createElement('a')
                element.setAttribute(
                  'href',
                  'data:text/plain;charset=utf-8,' +
                    encodeURIComponent(orderData),
                )
                element.setAttribute('download', `${order.id}.txt`)
                element.style.display = 'none'
                document.body.appendChild(element)
                element.click()
                document.body.removeChild(element)
              }}
              className="flex items-center justify-center overflow-hidden rounded-lg h-14 px-8 border-2 border-primary text-primary text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/5 transition-colors"
            >
              Download Receipt
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
