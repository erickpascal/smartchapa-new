'use client'
import { useState } from 'react'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import type { MapInnerProps } from './ChapaMap'

export default function MapInner({
  apiKey,
  chapaPosition,
  userLocation,
  height,
  eta,
}: MapInnerProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative" style={{ height }}>
        {!isMapLoaded && (
          <div className="absolute inset-0 bg-[#C8E0CC] flex items-center justify-center text-[#0D4A2B] text-[14px] z-10">
            A carregar mapa...
          </div>
        )}
        <Map
          defaultCenter={{ lat: -25.9666, lng: 32.5699 }}
          defaultZoom={14}
          mapTypeId="roadmap"
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI
          gestureHandling="cooperative"
          onTilesLoaded={() => setIsMapLoaded(true)}
        >
          {chapaPosition && (
            <Marker position={chapaPosition} title="Chapa" />
          )}
          {userLocation && (
            <Marker position={userLocation} title="A sua posição" />
          )}
        </Map>
        {chapaPosition && (
          <div className="absolute top-2 left-2 bg-[#F5A623] text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow z-20">
            {eta} min
          </div>
        )}
      </div>
    </APIProvider>
  )
}
