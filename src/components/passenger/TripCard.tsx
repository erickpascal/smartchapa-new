'use client'
import { cn } from '@/lib/utils'

interface TripCardProps {
  id: string
  departTime: string    // e.g. "09:52"
  arriveTime: string    // e.g. "10:07"
  driverName: string
  driverRating: number  // 1-5
  plate: string         // e.g. "MZ-10-3421"
  availableSeats: number
  fare: number
  isSelected: boolean
  onSelect: () => void
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={cn(
            "text-[14px]",
            star <= rating ? "text-[#F5A623]" : "text-gray-200"
          )}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function TripCard({
  departTime,
  arriveTime,
  driverName,
  driverRating,
  plate,
  availableSeats,
  fare,
  isSelected,
  onSelect
}: TripCardProps) {
  const isDisabled = availableSeats === 0

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={cn(
        "w-full rounded-xl p-4 transition-all duration-150 text-left",
        isSelected 
          ? "border-2 border-[#1A6B3C] bg-[#E8F4ED]" 
          : "border border-gray-100 bg-white",
        isDisabled && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-bold text-gray-900">
          {departTime} → {arriveTime}
        </div>
        <div className="font-mono text-gray-500 text-sm">
          {plate}
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <div className="text-gray-700 text-sm">
          {driverName}
        </div>
        <StarRating rating={driverRating} />
        <div className={cn(
          "px-2 py-1 rounded text-xs font-medium",
          availableSeats > 0 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        )}>
          {availableSeats > 0 
            ? `${availableSeats} assentos` 
            : "Lotado"
          }
        </div>
      </div>
      
      <div className="flex justify-end">
        <div className="font-bold text-[#1A6B3C] text-[16px]">
          {fare} MT
        </div>
      </div>
    </button>
  )
}
