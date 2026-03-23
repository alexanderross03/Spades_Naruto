'use client'
import { useState } from 'react'
import Card from './Card'
import { Card as CardType } from '@/lib/types'

interface Props {
  hand: CardType[]
  myName: string
  currentBidderId: string
  myPlayerId: string
  bids: Record<string, number>
  players: { id: string; name: string; seat: number }[]
  onBid: (bid: number) => void
}

export default function BidDialog({ hand, myName, currentBidderId, myPlayerId, bids, players, onBid }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const isMyTurn = currentBidderId === myPlayerId

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 gap-6 p-4">
      <h2 className="text-white text-xl font-bold">Bidding Phase</h2>

      {/* Other players' bids */}
      <div className="flex gap-4">
        {players.map(p => (
          <div key={p.id} className="text-center">
            <div className="text-slate-400 text-xs">{p.name}</div>
            <div className="text-white font-mono">
              {bids[p.id] >= 0 ? bids[p.id] : p.id === currentBidderId ? '…' : '?'}
            </div>
          </div>
        ))}
      </div>

      {/* Your hand (read-only) */}
      <div className="flex flex-wrap justify-center gap-1 max-w-lg">
        {hand.map(card => <Card key={`${card.suit}-${card.rank}`} card={card} size="sm" />)}
      </div>

      {/* Bid picker */}
      {isMyTurn && (
        <>
          <div className="flex gap-2 flex-wrap justify-center">
            {Array.from({ length: 14 }, (_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-10 h-10 rounded font-bold transition-colors ${
                  selected === i
                    ? 'bg-orange-500 text-white'
                    : i === 0
                    ? 'bg-red-900/50 text-red-400 border border-red-700 hover:bg-red-800/50'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {i === 0 ? 'Nil' : i}
              </button>
            ))}
          </div>
          <button
            disabled={selected === null}
            onClick={() => selected !== null && onBid(selected)}
            className="bg-orange-500 disabled:opacity-40 text-white px-8 py-2 rounded font-bold"
          >
            Confirm Bid
          </button>
        </>
      )}
      {!isMyTurn && (
        <p className="text-slate-400">Waiting for {players.find(p => p.id === currentBidderId)?.name ?? '…'} to bid…</p>
      )}
    </div>
  )
}
