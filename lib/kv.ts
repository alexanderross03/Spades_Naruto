import { kv } from '@vercel/kv'
import { GameState, Hands } from './types'

const TTL_SECONDS = 60 * 60 * 24  // 24 hours

export async function getGame(gameId: string): Promise<GameState | null> {
  return kv.get<GameState>(`game:${gameId}`)
}

export async function setGame(gameId: string, state: GameState): Promise<void> {
  await kv.set(`game:${gameId}`, state, { ex: TTL_SECONDS })
}

export async function getHands(gameId: string): Promise<Hands | null> {
  return kv.get<Hands>(`hands:${gameId}`)
}

export async function setHands(gameId: string, hands: Hands): Promise<void> {
  await kv.set(`hands:${gameId}`, hands, { ex: TTL_SECONDS })
}
