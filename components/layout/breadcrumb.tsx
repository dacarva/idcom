import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              href={item.href}
              className="text-[#4c9a4c] hover:text-[#3a7a3a] text-base font-medium leading-normal"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#0d1b0d] text-base font-medium leading-normal">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <span className="text-[#4c9a4c] text-base font-medium leading-normal">
              /
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
