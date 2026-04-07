'use client'
import { cn } from '@/lib/utils'

interface StatCardProps {
  value: string | number
  label: string
  variant?: 'default' | 'accent' | 'info'
  className?: string
}

const variantStyles = {
  default: 'bg-[#E8F4ED] text-[#1A6B3C]',
  accent: 'bg-[#FFF8E7] text-[#F5A623]',
  info: 'bg-blue-50 text-blue-600'
}

export default function StatCard({
  value,
  label,
  variant = 'default',
  className
}: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl p-4 text-center transition-all duration-150",
      variantStyles[variant],
      className
    )}>
      <div className="text-[22px] font-semibold">
        {value}
      </div>
      <div className="text-[11px] text-gray-500 mt-1">
        {label}
      </div>
    </div>
  )
}
