'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { CopyableLink } from '@/components/ui/copyable-link'
import { useToastNotification, ToastNotification } from '@/components/ui/toast'
import QRCode from 'qrcode.react'
import { FiCheck, FiClock, FiExternalLink } from 'react-icons/fi'

interface OrderItem {
  id?: string
  name?: string
  title?: string
  price?: number
  discountedPrice?: number
  image?: string
  quantity?: number
}

interface Order {
  id?: string
  orderId?: string
  items?: OrderItem[]
  shippingAddress?: {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
  }
  paymentMethod?: {
    type: 'wallet' | 'card'
  }
  subtotal?: number
  subsidy?: number
  shipping?: number
  total?: number
  date?: string
  cid?: string
  status?: string
  encryptionSalt?: string
  walletAddress?: string
  walletSignature?: string
  timestamp?: string
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast, success: showSuccess } = useToastNotification()

  useEffect(() => {
    setMounted(true)
    
    // Leer desde query params primero (prioridad)
    const paramOrderId = searchParams.get('orderId')
    const paramCid = searchParams.get('cid')
    const paramStatus = searchParams.get('status')
    const paramSalt = searchParams.get('encryptionSalt')
    
    // Luego leer desde localStorage
    const lastOrderJson = localStorage.getItem('lastOrder')
    
    if (!lastOrderJson && !paramOrderId) {
      router.push('/products')
      return
    }
    
    try {
      let lastOrder: Order = {}
      if (lastOrderJson) {
        lastOrder = JSON.parse(lastOrderJson)
      }
      
      // Merge query params (sobrescriben localStorage si existen)
      if (paramOrderId) lastOrder.orderId = paramOrderId
      if (paramCid) lastOrder.cid = paramCid
      if (paramStatus) lastOrder.status = paramStatus
      if (paramSalt) lastOrder.encryptionSalt = paramSalt
      
      setOrder(lastOrder)
    } catch {
      router.push('/products')
    }
  }, [router, searchParams])

  // Poll for CID updates from backend every 5 seconds (while pending)
  useEffect(() => {
    if (!mounted || !order?.orderId || order.cid) return // Stop if has CID

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/by-id?orderId=${order.orderId}`)
        if (!response.ok) return

        const data = await response.json()
        if (data.order?.cid && !order.cid) {
          // CID just became available!
          setOrder((prev) => ({
            ...prev,
            cid: data.order.cid,
            status: 'confirmed',
          }))
          console.log('✅ Order CID received:', data.order.cid)
        }
      } catch (error) {
        // Silently ignore polling errors
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(pollInterval)
  }, [mounted, order?.orderId, order?.cid])

  if (!mounted || !order) {
    return null
  }

  const orderDate = order.date 
    ? new Date(order.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date(order.timestamp || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

  const orderId = order.id || order.orderId || 'N/A'
  const isCidReady = !!order.cid
  const verifyUrl = order.cid ? `${typeof window !== 'undefined' ? window.location.origin : ''}/verify-order/${order.cid}` : null

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <ToastNotification toast={toast} />
      <AppHeader cartCount={0} />

      <main className="flex-1 w-full">
        <div className="px-4 sm:px-6 lg:px-8 flex-1 w-full max-w-4xl mx-auto py-12 lg:py-16">
          {/* Success Card */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20">
                <FiCheck className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-[#0d1b0d] text-4xl font-black leading-tight tracking-[-0.033em] mb-3">
              Order Confirmed!
            </h1>
            <p className="text-[#4c9a4c] text-lg mb-2">
              Order Number: <span className="font-bold">{orderId}</span>
            </p>
            <p className="text-[#0d1b0d] text-base">
              We've sent the details to your email
            </p>
          </div>

          {/* Filecoin Archive Status - Styled like Order Summary */}
          <div className="mb-12 bg-white rounded-xl p-8 border border-[#e7f3e7]">
            <div className="flex items-start gap-4 mb-6">
              {isCidReady ? (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 flex-shrink-0">
                  <FiCheck className="w-6 h-6 text-primary" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 flex-shrink-0">
                  <FiClock className="w-6 h-6 text-yellow-600 animate-spin" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-[#0d1b0d] text-xl font-bold mb-1">
                  {isCidReady ? 'Archived to Filecoin' : '⏳ Archiving to Filecoin...'}
                </h2>
                <p className="text-[#4c9a4c] text-sm">
                  {isCidReady
                    ? 'Your order is permanently stored on the Filecoin network'
                    : 'Your order is being encrypted and uploaded'}
                </p>
              </div>
            </div>
            
            {/* QR Code Section - Only show when ready */}
            {isCidReady && order.cid && (
              <div className="space-y-4 border-t border-[#e7f3e7] pt-6">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg border border-[#e7f3e7]">
                    <QRCode
                      value={verifyUrl || ''}
                      size={200}
                      level="H"
                      includeMargin={true}
                      fgColor="#0D1B0D"
                      bgColor="#FFFFFF"
                    />
                  </div>
                </div>

                {/* CID Display */}
                <div>
                  <p className="text-[#0d1b0d] text-xs font-semibold mb-2">Content ID (CID)</p>
                  <CopyableLink
                    link={order.cid}
                    label="Copy CID"
                    onCopySuccess={() => showSuccess('CID copied to clipboard!')}
                  />
                </div>

                {/* Verification Link */}
                {verifyUrl && (
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-primary hover:opacity-90 text-[#0d1b0d] font-bold py-3 px-4 rounded-lg text-center transition"
                  >
                    View Verification Page →
                  </a>
                )}
              </div>
            )}

            {/* Loading state */}
            {!isCidReady && (
              <p className="text-[#4c9a4c] text-sm text-center mt-4">
                The QR code will appear in a few moments...
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Items */}
              {order.items && order.items.length > 0 && (
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
              )}

              {/* Shipping Address */}
              {order.shippingAddress && (
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
              )}
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
                    {order.subsidy > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Subsidy (30%)</span>
                        <span>-${order.subsidy.toFixed(2)}</span>
                      </div>
                    )}
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
              {order.paymentMethod && (
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
              )}

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
