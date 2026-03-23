import { NextResponse } from 'next/server'
import { pusher } from '@/lib/pusher-server'

export async function POST(req: Request) {
  const body = await req.text()
  const params = new URLSearchParams(body)
  const socketId = params.get('socket_id')!
  const channel = params.get('channel_name')!
  const playerId = params.get('playerId') ?? 'unknown'

  if (channel.startsWith('presence-')) {
    const authResponse = pusher.authorizeChannel(socketId, channel, {
      user_id: playerId,
      user_info: { playerId },
    })
    return NextResponse.json(authResponse)
  }

  if (channel.startsWith('private-')) {
    const authResponse = pusher.authorizeChannel(socketId, channel)
    return NextResponse.json(authResponse)
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
