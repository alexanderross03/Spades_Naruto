export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs' | 'joker'
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | 'HJ' | 'LJ'

export interface Card {
  suit: Suit
  rank: Rank
  character: string  // Naruto character name
}

export interface Player {
  id: string         // uuid assigned on join
  name: string       // ninja name entered on landing
  seat: number       // 0-3; seats 0+2 = Team 1, seats 1+3 = Team 2
}

export type GameStatus = 'lobby' | 'bidding' | 'playing' | 'round_end' | 'game_end'

export interface Trick {
  plays: { playerId: string; card: Card }[]
  winner: string  // playerId
}

export interface GameState {
  gameId: string
  status: GameStatus
  round: number
  players: Player[]
  // hands are stored in KV but never sent to clients in bulk
  // each player gets their own hand via private Pusher event
  bids: Record<string, number>          // playerId → bid; -1 = not yet bid
  currentTrick: { playerId: string; card: Card }[]
  trickLeader: string                   // playerId who leads current trick
  tricksWon: Record<string, number>     // playerId → tricks won this round
  completedTricks: Trick[]
  scores: { team1: number; team2: number }
  bags: { team1: number; team2: number }
  dealer: number                        // seat index; rotates each round
  hostId: string                        // playerId with host privileges
}

// What gets sent over the wire to clients (no hands)
export type PublicGameState = Omit<GameState, never>  // hands stored separately in KV

// Stored alongside GameState in KV
export type Hands = Record<string, Card[]>  // playerId → cards
