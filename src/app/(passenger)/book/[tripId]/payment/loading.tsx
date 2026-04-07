export default function Loading() {
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="bg-[#1A6B3C] h-14 animate-pulse" />
      <div className="px-4 pt-6 space-y-4">
        <div className="bg-[#E8F4ED] rounded-2xl h-24 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl h-16 border border-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
