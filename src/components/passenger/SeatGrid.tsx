'use client'
import { cn } from '@/lib/utils'

interface SeatGridProps {
  totalSeats?: number        // default 14
  takenSeats: number[]      // e.g. [1, 2, 5, 8, 11, 13]
  selectedSeat: number | null
  onSeatSelect: (seat: number) => void
}

export default function SeatGrid({ 
  totalSeats = 14, 
  takenSeats, 
  selectedSeat, 
  onSeatSelect 
}: SeatGridProps) {
  const isSeatTaken = (seat: number) => takenSeats.includes(seat)
  const isSeatSelected = (seat: number) => selectedSeat === seat

  const getSeatStyles = (seat: number) => {
    if (isSeatTaken(seat)) {
      return "border border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed"
    }
    if (isSeatSelected(seat)) {
      return "border-2 border-[#F5A623] bg-[#FFF8E7] text-[#F5A623]"
    }
    return "border-2 border-[#1A6B3C] bg-white text-[#1A6B3C] hover:bg-[#E8F4ED] cursor-pointer"
  }

  const renderSeat = (seat: number) => {
    if (seat === 1) {
      // Driver seat - always taken
      return (
        <div 
          key={seat}
          className="col-span-5 border border-gray-200 bg-gray-100 text-gray-300 rounded-lg p-2 flex items-center justify-center text-[13px] font-semibold cursor-not-allowed"
        >
          Capitão
        </div>
      )
    }

    return (
      <button
        key={seat}
        onClick={() => !isSeatTaken(seat) && onSeatSelect(seat)}
        disabled={isSeatTaken(seat)}
        className={cn(
          "w-full aspect-square rounded-lg flex items-center justify-center text-[13px] font-semibold transition-colors",
          getSeatStyles(seat)
        )}
      >
        {isSeatSelected(seat) ? "✓" : seat}
      </button>
    )
  }

  // Generate seat positions for the grid
  const generateSeatPositions = () => {
    const positions: (number | null)[] = []
    let seatNumber = 2 // Start from 2 since 1 is driver seat
    
    // Row 1 (after driver): seats 2, 3, aisle, 4, 5
    positions.push(seatNumber++, seatNumber++, null, seatNumber++, seatNumber++)
    
    // Row 2: seats 6, 7, aisle, 8, 9
    positions.push(seatNumber++, seatNumber++, null, seatNumber++, seatNumber++)
    
    // Row 3: seats 10, 11, aisle, 12, 13
    positions.push(seatNumber++, seatNumber++, null, seatNumber++, seatNumber++)
    
    // Row 4: seat 14 (center position)
    positions.push(null, null, seatNumber++, null, null)
    
    return positions
  }

  const seatPositions = generateSeatPositions()

  return (
    <div className="space-y-4">
      <div className="text-center text-gray-500 text-sm font-medium">
        FRENTE DO CHAPA
      </div>
      
      <div 
        className="grid gap-2 max-w-xs mx-auto"
        style={{ 
          gridTemplateColumns: "1fr 1fr 24px 1fr 1fr",
          gridTemplateRows: "repeat(4, 1fr)"
        }}
      >
        {/* Driver seat */}
        <div className="col-span-5">
          {renderSeat(1)}
        </div>
        
        {/* Passenger seats */}
        {seatPositions.map((seat, index) => {
          if (seat === null) {
            // Aisle space
            return <div key={`aisle-${index}`} className="border-l-2 border-dashed border-gray-300" />
          }
          if (seat && seat <= totalSeats) {
            return renderSeat(seat)
          }
          return <div key={`empty-${index}`} />
        })}
      </div>
      
      <div className="flex justify-center gap-4 text-[12px] text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-[#1A6B3C] bg-white rounded" />
          <span>Livre</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border border-gray-200 bg-gray-100 rounded" />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-[#F5A623] bg-[#FFF8E7] rounded" />
          <span>Selecionado</span>
        </div>
      </div>
    </div>
  )
}
