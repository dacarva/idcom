'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { useUserStore } from '@/stores/user-store'
import { AppHeader } from '@/components/layout/app-header'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { ShippingAddressForm } from '@/components/checkout/shipping-address-form'
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector'
import { OrderSummary } from '@/components/checkout/order-summary'
import { useToastNotification, ToastNotification } from '@/components/ui/toast'
import { CopyableLink } from '@/components/ui/copyable-link'

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
  const { toast, success: showSuccess, error: showError } = useToastNotification()

  useEffect(() => {
    setMounted(true)
    setCartCount(getCount())
    const unsubscribe = useCartStore.subscribe(
      () => setCartCount(getCount()),
    )
    return unsubscribe
  }, [getCount])

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
      handleShowError('Please complete all address fields')
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
      handleShowError('Error generating link')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShowError = (message: string) => {
    showError(message)
  }

  const handleCopySuccess = () => {
    showSuccess('Payment link copied!')
  }

  const handleCopyError = () => {
    showError('Failed to copy link')
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
      handleShowError('Please complete all address fields')
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
      handleShowError('Payment error')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <ToastNotification toast={toast} />
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

                <ShippingAddressForm
                  address={shippingAddress}
                  onAddressChange={handleAddressChange}
                />

                <PaymentMethodSelector
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                />
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-96">
              <div className="sticky top-24 space-y-6">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  shipping={shipping}
                  subsidy={subsidy}
                  total={total}
                  isVerified={isVerified}
                  isProcessing={isProcessing}
                  paymentLinkUI={
                    paymentMethod.type === 'wallet' ? (
                      showPaymentLink && paymentLink ? (
                        <div className="space-y-4">
                          <CopyableLink
                            link={paymentLink}
                            label="Payment link"
                            onCopySuccess={handleCopySuccess}
                            onCopyError={handleCopyError}
                          />
                          <button
                            onClick={() => setShowPaymentLink(false)}
                            className="w-full flex items-center justify-center overflow-hidden rounded-lg h-14 px-4 border-2 border-[#cfe7cf] text-[#4c9a4c] text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/5 transition-colors"
                          >
                            Back
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleGeneratePaymentLink}
                          disabled={isProcessing}
                          className="w-full flex items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-primary text-[#0d1b0d] text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <span className="truncate">
                            {isProcessing ? 'Generating...' : 'Generate Payment Link'}
                          </span>
                        </button>
                      )
                    ) : (
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
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
