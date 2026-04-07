'use client'
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  message?: string  // default: "A carregar..."
}

export default function LoadingScreen({ message = "A carregar..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Animated Spinner */}
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#1A6B3C] border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      {/* Brand */}
      <div className="text-[#1A6B3C] font-bold text-[20px] mb-2">
        SmartChapa
      </div>
      
      {/* Message */}
      <div className="text-gray-500 text-sm">
        {message}
      </div>
    </div>
  )
}

// Smaller inline variant
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-6 h-6", className)}>
      <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-[#1A6B3C] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}
