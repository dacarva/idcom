'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import QRCode from 'qrcode.react'
import { FiCheck, FiDownload, FiShare2, FiExternalLink } from 'react-icons/fi'

interface OrderData {
  orderId?: string
  items?: any[]
  total?: number
  timestamp?: string
  shippingAddress?: {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
  }
}

export default function OrderReceiptPage() {
  const params = useParams()
  const cid = params?.cid as string
  const [order, setOrder] = useState<OrderData | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get order from localStorage
    const lastOrder = localStorage.getItem('lastOrder')
    if (lastOrder) {
      try {
        setOrder(JSON.parse(lastOrder))
      } catch (e) {
        console.error('Failed to parse order:', e)
      }
    }
  }, [])

  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify-order/${cid}`
  const qrRef = useRef<HTMLDivElement>(null)

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement
    if (canvas) {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `order-${order?.orderId || cid}-qr.png`
      link.click()
    }
  }

  const shareOnTwitter = () => {
    const text = `✅ My order #${order?.orderId} is permanently archived on Filecoin! Verify it here: ${verifyUrl}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <FiCheck className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Your order has been placed and permanently archived on Filecoin</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="space-y-6">
            {/* Order ID */}
            {order?.orderId && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-xl font-bold text-gray-900">{order.orderId}</p>
              </div>
            )}

            {/* QR Code Section */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 mb-4">Filecoin Archive QR Code</p>
              <div className="flex flex-col items-center gap-4">
                <div
                  ref={qrRef}
                  className="bg-white p-4 border-2 border-green-200 rounded-lg"
                >
                  <QRCode
                    value={verifyUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">CID (Content ID)</p>
                  <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 p-3 rounded">
                    {cid}
                  </p>
                </div>
              </div>
            </div>

            {/* Permanently Stored Badge */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-200">
                    <FiCheck className="h-4 w-4 text-green-700" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Permanently Stored</h3>
                  <p className="text-sm text-green-700 mt-1">
                    This order is immutably archived on the Filecoin network and can be verified anytime using the QR code above.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            {order && (
              <>
                {order.items && order.items.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-600 mb-4">Items ({order.items.length})</p>
                    <div className="space-y-3">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{item.name || item.title}</span>
                          <span className="text-gray-900 font-medium">
                            ${(item.discountedPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.total && (
                  <div className="border-t border-gray-200 pt-6 pb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {order.shippingAddress && (
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-600 mb-3">Shipping Address</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={downloadQR}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            <FiDownload className="w-4 h-4" />
            <span className="text-sm">Download QR</span>
          </button>
          <button
            onClick={shareOnTwitter}
            className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            <FiShare2 className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </button>
        </div>

        {/* Verify Button */}
        <a
          href={`/verify-order/${cid}`}
          className="block w-full bg-white border-2 border-green-500 text-green-600 font-medium py-3 px-4 rounded-lg text-center hover:bg-green-50 transition flex items-center justify-center gap-2"
        >
          <FiExternalLink className="w-4 h-4" />
          View Filecoin Verification Page
        </a>

        {/* Info Footer */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">🔗 What happens next?</span>
            <br />
            Your order is now permanently stored on the Filecoin network. You can verify it anytime by scanning the QR code or visiting the verification page.
          </p>
        </div>
      </div>
    </div>
  )
}
