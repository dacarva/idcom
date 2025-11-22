interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
}

interface ShippingAddressFormProps {
  address: ShippingAddress
  onAddressChange: (field: keyof ShippingAddress, value: string) => void
}

export function ShippingAddressForm({
  address,
  onAddressChange,
}: ShippingAddressFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-[#0d1b0d] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-1 pt-2">
        Shipping Address
      </h2>
      
      {/* First and Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <p className="text-[#0d1b0d] text-base font-medium leading-normal pb-2">
            First name
          </p>
          <input
            type="text"
            value={address.firstName}
            onChange={(e) => onAddressChange('firstName', e.target.value)}
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
            value={address.lastName}
            onChange={(e) => onAddressChange('lastName', e.target.value)}
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d1b0d] focus:outline-0 focus:ring-0 border border-[#cfe7cf] bg-white focus:border-primary h-14 placeholder:text-[#4c9a4c] p-[15px] text-base font-normal leading-normal"
            placeholder="Appleseed"
          />
        </label>
      </div>

      {/* Address */}
      <label className="flex flex-col">
        <p className="text-[#0d1b0d] text-base font-medium leading-normal pb-2">
          Address
        </p>
        <input
          type="text"
          value={address.address}
          onChange={(e) => onAddressChange('address', e.target.value)}
          className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d1b0d] focus:outline-0 focus:ring-0 border border-[#cfe7cf] bg-white focus:border-primary h-14 placeholder:text-[#4c9a4c] p-[15px] text-base font-normal leading-normal"
          placeholder="123 Greenery Lane"
        />
      </label>

      {/* City and Postal Code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="flex flex-col sm:col-span-2">
          <p className="text-[#0d1b0d] text-base font-medium leading-normal pb-2">
            City
          </p>
          <input
            type="text"
            value={address.city}
            onChange={(e) => onAddressChange('city', e.target.value)}
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
            value={address.postalCode}
            onChange={(e) => onAddressChange('postalCode', e.target.value)}
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d1b0d] focus:outline-0 focus:ring-0 border border-[#cfe7cf] bg-white focus:border-primary h-14 placeholder:text-[#4c9a4c] p-[15px] text-base font-normal leading-normal"
            placeholder="12345"
          />
        </label>
      </div>
    </div>
  )
}
