'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <p className="font-semibold text-gray-900 text-[16px] mb-1">Algo correu mal</p>
      <p className="text-gray-400 text-[13px] mb-6 text-center">
        Não foi possível carregar esta página.
      </p>
      <button
        onClick={reset}
        className="bg-[#1A6B3C] text-white font-semibold px-6 py-3 rounded-xl text-[14px]"
      >
        Tentar novamente
      </button>
    </div>
  )
}
