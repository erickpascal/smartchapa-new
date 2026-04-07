'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

interface ChapaMapProps {
  tripId: string
  routePolyline?: { lat: number; lng: number }[]
  userLocation?: { lat: number; lng: number }
  height?: string
  eta?: string
}

interface Position { lat: number; lng: number }

// ─── Firebase listener (only runs client-side) ────────────────────────────────

async function listenToTripLocation(
  tripId: string,
  onUpdate: (pos: Position) => void
): Promise<() => void> {
  const { realtimeDb } = await import('@/lib/firebase')
  if (!realtimeDb) return () => {}
  const { ref, onValue, off } = await import('firebase/database')
  const locationRef = ref(realtimeDb, `trips/${tripId}/location`)
  onValue(locationRef, (snapshot) => {
    const data = snapshot.val()
    if (data?.lat && data?.lng) onUpdate({ lat: data.lat, lng: data.lng })
  })
  return () => off(locationRef)
}

// ─── Google Maps inner component (no SSR) ─────────────────────────────────────

interface MapInnerProps {
  apiKey: string
  chapaPosition: Position | null
  userLocation?: Position
  height: string
  eta: string
}

// Loaded only on the client — avoids any server/client HTML mismatch
const MapInner = dynamic(
  () => import('./MapInner'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: '220px' }}
        className="bg-[#C8E0CC] flex items-center justify-center text-[#0D4A2B] text-[14px]"
      >
        A carregar mapa...
      </div>
    ),
  }
)

// ─── Fallback map (no API key) ────────────────────────────────────────────────

function MapFallback({ height, eta, chapaPosition, userLocation }: {
  height: string
  eta: string
  chapaPosition: Position | null
  userLocation?: Position
}) {
  return (
    <div
      className="bg-[#C8E0CC] flex flex-col items-center justify-center gap-2 text-[#0D4A2B]"
      style={{ height }}
    >
      <span className="text-3xl">🗺️</span>
      <p className="text-[14px] font-semibold">Mapa — Maputo, Moçambique</p>
      {chapaPosition ? (
        <p className="text-[12px] text-[#1A6B3C] font-mono">
          Chapa: {chapaPosition.lat.toFixed(4)}, {chapaPosition.lng.toFixed(4)}
        </p>
      ) : (
        <p className="text-[12px] text-[#1A6B3C]">A aguardar localização do chapa...</p>
      )}
      {userLocation && (
        <p className="text-[12px] text-gray-500 font-mono">
          Você: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
        </p>
      )}
      <p className="text-[11px] text-gray-500 mt-1">ETA: {eta} min</p>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ChapaMap({
  tripId,
  userLocation,
  height = '220px',
  eta = '...',
}: ChapaMapProps) {
  const [chapaPosition, setChapaPosition] = useState<Position | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let cleanup: (() => void) | undefined
    listenToTripLocation(tripId, setChapaPosition).then((fn) => { cleanup = fn })
    return () => { cleanup?.() }
  }, [tripId])

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const hasMapsKey = mapsKey && mapsKey !== 'placeholder'

  // Always render the fallback on the server; swap to real map only after mount
  if (!mounted || !hasMapsKey) {
    return (
      <MapFallback
        height={height}
        eta={eta}
        chapaPosition={chapaPosition}
        userLocation={userLocation}
      />
    )
  }

  return (
    <MapInner
      apiKey={mapsKey}
      chapaPosition={chapaPosition}
      userLocation={userLocation}
      height={height}
      eta={eta}
    />
  )
}

export type { MapInnerProps }
