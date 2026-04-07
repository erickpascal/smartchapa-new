'use client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">Algo correu mal</h2>
          <p className="text-gray-400 text-[14px] text-center mb-6 max-w-xs">
            Ocorreu um erro inesperado. Por favor tente novamente.
          </p>
          <button
            onClick={reset}
            className="bg-[#1A6B3C] text-white font-semibold px-6 py-3 rounded-xl text-[15px]"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
