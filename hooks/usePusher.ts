'use client'
import { useEffect, useRef, useState } from 'react'
import Pusher from 'pusher-js'

// Accepts a callback instead of returning lastEvent so that rapid back-to-back
// Pusher events (e.g. card-played + trick-complete) are never dropped by React
// 18 automatic batching. The callback is called synchronously inside the Pusher
// event handler — outside React's render cycle — so every event is delivered.
export function usePusher(
  gameId: string,
  playerId: string,
  onEvent: (event: string, data: unknown) => void,
) {
  const pusherRef = useRef<Pusher | null>(null)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
      auth: { params: { playerId } },
    })

    pusherRef.current = pusher

    const channel = pusher.subscribe(`presence-game-${gameId}`)
    const privateChannel = pusher.subscribe(`private-player-${playerId}`)

    const EVENTS = [
      'player-joined', 'teams-updated', 'game-started',
      'bidding-started', 'bid-submitted', 'all-bids-in', 'card-played',
      'trick-complete', 'round-complete', 'game-over',
      'hand-restored', 'player-disconnected', 'host-changed',
    ]

    EVENTS.forEach(event => {
      channel.bind(event, (data: unknown) => onEventRef.current(event, data))
      privateChannel.bind(event, (data: unknown) => onEventRef.current(event, data))
    })

    pusher.connection.bind('connected', () => setIsConnected(true))
    pusher.connection.bind('disconnected', () => setIsConnected(false))

    return () => {
      pusher.unsubscribe(`presence-game-${gameId}`)
      pusher.unsubscribe(`private-player-${playerId}`)
      pusher.disconnect()
    }
  }, [gameId, playerId])

  return { isConnected }
}
