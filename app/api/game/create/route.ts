import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { setGame } from '@/lib/kv'
import { pusher, gameChannel } from '@/lib/pusher-server'
import { GameState } from '@/lib/types'

function generateCode(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

export async function POST(req: Request) {
  const { playerName } = await req.json()
  const gameId = generateCode()
  const playerId = uuidv4()

  const state: GameState = {
    gameId,
    status: 'lobby',
    round: 1,
    players: [{ id: playerId, name: playerName, seat: 0 }],
    bids: {},
    currentTrick: [],
    trickLeader: '',
    tricksWon: {},
    completedTricks: [],
    scores: { team1: 0, team2: 0 },
    bags: { team1: 0, team2: 0 },
    dealer: 0,
    hostId: playerId,
  }

  await setGame(gameId, state)
  return NextResponse.json({ gameId, playerId })
}
