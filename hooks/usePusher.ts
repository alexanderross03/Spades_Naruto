'use client'
import { useEffect, useRef, useState } from 'react'
import Pusher, { Channel } from 'pusher-js'

export interface PusherEvent {
  event: string
  data: unknown
}

export function usePusher(gameId: string, playerId: string) {
  const pusherRef = useRef<Pusher | null>(null)
  const [lastEvent, setLastEvent] = useState<PusherEvent | null>(null)
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
      'bidding-started', 'bid-submitted', 'card-played',
      'trick-complete', 'round-complete', 'game-over',
      'hand-restored', 'player-disconnected', 'host-changed',
    ]

    EVENTS.forEach(event => {
      channel.bind(event, (data: unknown) => setLastEvent({ event, data }))
      privateChannel.bind(event, (data: unknown) => setLastEvent({ event, data }))
    })

    pusher.connection.bind('connected', () => setIsConnected(true))
    pusher.connection.bind('disconnected', () => setIsConnected(false))

    return () => {
      pusher.unsubscribe(`presence-game-${gameId}`)
      pusher.unsubscribe(`private-player-${playerId}`)
      pusher.disconnect()
    }
  }, [gameId, playerId])

  return { lastEvent, isConnected }
}
