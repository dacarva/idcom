'use client'

import { FiInfo } from 'react-icons/fi'

interface CartItem {
  id: string
  name: string
  price: number
  discountedPrice: number
  image: string
  quantity: number
}

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  shipping: number
  subsidy: number
  total: number
  isVerified: boolean
  isProcessing: boolean
  paymentLinkUI: React.ReactNode
}

export function OrderSummary({
  items,
  subtotal,
  shipping,
  subsidy,
  total,
  isVerified,
  isProcessing,
  paymentLinkUI,
}: OrderSummaryProps) {
  return (
    <div className="border border-[#e7f3e7] rounded-xl p-6 bg-white">
      <h3 className="text-[#0d1b0d] text-xl font-bold mb-6">Order Summary</h3>
      
      {/* Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <div
              className="w-16 h-16 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
              style={{
                backgroundImage: `url(${item.image})`,
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#0d1b0d] truncate">{item.name}</p>
              <p className="text-sm text-[#4c9a4c]">Quantity: {item.quantity}</p>
            </div>
            <p className="font-medium text-[#0d1b0d] flex-shrink-0">
              ${(item.discountedPrice * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="my-6 border-t border-[#e7f3e7]" />

      {/* Pricing */}
      <div className="space-y-3 text-base mb-6">
        <div className="flex justify-between text-[#0d1b0d]">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[#0d1b0d]">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        {isVerified && (
          <div className="flex justify-between text-green-600">
            <div className="flex items-center gap-1">
              <span>Your 30% Subsidy Saving</span>
              <FiInfo className="w-4 h-4" />
            </div>
            <span>-${subsidy.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-[#e7f3e7] pt-4 mb-8">
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#0d1b0d]">Total</span>
          <span className="text-2xl font-black text-primary">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment UI */}
      {paymentLinkUI}
    </div>
  )
}
