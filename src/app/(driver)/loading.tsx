export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto">
      <div className="bg-[#0D4A2B] px-4 pt-12 pb-6">
        <div className="h-4 w-32 bg-white/20 rounded-full mb-2 animate-pulse"/>
        <div className="h-7 w-48 bg-white/20 rounded-full mb-4 animate-pulse"/>
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse"/>)}
        </div>
      </div>
      <div className="px-4 pt-4 space-y-3">
        <div className="h-36 bg-white rounded-xl border border-gray-100 animate-pulse"/>
      </div>
    </div>
  )
}
