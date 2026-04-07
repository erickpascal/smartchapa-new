'use client'
import { useRef, useState, useCallback } from 'react'
import { Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

type SOSState = 'idle' | 'holding' | 'activated'

export default function SOSButton() {
  const [sosState, setSosState] = useState<SOSState>('idle')
  const [countdown, setCountdown] = useState(3)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  
  const holdTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const countdownTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  const handlePressStart = useCallback(() => {
    setCountdown(3)
    setSosState('holding')
    
    // Tick countdown every second
    let count = 3
    countdownTimer.current = setInterval(() => {
      count -= 1
      setCountdown(count)
    }, 1000)
    
    // Activate after 3s
    holdTimer.current = setTimeout(() => {
      clearInterval(countdownTimer.current)
      activate()
    }, 3000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePressEnd = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
    }
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current)
    }
    setCountdown(3)
    setSosState('idle')
  }, [])

  const activate = useCallback(async () => {
    // Get current location
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        setUserLocation(location)
        
        // Send SOS alert
        try {
          await fetch('/api/alerts/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(location),
          })
        } catch (error) {
          console.error('Failed to send SOS:', error)
        }
        
        setSosState('activated')
      },
      (error) => {
        console.error('Failed to get location:', error)
        // Still activate even without location
        setSosState('activated')
      }
    )
  }, [])

  const dismiss = useCallback(() => {
    setSosState('idle')
    setCountdown(3)
    setUserLocation(null)
  }, [])

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className={cn(
          "fixed bottom-20 right-4 z-40 shadow-lg rounded-full w-14 h-14",
          "font-bold text-white transition-all duration-150",
          sosState === 'idle' && "bg-[#D32F2F] hover:bg-red-700",
          sosState === 'holding' && "bg-red-600 animate-pulse"
        )}
        disabled={sosState === 'activated'}
      >
        {sosState === 'holding' ? (
          <span className="text-sm">{countdown}</span>
        ) : (
          'SOS'
        )}
      </button>

      {/* Activated Overlay */}
      {sosState === 'activated' && (
        <div className="fixed inset-0 bg-[#D32F2F] z-50 flex items-center justify-center p-6">
          <div className="text-center text-white space-y-6 max-w-sm">
            <div className="text-2xl font-bold">⚠️ EMERGÊNCIA ENVIADA</div>
            
            {userLocation && (
              <div className="text-sm opacity-90">
                Localização: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </div>
            )}
            
            <div className="space-y-3">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="font-semibold mb-2">Contactos de Emergência:</div>
                <div className="space-y-2 text-sm">
                  <a 
                    href="tel:119" 
                    className="flex items-center justify-center gap-2 hover:bg-white/10 rounded p-2 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Ligar 119 — Polícia
                  </a>
                </div>
              </div>
            </div>
            
            <button
              onClick={dismiss}
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancelar / Fechar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  )
}
