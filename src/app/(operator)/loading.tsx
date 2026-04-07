export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0D4A2B] h-16 animate-pulse" />
      <div className="p-6 grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
