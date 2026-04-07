'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TopHeaderProps {
  title: string
  showBack?: boolean
  rightElement?: ReactNode
}

export default function TopHeader({ title, showBack, rightElement }: TopHeaderProps) {
  const router = useRouter()

  return (
    <div 
      className={cn(
        "bg-[#1A6B3C] text-white font-semibold text-[18px]",
        "h-14 px-4 flex items-center justify-between",
        "pt-safe"
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 active:scale-[0.95] transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <span>{title}</span>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  )
}
