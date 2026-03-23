'use client'
import { useState } from 'react'
import { Player } from '@/lib/types'

interface Props {
  gameId: string
  players: Player[]
  myPlayerId: string
  isHost: boolean
  onRandomize: () => void
  onSwap: (seatA: number, seatB: number) => void
  onStart: () => void
}

export default function Lobby({ gameId, players, myPlayerId, isHost, onRandomize, onSwap, onStart }: Props) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)

  function handleSeatClick(seat: number) {
    if (!isHost) return
    if (selectedSeat === null) {
      setSelectedSeat(seat)
    } else if (selectedSeat === seat) {
      setSelectedSeat(null)
    } else {
      onSwap(selectedSeat, seat)
      setSelectedSeat(null)
    }
  }

  const seatLabels = ['Team 1', 'Team 2', 'Team 1', 'Team 2']

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-orange-500 text-3xl font-bold tracking-widest">🍃 SPADES: NARUTO</h1>

      <div className="text-center">
        <p className="text-slate-400 text-sm mb-2">Share this code with your friends</p>
        <div className="text-4xl font-bold tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500 rounded-xl px-8 py-3">
          {gameId}
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {[0, 1, 2, 3].map(seat => {
          const player = players.find(p => p.seat === seat)
          const isSelected = selectedSeat === seat
          return (
            <div
              key={seat}
              onClick={() => (player || selectedSeat !== null) && handleSeatClick(seat)}
              className={`flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 transition-all
                ${isHost && player ? 'cursor-pointer hover:bg-white/10' : ''}
                ${isSelected ? 'ring-2 ring-orange-400' : ''}
              `}
            >
              <div className={`w-2 h-2 rounded-full ${player ? 'bg-green-400' : 'bg-slate-600'}`} />
              <span className="text-slate-200 flex-1">
                {player ? player.name : 'Waiting…'}
                {player?.id === myPlayerId ? ' (you)' : ''}
              </span>
              <span className={`text-xs ${seat % 2 === 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {seatLabels[seat]}
              </span>
            </div>
          )
        })}
      </div>

      {isHost && (
        <div className="flex gap-4">
          <button onClick={onRandomize} className="border border-slate-600 text-slate-300 px-5 py-2 rounded hover:bg-slate-800">
            Randomize Teams
          </button>
          <button
            onClick={onStart}
            disabled={players.length < 4}
            className="bg-orange-500 disabled:opacity-40 text-white px-8 py-2 rounded font-bold"
          >
            Start Game
          </button>
        </div>
      )}
      {!isHost && (
        <p className="text-slate-500 text-sm">Waiting for host to start the game…</p>
      )}
      {isHost && selectedSeat !== null && (
        <p className="text-orange-400 text-sm">Click another player to swap seats</p>
      )}
    </div>
  )
}
