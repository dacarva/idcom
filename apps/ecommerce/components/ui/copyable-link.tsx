'use client'

const scrollbarStyles = `
  .copyable-link-scroll::-webkit-scrollbar {
    height: 4px;
  }
  .copyable-link-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .copyable-link-scroll::-webkit-scrollbar-thumb {
    background: rgba(77, 155, 77, 0.5);
    border-radius: 2px;
  }
  .copyable-link-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(77, 155, 77, 0.7);
  }
`

interface CopyableLinkProps {
  link: string
  label?: string
  onCopySuccess?: () => void
  onCopyError?: () => void
}

export function CopyableLink({ link, label = 'Link', onCopySuccess, onCopyError }: CopyableLinkProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      onCopySuccess?.()
    } catch (err) {
      console.error('Failed to copy link:', err)
      onCopyError?.()
    }
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="w-full flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-primary/10 border border-primary rounded-lg p-2">
        <div className="copyable-link-scroll flex-1 text-sm sm:text-base text-[#0d1b0d] font-mono overflow-x-auto whitespace-nowrap">
        {link}
      </div>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 px-3 py-1 bg-primary text-[#0d1b0d] text-sm sm:text-base font-bold rounded hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        Copy
      </button>
      </div>
    </>
  )
}
