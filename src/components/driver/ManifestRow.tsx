'use client'
import { cn } from '@/lib/utils'

interface ManifestRowProps {
  passengerName: string
  seatNumber: number
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed'
}

const statusConfig = {
  completed: {
    label: '✅ Pago',
    className: 'bg-[#E8F4ED] text-[#0D4A2B] border border-[#1A6B3C]'
  },
  pending: {
    label: '⚠ Aguarda',
    className: 'bg-[#FFF8E7] text-amber-800 border border-[#F5A623]'
  },
  processing: {
    label: '⚠ Aguarda',
    className: 'bg-[#FFF8E7] text-amber-800 border border-[#F5A623]'
  },
  failed: {
    label: '✕ Falhado',
    className: 'bg-red-50 text-red-800 border border-red-300'
  }
}

export default function ManifestRow({
  passengerName,
  seatNumber,
  paymentStatus
}: ManifestRowProps) {
  const status = statusConfig[paymentStatus]

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50">
      <div className="font-medium text-[14px] text-gray-900">
        {passengerName}
      </div>
      
      <div className="text-gray-400 text-[13px]">
        Assento {seatNumber}
      </div>
      
      <div className={cn(
        "px-2 py-1 rounded-lg text-[12px] font-medium border",
        status.className
      )}>
        {status.label}
      </div>
    </div>
  )
}
