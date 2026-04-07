'use client'

interface EmptyStateProps {
  icon?: string          // emoji, e.g. "🚌"
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon = "📋",
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Icon */}
      <div className="text-4xl mb-3">
        {icon}
      </div>
      
      {/* Title */}
      <div className="font-semibold text-gray-700 text-[16px] text-center mb-1">
        {title}
      </div>
      
      {/* Description */}
      {description && (
        <div className="text-gray-400 text-[13px] text-center max-w-[240px] mb-4">
          {description}
        </div>
      )}
      
      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[#1A6B3C] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0D4A2B] transition-all duration-150 min-h-[48px]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
