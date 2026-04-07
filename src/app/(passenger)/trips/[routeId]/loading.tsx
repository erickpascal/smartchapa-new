export default function Loading() {
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="bg-[#1A6B3C] h-14 animate-pulse" />
      <div className="px-4 pt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-56 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
