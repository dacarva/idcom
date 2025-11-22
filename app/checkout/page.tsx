'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { useUserStore } from '@/stores/user-store'
import { AppHeader } from '@/components/layout/app-header'
import { Breadcrumb } from '@/components/layout/breadcrumb'

interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
}

interface PaymentMethod {
  type: 'wallet' | 'card'
}

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const getSubtotal = useCartStore((state) => state.getSubtotal)
  const getCount = useCartStore((state) => state.getCount)
  const clear = useCartStore((state) => state.clear)
  const user = useUserStore((state) => state.user)
  const isVerified = user?.hasSubsidy ?? false
  
  const [mounted, setMounted] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: 'John',
    lastName: 'Appleseed',
    address: '123 Greenery Lane',
    city: 'Meadowville',
    postalCode: '12345',
  })

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'wallet',
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [showPaymentLink, setShowPaymentLink] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    setMounted(true)
    setCartCount(getCount())
    const unsubscribe = useCartStore.subscribe(
      () => setCartCount(getCount()),
    )
    return unsubscribe
  }, [])

  if (!mounted) return null

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F9F7]">
        <AppHeader cartCount={cartCount} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
            <Link
              href="/products"
              className="text-primary font-medium hover:underline"
            >
              Volver a productos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const subsidy = isVerified ? subtotal * 0.3 : 0
  const shipping = 5.0
  const total = subtotal - subsidy + shipping

  const handleAddressChange = (
    field: keyof ShippingAddress,
    value: string,
  ) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGeneratePaymentLink = async () => {
    if (
      !shippingAddress.firstName ||
      !shippingAddress.lastName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode
    ) {
      showError('Please complete all address fields')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch(`/api/checkout?amount=${total.toFixed(2)}`)
      if (!response.ok) throw new Error('Failed to generate payment link')
      const data = await response.json()
      setPaymentLink(data.paymentLink || null)
      setShowPaymentLink(true)
      if (!data.paymentLink) throw new Error('No payment link returned')
    } catch (error) {
      console.error('Error generating payment link:', error)
      showError('An error occurred while generating the payment link. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopyToClipboard = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink)
      setToast({ message: 'Payment link copied to clipboard!', type: 'success' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const showError = (message: string) => {
    setToast({ message, type: 'error' })
    setTimeout(() => setToast(null), 3000)
  }

  const handleConfirmPayment = async () => {
    // Validar que los campos requeridos estén completos
    if (
      !shippingAddress.firstName ||
      !shippingAddress.lastName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode
    ) {
      showError('Please complete all address fields')
      return
    }

    setIsProcessing(true)

    try {
      // Guardar orden en localStorage temporalmente
      const order = {
        id: `ORDER-${Date.now()}`,
        items: items,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        subsidy: subsidy,
        shipping: shipping,
        total: total,
        date: new Date().toISOString(),
      }

      localStorage.setItem('lastOrder', JSON.stringify(order))

      // Limpiar carrito
      clear()

      // Generar link de pago llamando a la API local
      const response = await fetch(`/api/checkout?amount=${total.toFixed(2)}`)
      
      if (!response.ok) {
        throw new Error('Failed to generate payment link')
      }
      
      const paymentData = await response.json()
      
      // Redirigir a link de pago
      if (paymentData.paymentLink) {
        window.location.href = paymentData.paymentLink
      } else {
        throw new Error('No payment link returned')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      showError('An error occurred while processing the payment. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div
            className={`rounded-lg px-4 py-3 text-white font-medium shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <AppHeader cartCount={cartCount} />

      <main className="flex-1 w-full">
        <div className="px-4 sm:px-6 lg:px-8 flex-1 w-full max-w-7xl mx-auto py-8 lg:py-12">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            {/* Left Column: Checkout Flow */}
            <div className="flex-1 w-full lg:max-w-2xl">
              <div className="flex flex-col gap-8">
                {/* Breadcrumb */}
                <div className="space-y-4">
                  <Breadcrumb
                    items={[
                      { label: 'Home', href: '/' },
                      { label: 'Products', href: '/products' },
                      { label: 'Shopping Cart', href: '/cart' },
                      { label: 'Checkout' },
                    ]}
                  />
                  <h1 className="text-[#0d1b0d] text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                    Checkout
                  </h1>
                </div>

                {/* Shipping Address Section */}
                <div className="space-y-4">
                  <h2 className="text-[#0d1b0d] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-1 pt-2">
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex flex-col">
                      <p className="text-[#0d1b0d] text-base font-medium leading-normal pb-2">
                        First name
                      </p>
                      <input
                        type="text"
                        value={shippingAddress.firstName}
                        onChange={(e) =>
                          handleAddressChange('firstName', e.target.value)
                        }
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d1b0d] focus:outline-0 focus:ring-0 border border-[#cfe7cf] bg-white focus:border-primary h-14 placeholder:text-[#4c9a4c] p-[15px] text-base font-normal leading-normal"
                        placeholder="John"
                      />
                    </label>
                    <label className="flex flex-col">
                      <p className="text-[#0d1b0d] text-base font-medium leading-normal pb-2">
                        Last name
                      </p>
                      <input
                        type="text"
                        value={shippingAddress.lastName}
                        onChange={(e) =>
                          handleAddressChange('lastName', e.target.value)
                        }
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d1b0d] focus:outline-0 focus:ring-0 border border-[#cfe7cf] bg-white focus:border-primary h-14 placeholder:text-[#4c9a4c] p-[15px] text-base font-normal leading-normal"
                        placeholder="Appleseed"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col">
                    <p className="text-[#0d1b0d] text-base font-medium leading-normal pb-2">
                      Address
                    </p>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) =>
                        handleAddressChange('address', e.target.value)
                      }
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d1b0d] focus:outline-0 focus:ring-0 border border-[#cfe7cf] bg-white focus:border-primary h-14 placeholder:text-[#4c9a4c] p-[15px] text-base font-normal leading-normal"
                      placeholder="123 Greenery Lane"
                    />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex flex-col sm:col-span-2">
                      <p className="text-[#0d1b0d] text-base font-medium leading-normal pb-2">
                        City
                      </p>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          handleAddressChange('city', e.target.value)
                        }
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d1b0d] focus:outline-0 focus:ring-0 border border-[#cfe7cf] bg-white focus:border-primary h-14 placeholder:text-[#4c9a4c] p-[15px] text-base font-normal leading-normal"
                        placeholder="Meadowville"
                      />
                    </label>
                    <label className="flex flex-col">
                      <p className="text-[#0d1b0d] text-base font-medium leading-normal pb-2">
                        Postal Code
                      </p>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          handleAddressChange('postalCode', e.target.value)
                        }
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d1b0d] focus:outline-0 focus:ring-0 border border-[#cfe7cf] bg-white focus:border-primary h-14 placeholder:text-[#4c9a4c] p-[15px] text-base font-normal leading-normal"
                        placeholder="12345"
                      />
                    </label>
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="space-y-4">
                  <h2 className="text-[#0d1b0d] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-1 pt-2">
                    Payment
                  </h2>
                  <p className="text-[#4c9a4c] text-base">
                    All transactions are secure and encrypted.
                  </p>
                  <div className="space-y-3 rounded-xl border border-[#cfe7cf] p-4">
                    <button
                      onClick={() =>
                        setPaymentMethod({ type: 'wallet' })
                      }
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors w-full ${
                        paymentMethod.type === 'wallet'
                          ? 'bg-primary/20 border-primary'
                          : 'bg-white border-[#cfe7cf] hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <svg
                          className="w-6 h-6 text-primary flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-5-9h10v2H7z" />
                        </svg>
                        <div className="text-left">
                          <p className="font-bold text-[#0d1b0d]">Use My Wallet</p>
                          <p className="text-[#4c9a4c] text-sm">
                            Balance: $50.00
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ml-4 ${
                          paymentMethod.type === 'wallet'
                            ? 'bg-primary border-primary'
                            : 'border-[#cfe7cf]'
                        }`}
                      >
                        {paymentMethod.type === 'wallet' && (
                          <svg
                            className="w-4 h-4 text-[#0d1b0d]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        setPaymentMethod({ type: 'card' })
                      }
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors w-full ${
                        paymentMethod.type === 'card'
                          ? 'bg-primary/20 border-primary'
                          : 'bg-white border-[#cfe7cf] hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <svg
                          className={`w-6 h-6 flex-shrink-0 ${
                            paymentMethod.type === 'card'
                              ? 'text-primary'
                              : 'text-[#4c9a4c]'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 8H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-1 11H5v-4h14v4zm0-6H5v-2h14v2z" />
                        </svg>
                        <div className="text-left">
                          <p className="font-medium text-[#0d1b0d]">
                            Credit / Debit Card
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ml-4 ${
                          paymentMethod.type === 'card'
                            ? 'bg-primary border-primary'
                            : 'border-[#cfe7cf]'
                        }`}
                      >
                        {paymentMethod.type === 'card' && (
                          <svg
                            className="w-4 h-4 text-[#0d1b0d]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-96">
              <div className="sticky top-24 space-y-6">
                <div className="border border-[#e7f3e7] rounded-xl p-6 bg-white">
                  <h3 className="text-[#0d1b0d] text-xl font-bold mb-6">
                    Order Summary
                  </h3>
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
                          <p className="font-medium text-[#0d1b0d] truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-[#4c9a4c]">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-[#0d1b0d] flex-shrink-0">
                          ${(item.discountedPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="my-6 border-t border-[#e7f3e7]" />

                  <div className="space-y-3 text-base">
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
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span>-${subsidy.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="my-6 border-t border-[#e7f3e7]" />

                  <div className="flex justify-between items-center text-[#0d1b0d] mb-8">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-black tracking-tighter">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  {showPaymentLink && paymentLink ? (
                    <div className="space-y-4">
                      <div className="bg-primary/10 border border-primary rounded-lg p-4">
                        <p className="text-sm text-[#0d1b0d] font-medium mb-2">Payment Link</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={paymentLink}
                            readOnly
                            className="flex-1 bg-white border border-[#cfe7cf] rounded px-3 py-2 text-sm text-[#0d1b0d]"
                          />
                      <button
                        onClick={handleCopyToClipboard}
                        className="flex items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-[#0d1b0d] text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        Copy Link
                      </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPaymentLink(false)}
                        className="w-full flex items-center justify-center overflow-hidden rounded-lg h-14 px-4 border-2 border-[#cfe7cf] text-[#4c9a4c] text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/5 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleGeneratePaymentLink}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-primary text-[#0d1b0d] text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <span className="truncate">
                          {isProcessing ? 'Generating...' : 'Generate Payment Link'}
                        </span>
                      </button>
                      <button
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-primary text-[#0d1b0d] text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <span className="truncate">
                          {isProcessing
                            ? 'Processing...'
                            : `Confirm & Pay $${total.toFixed(2)}`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
