'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<'home' | 'join'>('home')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function createGame() {
    if (!name.trim()) return setError('Enter your ninja name')
    setLoading(true)
    const res = await fetch('/api/game/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: name.trim() }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      setError(error ?? 'Failed to create game')
      setLoading(false)
      return
    }
    const { gameId, playerId } = await res.json()
    sessionStorage.setItem('playerId', playerId)
    sessionStorage.setItem('playerName', name.trim())
    router.push(`/game/${gameId}`)
  }

  async function joinGame() {
    if (!name.trim()) return setError('Enter your ninja name')
    if (!code.trim()) return setError('Enter a game code')
    setLoading(true)
    const res = await fetch(`/api/game/${code.trim().toUpperCase()}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: name.trim() }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      setError(error)
      setLoading(false)
      return
    }
    const { playerId } = await res.json()
    sessionStorage.setItem('playerId', playerId)
    sessionStorage.setItem('playerName', name.trim())
    router.push(`/game/${code.trim().toUpperCase()}`)
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-orange-500 tracking-widest">🍃</h1>
        <h1 className="text-3xl font-bold text-orange-500 tracking-wider mt-2">SPADES: NARUTO</h1>
        <p className="text-slate-500 mt-1 text-sm">A card game for shinobi</p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your ninja name…"
          className="w-full bg-slate-800 text-white rounded px-4 py-2 text-center border border-slate-700 focus:border-orange-500 outline-none"
        />

        {mode === 'home' && (
          <div className="flex gap-3 w-full">
            <button onClick={createGame} disabled={loading}
              className="flex-1 bg-orange-500 disabled:opacity-50 text-white py-2 rounded font-bold">
              Create Game
            </button>
            <button onClick={() => setMode('join')}
              className="flex-1 border-2 border-orange-500 text-orange-500 py-2 rounded font-bold hover:bg-orange-500/10">
              Join Game
            </button>
          </div>
        )}

        {mode === 'join' && (
          <>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Game code (e.g. K4KS)"
              maxLength={4}
              className="w-full bg-slate-800 text-white rounded px-4 py-2 text-center border border-slate-700 focus:border-orange-500 outline-none tracking-widest uppercase"
            />
            <div className="flex gap-3 w-full">
              <button onClick={() => setMode('home')}
                className="flex-1 border border-slate-600 text-slate-400 py-2 rounded">
                Back
              </button>
              <button onClick={joinGame} disabled={loading}
                className="flex-1 bg-orange-500 disabled:opacity-50 text-white py-2 rounded font-bold">
                Join
              </button>
            </div>
          </>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </main>
  )
}
