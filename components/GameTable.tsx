'use client'
import { Card as CardType, GameState, Player } from '@/lib/types'
import { checkSpadesBroken } from '@/lib/game-engine'
import ScoreBar from './ScoreBar'
import PlayerSlot from './PlayerSlot'
import TrickArea from './TrickArea'
import TrickCompleteOverlay from './TrickCompleteOverlay'
import PlayerHand from './PlayerHand'

interface CompletingTrick {
  plays: { playerId: string; card: CardType }[]
  winner: string
  tricksWon: Record<string, number>
}

interface Props {
  gameState: GameState
  myPlayerId: string
  myHand: CardType[]
  disconnectedIds: Set<string>
  completingTrick: CompletingTrick | null
  onPlayCard: (card: CardType) => void
}

export default function GameTable({ gameState, myPlayerId, myHand, disconnectedIds, completingTrick, onPlayCard }: Props) {
  const me = gameState.players.find(p => p.id === myPlayerId)
  if (!me) return <div className="min-h-screen bg-[#0f2e1a] flex items-center justify-center text-slate-400">Reconnecting…</div>
  const mySeat = me.seat
  const myTeam: 1 | 2 = mySeat % 2 === 0 ? 1 : 2

  // relSeat: 0=top (across), 1=right, 2=bottom (me), 3=left
  function relSeat(absoluteSeat: number): number {
    return (absoluteSeat - mySeat + 2 + 4) % 4
  }

  const getPlayerAt = (rel: number) =>
    gameState.players.find(p => relSeat(p.seat) === rel)

  const top = getPlayerAt(0)
  const right = getPlayerAt(1)
  const left = getPlayerAt(3)

  const spadesBroken = checkSpadesBroken(gameState.completedTricks)
  const ledCard = gameState.currentTrick.length > 0 ? gameState.currentTrick[0].card : null

  const trickLeaderPlayer = gameState.players.find(p => p.id === gameState.trickLeader)
  const lastPlayed = gameState.currentTrick.length > 0
    ? gameState.players.find(p => p.id === gameState.currentTrick[gameState.currentTrick.length - 1].playerId)
    : undefined
  const currentSeat = gameState.currentTrick.length === 0
    ? (trickLeaderPlayer?.seat ?? 0)
    : ((lastPlayed?.seat ?? 0) + 1) % 4
  const currentPlayerId = gameState.players.find(p => p.seat === currentSeat)?.id
  const isMyTurn = gameState.status === 'playing' && currentPlayerId === myPlayerId
  const currentPlayerName = gameState.players.find(p => p.id === currentPlayerId)?.name ?? '…'

  const trickPlays = gameState.currentTrick.map(p => ({
    ...p,
    seat: relSeat(gameState.players.find(pl => pl.id === p.playerId)?.seat ?? 0),
  }))

  function slotProps(player: Player | undefined, position: 'top' | 'left' | 'right') {
    if (!player) return null
    return {
      name: player.name,
      bid: gameState.bids[player.id] ?? -1,
      tricksWon: gameState.tricksWon[player.id] ?? 0,
      cardCount: 13 - gameState.completedTricks.length - (gameState.currentTrick.find(p => p.playerId === player.id) ? 1 : 0),
      isCurrentTurn: gameState.status === 'playing' && currentPlayerId === player.id,
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

      {/* Turn indicator banner */}
      {gameState.status === 'playing' && (
        <div
          className={`text-sm font-bold px-5 py-1.5 rounded-full transition-colors ${
            isMyTurn
              ? 'bg-orange-500 text-white'
              : 'bg-slate-800/80 text-slate-300 border border-slate-600'
          }`}
          style={isMyTurn ? { animation: 'turnRing 1s ease infinite' } : undefined}
        >
          {isMyTurn ? '⚡ Your turn' : `${currentPlayerName}'s turn`}
        </div>
      )}

      {/* Top player */}
      {top && <PlayerSlot {...slotProps(top, 'top')!} />}

      {/* Middle row */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        {left && <PlayerSlot {...slotProps(left, 'left')!} />}

        {/* Trick area — relative so overlay can anchor to it */}
        <div className="relative" style={{ width: 192, height: 192 }}>
          <TrickArea plays={trickPlays} trickCount={gameState.completedTricks.length} />
          {completingTrick && (
            <TrickCompleteOverlay
              plays={completingTrick.plays}
              winner={completingTrick.winner}
              tricksWon={completingTrick.tricksWon}
              players={gameState.players}
              mySeat={mySeat}
            />
          )}
        </div>

        {right && <PlayerSlot {...slotProps(right, 'right')!} />}
      </div>

      {/* My hand */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-slate-400 text-xs">
          {me.name} · bid {gameState.bids[myPlayerId] ?? '?'} · won {gameState.tricksWon[myPlayerId] ?? 0}
        </span>
        <PlayerHand
          hand={myHand}
          isMyTurn={isMyTurn}
          ledCard={ledCard}
          spadesBroken={spadesBroken}
          onPlay={onPlayCard}
        />
      </div>
    </div>
  )
}
