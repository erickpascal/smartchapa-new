'use client'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface RouteCardProps {
  id: string
  name: string
  availableSeats: number
  nextDeparture: string   // e.g. "8 min"
  durationMinutes: number // e.g. 15
  fare: number            // e.g. 15
  category: 'chapa' | 'metro' | 'expresso'
  onClick: () => void
}

const categoryColors = {
  chapa: 'bg-green-100 text-green-800',
  metro: 'bg-blue-100 text-blue-800',
  expresso: 'bg-amber-100 text-amber-800'
}

const categoryLabels = {
  chapa: 'Chapa',
  metro: 'Metro',
  expresso: 'Expresso'
}

export default function RouteCard({ 
  name, 
  availableSeats, 
  nextDeparture, 
  durationMinutes, 
  fare, 
  category, 
  onClick 
}: RouteCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full bg-white border border-gray-100 rounded-xl p-4",
        "active:scale-[0.98] transition-transform cursor-pointer",
        "text-left"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-[15px] mb-1">
            {name}
          </div>
          <div className="text-gray-400 text-[13px] mb-2">
            {durationMinutes} min · {availableSeats} assentos livres
          </div>
          <div className={cn(
            "inline-block px-2 py-1 rounded-full text-xs font-medium",
            categoryColors[category]
          )}>
            {categoryLabels[category]}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          {availableSeats > 0 ? (
            <div className="font-bold text-[#1A6B3C] text-[16px]">
              {fare} MT
            </div>
          ) : (
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              LOTADO
            </div>
          )}
          <div className="text-gray-400 text-[12px] mt-1">
            {nextDeparture}
          </div>
        </div>
      </div>
    </button>
  )
}

export function RouteCardSkeleton() {
  return (
    <div className="w-full bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}
