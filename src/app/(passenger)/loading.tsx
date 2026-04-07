export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="bg-[#0D4A2B] px-4 pt-12 pb-6">
        <div className="h-4 w-32 bg-white/20 rounded-full mb-2 animate-pulse"/>
        <div className="h-7 w-48 bg-white/20 rounded-full mb-4 animate-pulse"/>
        <div className="h-12 bg-white/15 rounded-2xl animate-pulse"/>
      </div>
      <div className="px-4 pt-4 space-y-3">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"/>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"/>
                <div className="h-3 w-56 bg-gray-100 rounded animate-pulse"/>
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse"/>
              </div>
              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
