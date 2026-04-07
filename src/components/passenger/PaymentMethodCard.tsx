'use client'
import { cn } from '@/lib/utils'

interface PaymentMethodCardProps {
  provider: 'mpesa' | 'emola' | 'wallet'
  phone?: string         // masked, e.g. "+258 84 *** 4521"
  walletBalance?: number // shown if provider === 'wallet'
  isSelected: boolean
  onSelect: () => void
}

const providerConfig = {
  mpesa: {
    name: 'M-Pesa',
    color: '#E31E24',
    logo: 'M'
  },
  emola: {
    name: 'eMola',
    color: '#FF6B00',
    logo: 'e'
  },
  wallet: {
    name: 'Carteira',
    color: '#1A6B3C',
    logo: '💚'
  }
}

export default function PaymentMethodCard({
  provider,
  phone,
  walletBalance,
  isSelected,
  onSelect
}: PaymentMethodCardProps) {
  const config = providerConfig[provider]

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-all",
        isSelected 
          ? "border-2 border-[#1A6B3C] bg-[#E8F4ED]" 
          : "border border-gray-200 bg-white"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: config.color }}
        >
          {config.logo}
        </div>
        
        {/* Provider info */}
        <div className="flex-1 text-left">
          <div className="font-semibold text-gray-900">
            {config.name}
          </div>
          <div className="text-sm text-gray-500">
            {provider === 'wallet' && walletBalance !== undefined 
              ? `Saldo: ${walletBalance} MT`
              : phone || ''
            }
          </div>
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="text-[#1A6B3C] font-bold text-lg">
            ✓
          </div>
        )}
      </div>
    </button>
  )
}
