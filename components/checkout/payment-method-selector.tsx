interface PaymentMethod {
  type: 'wallet' | 'card'
}

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethod) => void
}

export function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-[#0d1b0d] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-1 pt-2">
        Payment
      </h2>
      <p className="text-[#4c9a4c] text-base">
        All transactions are secure and encrypted.
      </p>
      <div className="space-y-3 rounded-xl border border-[#cfe7cf] p-4">
        {/* Wallet Option */}
        <button
          onClick={() => onPaymentMethodChange({ type: 'wallet' })}
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
              <p className="text-[#4c9a4c] text-sm">Balance: $50.00</p>
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

        {/* Card Option */}
        <button
          onClick={() => onPaymentMethodChange({ type: 'card' })}
          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors w-full ${
            paymentMethod.type === 'card'
              ? 'bg-primary/20 border-primary'
              : 'bg-white border-[#cfe7cf] hover:border-primary'
          }`}
        >
          <div className="flex items-center gap-4 flex-1">
            <svg
              className={`w-6 h-6 flex-shrink-0 ${
                paymentMethod.type === 'card' ? 'text-primary' : 'text-[#4c9a4c]'
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 8H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-1 11H5v-4h14v4zm0-6H5v-2h14v2z" />
            </svg>
            <div className="text-left">
              <p className="font-medium text-[#0d1b0d]">Credit / Debit Card</p>
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
  )
}
