'use client'
import { useEffect, useReducer, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GameState, Card as CardType, Player } from '@/lib/types'
import { usePusher } from '@/hooks/usePusher'
import Lobby from '@/components/Lobby'
import GameTable from '@/components/GameTable'
import BidDialog from '@/components/BidDialog'
import RoundEndOverlay from '@/components/RoundEndOverlay'
import GameOverScreen from '@/components/GameOverScreen'

interface CompletingTrick {
  plays: { playerId: string; card: CardType }[]
  winner: string
  tricksWon: Record<string, number>
}

interface LocalState {
  gameState: GameState | null
  myHand: CardType[]
  currentBidderId: string | null
  disconnectedIds: Set<string>
  gameOverWinner: 'team1' | 'team2' | null
  completingTrick: CompletingTrick | null
}

type Action =
  | { type: 'SET_GAME'; state: GameState }
  | { type: 'SET_HAND'; hand: CardType[] }
  | { type: 'PLAYER_JOINED'; player: Player }
  | { type: 'TEAMS_UPDATED'; players: Player[] }
  | { type: 'BIDDING_STARTED'; currentBidder: string; players?: Player[] }
  | { type: 'BID_SUBMITTED'; playerId: string; bid: number }
  | { type: 'ALL_BIDS_IN'; trickLeader: string; bids: Record<string, number> }
  | { type: 'CARD_PLAYED'; playerId: string; card: CardType }
  | { type: 'TRICK_COMPLETE'; winner: string; tricksWon: Record<string, number> }
  | { type: 'ROUND_COMPLETE'; scores: { team1: number; team2: number }; bags: { team1: number; team2: number }; bids: Record<string, number>; tricksWon: Record<string, number> }
  | { type: 'GAME_OVER'; winner: 'team1' | 'team2'; scores: { team1: number; team2: number } }
  | { type: 'HAND_RESTORED'; hand: CardType[]; gameState: GameState }
  | { type: 'PLAYER_DISCONNECTED'; playerId: string }
  | { type: 'HOST_CHANGED'; hostId: string }
  | { type: 'CLEAR_COMPLETING_TRICK' }

function reducer(state: LocalState, action: Action): LocalState {
  const gs = state.gameState
  switch (action.type) {
    case 'SET_GAME': return { ...state, gameState: action.state }
    case 'SET_HAND': return { ...state, myHand: action.hand }
    case 'HAND_RESTORED': return { ...state, myHand: action.hand, gameState: action.gameState }
    case 'PLAYER_JOINED':
      if (!gs) return state
      return { ...state, gameState: { ...gs, players: [...gs.players, action.player] } }
    case 'TEAMS_UPDATED':
      if (!gs) return state
      return { ...state, gameState: { ...gs, players: action.players } }
    case 'BIDDING_STARTED':
      return { ...state, currentBidderId: action.currentBidder,
        gameState: gs ? { ...gs, status: 'bidding', players: action.players ?? gs.players } : gs }
    case 'ALL_BIDS_IN':
      if (!gs) return state
      return { ...state, currentBidderId: null,
        gameState: { ...gs, status: 'playing', trickLeader: action.trickLeader, bids: action.bids } }
    case 'BID_SUBMITTED':
      if (!gs) return state
      return { ...state, gameState: { ...gs, bids: { ...gs.bids, [action.playerId]: action.bid } } }
    case 'CARD_PLAYED': {
      if (!gs) return state
      const newTrick = [...gs.currentTrick, { playerId: action.playerId, card: action.card }]
      return { ...state, gameState: { ...gs, currentTrick: newTrick, status: 'playing' } }
    }
    case 'TRICK_COMPLETE': {
      if (!gs) return state
      const plays = gs.currentTrick
      return {
        ...state,
        completingTrick: { plays, winner: action.winner, tricksWon: action.tricksWon },
        gameState: {
          ...gs,
          currentTrick: [],
          trickLeader: action.winner,
          tricksWon: action.tricksWon,
          completedTricks: [...gs.completedTricks, { plays, winner: action.winner }],
        },
      }
    }
    case 'ROUND_COMPLETE':
      if (!gs) return state
      return { ...state, gameState: { ...gs, status: 'round_end', scores: action.scores, bags: action.bags, bids: action.bids, tricksWon: action.tricksWon } }
    case 'GAME_OVER':
      if (!gs) return state
      return { ...state, gameOverWinner: action.winner, gameState: { ...gs, status: 'game_end', scores: action.scores } }
    case 'PLAYER_DISCONNECTED':
      return { ...state, disconnectedIds: new Set([...state.disconnectedIds, action.playerId]) }
    case 'HOST_CHANGED':
      if (!gs) return state
      return { ...state, gameState: { ...gs, hostId: action.hostId } }
    case 'CLEAR_COMPLETING_TRICK':
      return { ...state, completingTrick: null }
    default: return state
  }
}

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const router = useRouter()
  const playerId = typeof window !== 'undefined' ? sessionStorage.getItem('playerId') ?? '' : ''
  const [local, dispatch] = useReducer(reducer, { gameState: null, myHand: [], currentBidderId: null, disconnectedIds: new Set<string>(), gameOverWinner: null, completingTrick: null })
  const [randomizing, setRandomizing] = useState(false)
  const { lastEvent } = usePusher(gameId, playerId)

  // Fetch initial state on mount — also restores hand and derives current bidder on reconnect
  useEffect(() => {
    if (!playerId) { router.push('/'); return }
    fetch(`/api/game/${gameId}/state?playerId=${playerId}`)
      .then(r => r.json())
      .then(({ state, hand }) => {
        dispatch({ type: 'SET_GAME', state })
        if (hand) dispatch({ type: 'SET_HAND', hand })
        if (state?.status === 'bidding') {
          const turnOrder = [0, 1, 2, 3].map((offset: number) =>
            state.players.find((p: { seat: number }) => p.seat === (state.dealer + 1 + offset) % 4)
          )
          const currentBidder = turnOrder.find((p: { id: string } | undefined) => p && state.bids[p.id] === -1)
          if (currentBidder) dispatch({ type: 'BIDDING_STARTED', currentBidder: currentBidder.id })
        }
      })
  }, [gameId, playerId])

  // Handle Pusher events
  useEffect(() => {
    if (!lastEvent) return
    const { event, data } = lastEvent as { event: string; data: Record<string, unknown> }
    switch (event) {
      case 'player-joined': dispatch({ type: 'PLAYER_JOINED', player: data.player as Player }); break
      case 'teams-updated': dispatch({ type: 'TEAMS_UPDATED', players: data.players as Player[] }); break
      case 'game-started': dispatch({ type: 'SET_HAND', hand: data.hand as CardType[] }); break
      case 'hand-restored': dispatch({ type: 'HAND_RESTORED', hand: data.hand as CardType[], gameState: data.gameState as GameState }); break
      case 'bidding-started': dispatch({ type: 'BIDDING_STARTED', currentBidder: data.currentBidder as string, players: data.players as Player[] }); break
      case 'bid-submitted': dispatch({ type: 'BID_SUBMITTED', playerId: data.playerId as string, bid: data.bid as number }); break
      case 'all-bids-in': dispatch({ type: 'ALL_BIDS_IN', trickLeader: data.trickLeader as string, bids: data.bids as Record<string, number> }); break
      case 'card-played': dispatch({ type: 'CARD_PLAYED', playerId: data.playerId as string, card: data.card as CardType }); break
      case 'trick-complete': dispatch({ type: 'TRICK_COMPLETE', winner: data.winner as string, tricksWon: data.tricksWon as Record<string, number> }); break
      case 'round-complete': dispatch({ type: 'ROUND_COMPLETE', scores: data.scores as {team1:number,team2:number}, bags: data.bags as {team1:number,team2:number}, bids: data.bids as Record<string,number>, tricksWon: data.tricksWon as Record<string,number> }); break
      case 'game-over': dispatch({ type: 'GAME_OVER', winner: data.winner as 'team1'|'team2', scores: data.scores as {team1:number,team2:number} }); break
      case 'player-disconnected': dispatch({ type: 'PLAYER_DISCONNECTED', playerId: data.playerId as string }); break
      case 'host-changed': dispatch({ type: 'HOST_CHANGED', hostId: data.hostId as string }); break
    }
  }, [lastEvent])

  // Auto-clear trick animation after 2s
  useEffect(() => {
    if (!local.completingTrick) return
    const t = setTimeout(() => dispatch({ type: 'CLEAR_COMPLETING_TRICK' }), 2000)
    return () => clearTimeout(t)
  }, [local.completingTrick])

  async function handleStart() {
    await fetch(`/api/game/${gameId}/start`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId: playerId }),
    })
  }

  async function handleRandomize() {
    if (randomizing) return
    setRandomizing(true)
    const seats = [0, 1, 2, 3].sort(() => Math.random() - 0.5)
    for (let i = 0; i < seats.length - 1; i += 2) {
      await fetch(`/api/game/${gameId}/teams`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: playerId, seatA: seats[i], seatB: seats[i + 1] }),
      })
    }
    setRandomizing(false)
  }

  async function handleSwap(seatA: number, seatB: number) {
    await fetch(`/api/game/${gameId}/teams`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId: playerId, seatA, seatB }),
    })
  }

  async function handleBid(bid: number) {
    await fetch(`/api/game/${gameId}/bid`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, bid }),
    })
  }

  async function handlePlay(card: CardType) {
    const originalHand = local.myHand
    dispatch({ type: 'SET_HAND', hand: originalHand.filter(c => !(c.suit === card.suit && c.rank === card.rank)) })
    const res = await fetch(`/api/game/${gameId}/play`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, card }),
    })
    if (!res.ok) {
      dispatch({ type: 'SET_HAND', hand: originalHand })
    }
  }

  async function handleNextRound() {
    await fetch(`/api/game/${gameId}/start`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId: playerId }),
    })
  }

  function handlePlayAgain() {
    router.push('/')
  }

  const { gameState, myHand, currentBidderId, disconnectedIds, completingTrick } = local
  if (!gameState) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-slate-400">Connecting…</div>

  const me = gameState.players.find(p => p.id === playerId)
  const myTeam: 1 | 2 = me ? (me.seat % 2 === 0 ? 1 : 2) : 1
  const isHost = gameState.hostId === playerId

  const gameOverWinner: 'team1' | 'team2' | null = local.gameOverWinner ??
    (gameState.status === 'game_end'
      ? (gameState.scores.team1 >= gameState.scores.team2 ? 'team1' : 'team2')
      : null)

  return (
    <>
      {gameState.status === 'lobby' && (
        <Lobby
          gameId={gameId}
          players={gameState.players}
          myPlayerId={playerId}
          isHost={isHost}
          randomizing={randomizing}
          onRandomize={handleRandomize}
          onSwap={handleSwap}
          onStart={handleStart}
        />
      )}

      {(gameState.status === 'playing' || gameState.status === 'bidding' || (gameState.status === 'round_end' && !!completingTrick) || (gameState.status === 'game_end' && !!completingTrick)) && (
        <GameTable
          gameState={gameState}
          myPlayerId={playerId}
          myHand={myHand}
          disconnectedIds={disconnectedIds}
          completingTrick={completingTrick}
          onPlayCard={handlePlay}
        />
      )}

      {gameState.status === 'bidding' && currentBidderId && (
        <BidDialog
          hand={myHand}
          myName={me?.name ?? ''}
          currentBidderId={currentBidderId}
          myPlayerId={playerId}
          bids={gameState.bids}
          players={gameState.players}
          onBid={handleBid}
        />
      )}

      {gameState.status === 'round_end' && !completingTrick && (
        <RoundEndOverlay
          bids={gameState.bids}
          tricksWon={gameState.tricksWon}
          players={gameState.players}
          scores={gameState.scores}
          bags={gameState.bags}
          isHost={isHost}
          onNextRound={handleNextRound}
        />
      )}

      {gameState.status === 'game_end' && gameOverWinner && !completingTrick && (
        <GameOverScreen
          winner={gameOverWinner}
          scores={gameState.scores}
          myTeam={myTeam}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  )
}
