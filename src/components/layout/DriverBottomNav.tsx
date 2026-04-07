'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, DollarSign, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabProps {
  icon: React.ReactNode
  label: string
  path: string
  isActive: boolean
  onClick: () => void
}

function Tab({ icon, label, isActive, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 flex-1 h-full",
        "transition-colors duration-150",
        isActive ? "text-[#1A6B3C]" : "text-gray-400"
      )}
    >
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  )
}

export default function DriverBottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { icon: <Home className="w-5 h-5" />, label: "Início", path: "/driver" },
    { icon: <Users className="w-5 h-5" />, label: "Manifesto", path: "/driver/manifest" },
    { icon: <DollarSign className="w-5 h-5" />, label: "Ganhos",    path: "/driver/earnings" },
    { icon: <User className="w-5 h-5" />,    label: "Perfil",     path: "/driver/profile" },
  ]

  const isTabActive = (path: string) => {
    if (path === "/driver") return pathname === "/driver"
    return pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-16 z-50">
      <div className="flex items-center h-full">
        {tabs.map((tab) => (
          <Tab
            key={tab.path}
            icon={tab.icon}
            label={tab.label}
            path={tab.path}
            isActive={isTabActive(tab.path)}
            onClick={() => router.push(tab.path)}
          />
        ))}
      </div>
    </div>
  )
}
