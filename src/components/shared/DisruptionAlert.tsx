'use client'
import { cn } from '@/lib/utils'
import { X, Map } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface DisruptionAlertProps {
  routeName: string
  reason: string               // e.g. "Greve de motoristas"
  estimatedResume?: string     // e.g. "10:00"
  alternatives?: {
    name: string
    duration: string
    fare: number
    isOperational: boolean
  }[]
  onDismiss: () => void
  onNotifyMe: () => void
}

export default function DisruptionAlert({
  routeName,
  reason,
  estimatedResume,
  alternatives = [],
  onDismiss,
  onNotifyMe
}: DisruptionAlertProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)

  // Check if this alert was dismissed
  useEffect(() => {
    const dismissed = sessionStorage.getItem(`disruption_${routeName}`)
    if (dismissed === 'true') {
      setIsExpanded(false)
    }
  }, [routeName])

  const handleDismiss = () => {
    sessionStorage.setItem(`disruption_${routeName}`, 'true')
    setIsExpanded(false)
    onDismiss()
  }

  const handleViewMap = () => {
    router.push('/map')
  }

  if (!isExpanded) {
    return null
  }

  return (
    <div className="space-y-0">
      {/* Amber Banner */}
      <div className="bg-[#F5A623] px-4 py-3 flex items-center justify-between">
        <div className="text-[#4A2800] font-bold text-[14px]">
          ⚠️ ALERTA — {routeName}
        </div>
        <button
          onClick={handleDismiss}
          className="text-[#4A2800] hover:bg-amber-600 p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded Card */}
      <div className="bg-white border-l-4 border-[#F5A623] shadow-sm">
        <div className="p-4 space-y-4">
          {/* Reason and Resume Time */}
          <div>
            <div className="text-gray-900 font-medium mb-1">
              {reason}
            </div>
            {estimatedResume && (
              <div className="text-sm text-gray-500">
                Previsão de retomada: {estimatedResume}
              </div>
            )}
          </div>

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Alternativas disponíveis
              </div>
              <div className="space-y-2">
                {alternatives.map((alt, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg border",
                      index === 0 && "border-l-4 border-l-[#1A6B3C]",
                      alt.isOperational 
                        ? "bg-white border-gray-200" 
                        : "bg-gray-50 border-gray-200 opacity-60"
                    )}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {alt.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {alt.duration}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#1A6B3C]">
                        {alt.fare} MT
                      </div>
                      <div className={cn(
                        "text-xs px-2 py-0.5 rounded inline-block mt-1",
                        alt.isOperational 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {alt.isOperational ? 'Operacional' : 'Indisponível'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleViewMap}
              className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <Map className="w-4 h-4" />
              Ver no mapa
            </button>
            <button
              onClick={onNotifyMe}
              className="flex-1 bg-[#F5A623] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-amber-600 transition-all duration-150 flex items-center justify-center gap-2"
            >
              🔔 Notificar-me
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
