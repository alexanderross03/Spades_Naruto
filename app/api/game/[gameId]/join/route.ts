import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getGame, setGame } from '@/lib/kv'
import { pusher, gameChannel } from '@/lib/pusher-server'

export async function POST(req: Request, { params }: { params: { gameId: string } }) {
  const { playerName } = await req.json()
  const state = await getGame(params.gameId)
  if (!state) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (state.players.length >= 4) return NextResponse.json({ error: 'Game is full' }, { status: 400 })
  if (state.status !== 'lobby') return NextResponse.json({ error: 'Game already started' }, { status: 400 })

  const playerId = uuidv4()
  const seat = state.players.length
  state.players.push({ id: playerId, name: playerName, seat })
  await setGame(params.gameId, state)

  await pusher.trigger(gameChannel(params.gameId), 'player-joined', {
    player: { id: playerId, name: playerName, seat },
  })

  return NextResponse.json({ playerId })
}
