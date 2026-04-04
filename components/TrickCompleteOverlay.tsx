'use client'
import { useEffect, useState } from 'react'
import { Card as CardType, Player } from '@/lib/types'
import Card from './Card'

interface TrickPlay {
  playerId: string
  card: CardType
}

interface Props {
  plays: TrickPlay[]
  winner: string
  tricksWon: Record<string, number>
  players: Player[]
  mySeat: number
}

function relSeat(absoluteSeat: number, mySeat: number): number {
  return (absoluteSeat - mySeat + 2 + 4) % 4
}

const GRID_POS: Record<number, string> = {
  0: 'col-start-2 row-start-1',
  1: 'col-start-3 row-start-2',
  2: 'col-start-2 row-start-3',
  3: 'col-start-1 row-start-2',
}

// Scatter directions per relative seat
const SCATTER: Record<number, string> = {
  0: 'trickScatterTop',
  1: 'trickScatterRight',
  2: 'trickScatterBottom',
  3: 'trickScatterLeft',
}

export default function TrickCompleteOverlay({ plays, winner, tricksWon, players, mySeat }: Props) {
  const [phase, setPhase] = useState<'hold' | 'scatter'>('hold')

  useEffect(() => {
    const t = setTimeout(() => setPhase('scatter'), 400)
    return () => clearTimeout(t)
  }, [])

  const winnerPlayer = players.find(p => p.id === winner)
  const winnerTricks = tricksWon[winner] ?? 0

  return (
    <>
      <style>{`
        /* Loser scatter animations */
        @keyframes trickScatterTop {
          0%   { transform: translateY(0) rotate(0deg);      opacity: 1; }
          100% { transform: translateY(-260px) rotate(-25deg); opacity: 0; }
        }
        @keyframes trickScatterRight {
          0%   { transform: translate(0,0) rotate(0deg);          opacity: 1; }
          100% { transform: translate(260px,-80px) rotate(30deg);  opacity: 0; }
        }
        @keyframes trickScatterBottom {
          0%   { transform: translateY(0) rotate(0deg);      opacity: 1; }
          100% { transform: translateY(260px) rotate(25deg); opacity: 0; }
        }
        @keyframes trickScatterLeft {
          0%   { transform: translate(0,0) rotate(0deg);           opacity: 1; }
          100% { transform: translate(-260px,-80px) rotate(-30deg); opacity: 0; }
        }
        /* Winner: glow pulse then zoom-fly-out */
        @keyframes trickWinner {
          0%   { transform: scale(1);    filter: brightness(1);                                  opacity: 1; }
          20%  { transform: scale(1.5);  filter: brightness(1.8) drop-shadow(0 0 18px #fbbf24);  opacity: 1; }
          55%  { transform: scale(1.35); filter: brightness(1.5) drop-shadow(0 0 12px #fbbf24);  opacity: 1; }
          80%  { transform: scale(1.35); opacity: 1; }
          100% { transform: scale(0.3) translateY(-100px); opacity: 0; }
        }
        /* Winner glow ring behind card */
        @keyframes winnerRing {
          0%  { transform: scale(0.8); opacity: 0; }
          25% { transform: scale(1.6); opacity: 0.7; }
          100%{ transform: scale(2.2); opacity: 0; }
        }
        /* Toast slide-up and fade */
        @keyframes trickToast {
          0%   { transform: translate(-50%, 16px); opacity: 0;   }
          15%  { transform: translate(-50%, 0);    opacity: 1;   }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Overlay covering the trick area */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 20, overflow: 'visible' }}
      >
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
          {plays.map(play => {
            const player = players.find(p => p.id === play.playerId)
            if (!player) return null
            const rel = relSeat(player.seat, mySeat)
            const isWin = play.playerId === winner

            const animStyle: React.CSSProperties = phase === 'scatter'
              ? isWin
                ? { animation: 'trickWinner 1.5s ease forwards', zIndex: 10, position: 'relative' }
                : { animation: `${SCATTER[rel]} 0.6s ease forwards` }
              : {}

            return (
              <div
                key={play.playerId}
                className={`${GRID_POS[rel]} flex items-center justify-center`}
              >
                {/* Glow ring behind winner */}
                {isWin && phase === 'scatter' && (
                  <div
                    className="absolute rounded-full bg-yellow-400"
                    style={{
                      width: 60, height: 60,
                      animation: 'winnerRing 1s ease forwards',
                    }}
                  />
                )}
                <div style={animStyle}>
                  <Card card={play.card} size="sm" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Winner toast */}
        <div
          className="absolute left-1/2 bottom-0"
          style={{ animation: 'trickToast 1.9s ease forwards', pointerEvents: 'none' }}
        >
          <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-orange-300/30 whitespace-nowrap">
            🏆 {winnerPlayer?.name ?? 'Someone'} wins the book!
            <span className="ml-1.5 opacity-75">{winnerTricks} trick{winnerTricks !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </>
  )
}
