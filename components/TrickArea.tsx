import Card from './Card'
import { Card as CardType } from '@/lib/types'

interface TrickPlay {
  playerId: string
  card: CardType
  seat: number  // 0=top, 1=right, 2=bottom, 3=left (relative to viewer at bottom)
}

interface Props {
  plays: TrickPlay[]
}

// Seat positions relative to the viewer (who is always at the bottom / seat 2 from viewer's perspective)
const POSITIONS: Record<number, string> = {
  0: 'col-start-2 row-start-1',  // top (across)
  1: 'col-start-3 row-start-2',  // right
  2: 'col-start-2 row-start-3',  // bottom (you)
  3: 'col-start-1 row-start-2',  // left
}

export default function TrickArea({ plays }: Props) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-48 h-48">
      {[0, 1, 2, 3].map(relSeat => {
        const play = plays.find(p => p.seat === relSeat)
        return (
          <div key={relSeat} className={`${POSITIONS[relSeat]} flex items-center justify-center`}>
            {play ? (
              <Card card={play.card} size="sm" />
            ) : (
              <div className="w-10 h-14 border border-dashed border-slate-600 rounded opacity-40" />
            )}
          </div>
        )
      })}
    </div>
  )
}
