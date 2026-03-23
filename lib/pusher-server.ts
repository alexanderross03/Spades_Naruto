import Pusher from 'pusher'

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export function gameChannel(gameId: string): string {
  return `presence-game-${gameId}`
}

export function privateChannel(playerId: string): string {
  return `private-player-${playerId}`
}
