'use client'
import { Card as CardType, GameState, Player } from '@/lib/types'
import { checkSpadesBroken } from '@/lib/game-engine'
import { Suit } from '@/lib/types'
import ScoreBar from './ScoreBar'
import PlayerSlot from './PlayerSlot'
import TrickArea from './TrickArea'
import PlayerHand from './PlayerHand'

interface Props {
  gameState: GameState
  myPlayerId: string
  myHand: CardType[]
  disconnectedIds: Set<string>
  onPlayCard: (card: CardType) => void
}

export default function GameTable({ gameState, myPlayerId, myHand, disconnectedIds, onPlayCard }: Props) {
  const me = gameState.players.find(p => p.id === myPlayerId)!
  const myTeam: 1 | 2 = me.seat % 2 === 0 ? 1 : 2

  // Map seats relative to my view (I'm always at bottom)
  // relSeat 0=top (across), 1=right, 2=bottom(me), 3=left
  function relSeat(absoluteSeat: number): number {
    return (absoluteSeat - me.seat + 4) % 4
  }

  const getPlayerAt = (rel: number) =>
    gameState.players.find(p => relSeat(p.seat) === rel)

  const top = getPlayerAt(0)
  const right = getPlayerAt(1)
  const left = getPlayerAt(3)

  const spadesBroken = checkSpadesBroken(gameState.completedTricks)
  const ledSuit = gameState.currentTrick.length > 0
    ? gameState.currentTrick[0].card.suit as Suit
    : null

  // Who plays next?
  const currentSeat = gameState.currentTrick.length === 0
    ? gameState.players.find(p => p.id === gameState.trickLeader)!.seat
    : (gameState.players.find(p => p.id === gameState.currentTrick[gameState.currentTrick.length - 1].playerId)!.seat + 1) % 4
  const currentPlayerId = gameState.players.find(p => p.seat === currentSeat)?.id
  const isMyTurn = currentPlayerId === myPlayerId

  // Trick plays mapped to relative seats
  const trickPlays = gameState.currentTrick.map(p => ({
    ...p,
    seat: relSeat(gameState.players.find(pl => pl.id === p.playerId)!.seat),
  }))

  function slotProps(player: Player | undefined, position: 'top' | 'left' | 'right') {
    if (!player) return null
    return {
      name: player.name,
      bid: gameState.bids[player.id] ?? -1,
      tricksWon: gameState.tricksWon[player.id] ?? 0,
      cardCount: 13 - gameState.completedTricks.length - (gameState.currentTrick.find(p => p.playerId === player.id) ? 1 : 0),
      isCurrentTurn: currentPlayerId === player.id,
      isDisconnected: disconnectedIds.has(player.id),
      position,
    }
  }

  return (
    <div className="min-h-screen bg-[#0f2e1a] flex flex-col items-center justify-between p-3 gap-2">
      <ScoreBar
        team1Score={gameState.scores.team1}
        team2Score={gameState.scores.team2}
        team1Bags={gameState.bags.team1}
        team2Bags={gameState.bags.team2}
        round={gameState.round}
        myTeam={myTeam}
      />

      {/* Top player */}
      {top && <PlayerSlot {...slotProps(top, 'top')!} />}

      {/* Middle row */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        {left && <PlayerSlot {...slotProps(left, 'left')!} />}
        <TrickArea plays={trickPlays} />
        {right && <PlayerSlot {...slotProps(right, 'right')!} />}
      </div>

      {/* My hand */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-slate-400 text-xs">
          {me.name} · bid {gameState.bids[myPlayerId] ?? '?'} · won {gameState.tricksWon[myPlayerId] ?? 0}
          {isMyTurn && <span className="text-orange-400 ml-2">your turn</span>}
        </span>
        <PlayerHand
          hand={myHand}
          isMyTurn={isMyTurn}
          ledSuit={ledSuit}
          spadesBroken={spadesBroken}
          onPlay={onPlayCard}
        />
      </div>
    </div>
  )
}
