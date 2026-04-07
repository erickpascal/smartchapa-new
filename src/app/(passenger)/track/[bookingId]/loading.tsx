export default function Loading() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-[#C8E0CC] h-52 animate-pulse" />
      <div className="px-4 pt-4 space-y-3">
        <div className="bg-white rounded-2xl h-20 border border-gray-100 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#E8F4ED] rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
