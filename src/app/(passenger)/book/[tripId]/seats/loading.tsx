export default function Loading() {
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="bg-[#1A6B3C] h-14 animate-pulse" />
      <div className="px-4 pt-6">
        <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr 20px 1fr 1fr' }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
