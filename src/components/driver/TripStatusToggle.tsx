'use client'
import { cn } from '@/lib/utils'

interface TripStatusToggleProps {
  currentStatus: 'en_route' | 'at_stop' | 'completed'
  onStatusChange: (status: 'en_route' | 'at_stop' | 'completed') => void
  isLoading?: boolean
}

const statusLabels = {
  en_route: 'Em rota',
  at_stop: 'Na paragem',
  completed: 'Concluída'
}

export default function TripStatusToggle({
  currentStatus,
  onStatusChange,
  isLoading = false
}: TripStatusToggleProps) {
  const statuses: Array<'en_route' | 'at_stop' | 'completed'> = ['en_route', 'at_stop', 'completed']

  return (
    <div className="flex rounded-xl overflow-hidden border border-gray-200">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => !isLoading && onStatusChange(status)}
          disabled={isLoading}
          className={cn(
            "flex-1 py-2.5 text-[13px] font-medium transition-colors",
            "relative overflow-hidden",
            currentStatus === status
              ? "bg-[#1A6B3C] text-white"
              : "bg-white text-gray-500 hover:bg-gray-50",
            isLoading && currentStatus === status && "cursor-wait"
          )}
        >
          {statusLabels[status]}
          {isLoading && currentStatus === status && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1A6B3C]">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
