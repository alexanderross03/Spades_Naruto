import Card from './Card'
import { Card as CardType } from '@/lib/types'

interface TrickPlay {
  playerId: string
  card: CardType
  seat: number  // 0=top, 1=right, 2=bottom, 3=left (relative to viewer)
}

interface Props {
  plays: TrickPlay[]
  trickCount: number  // increments each trick so same player re-animates
}

const POSITIONS: Record<number, string> = {
  0: 'col-start-2 row-start-1',
  1: 'col-start-3 row-start-2',
  2: 'col-start-2 row-start-3',
  3: 'col-start-1 row-start-2',
}

const SLIDE_ANIM: Record<number, string> = {
  0: 'cardSlideTop',
  1: 'cardSlideRight',
  2: 'cardSlideBottom',
  3: 'cardSlideLeft',
}

export default function TrickArea({ plays, trickCount }: Props) {
  return (
    <>
      <style>{`
        @keyframes cardSlideTop    { from { transform: translateY(-90px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes cardSlideRight  { from { transform: translateX(90px);  opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes cardSlideBottom { from { transform: translateY(90px);  opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes cardSlideLeft   { from { transform: translateX(-90px); opacity: 0; } to { transform: none; opacity: 1; } }
      `}</style>
      <div className="grid grid-cols-3 grid-rows-3 gap-1" style={{ width: 192, height: 192 }}>
        {[0, 1, 2, 3].map(relSeat => {
          const play = plays.find(p => p.seat === relSeat)
          return (
            <div key={relSeat} className={`${POSITIONS[relSeat]} flex items-center justify-center`}>
              {play ? (
                <div
                  key={`${play.playerId}-${trickCount}`}
                  style={{ animation: `${SLIDE_ANIM[relSeat]} 0.35s cubic-bezier(.22,.68,0,1.2) forwards` }}
                >
                  <Card card={play.card} size="sm" />
                </div>
              ) : (
                <div
                  className="rounded border border-dashed border-slate-600/40"
                  style={{ width: 54, height: 76 }}
                />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
