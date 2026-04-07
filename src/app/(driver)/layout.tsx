import DriverBottomNav from '@/components/layout/DriverBottomNav'

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto">
      <main className="flex-1 pb-16">{children}</main>
      <DriverBottomNav />
    </div>
  )
}
