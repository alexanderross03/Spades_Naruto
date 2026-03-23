# Spades: Naruto Edition — Design Spec

**Date:** 2026-03-22
**Status:** Draft

---

## Overview

A real-time, browser-based spades card game for exactly 4 players. Naruto-themed cards and UI. No accounts, no sign-up — players join by entering a name and a game code. Hosted on Vercel.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend + API | Next.js 14 (App Router, TypeScript) | Deploys cleanly to Vercel, API routes collocated |
| Real-time | Pusher (free tier) | WebSocket channels without persistent server |
| Game state | Vercel KV (Upstash Redis) | Serverless-safe, free tier, one-click setup |
| Styling | Tailwind CSS | Fast iteration, dark theme support |
| Deploy | Vercel | Free tier sufficient for 4 players |

---

## User Flow

### Joining a Game
1. Player 1 visits the app, enters their ninja name, clicks **Create Game**
2. A 4-character game code is generated (e.g. `K4KS`) and displayed in the lobby
3. Players 2–4 enter the code + their name and click **Join Game**
4. Lobby shows all connected players with green dots
5. Host can click **Randomize Teams** to shuffle; any player can click another player's name to swap seats
6. Teams: players at seats 0 & 2 = Team 1, seats 1 & 3 = Team 2 (seated across from each other)
7. Once 4 players are present, host clicks **Start Game**

### Game Loop (Standard Spades)
1. **Deal**: 13 cards each, dealt server-side, each player sees only their hand
2. **Bid**: Starting from dealer+1, each player picks a bid (0–13). Nil (0) is allowed.
3. **Play tricks**: 13 rounds of trick-taking. Spades always trump.
4. **Score round**: Team bid vs tricks won. Bags accumulate; 10 bags = -100.
5. **Repeat** until a team reaches 500 (win) or drops to -200 (lose)

---

## Architecture

### File Structure

```
/app
  page.tsx                        Landing — create or join
  /game/[gameId]/page.tsx         Game room (lobby + game)

/app/api
  /game/create/route.ts           POST: create game, store in KV, return gameId
  /game/[gameId]/join/route.ts    POST: join game, add player to KV state
  /game/[gameId]/start/route.ts   POST: deal cards, begin bidding
  /game/[gameId]/bid/route.ts     POST: submit bid
  /game/[gameId]/play/route.ts    POST: play a card, resolve trick if complete
  /game/[gameId]/teams/route.ts   POST: update seat assignments
  /api/pusher/auth/route.ts       Pusher presence channel auth
  /game/[gameId]/state/route.ts   GET: return public game state + send hand via private Pusher event (reconnect)

/lib
  game-engine.ts                  Pure functions: deal, validatePlay, resolveTrick, scoreRound
  kv.ts                           Typed Vercel KV helpers (getGame, setGame)
  pusher-server.ts                Pusher server client (publish events)
  pusher-client.ts                Pusher browser client (subscribe)
  cards.ts                        52-card definitions with Naruto character mapping

/components
  Card.tsx                        SVG card component (faction colors + character name)
  PlayerHand.tsx                  Your 13 cards, clickable when it's your turn
  TrickArea.tsx                   Center 2×2 grid showing current trick
  PlayerSlot.tsx                  Opponent display (card backs + name/bid/tricks)
  BidDialog.tsx                   Full-screen bid overlay
  Lobby.tsx                       Lobby with player list + team controls
  ScoreBoard.tsx                  Running score display (top bar)
  GameTable.tsx                   Root layout: top/left/right/center/bottom
```

### Game State (stored in Vercel KV as JSON)

```typescript
interface GameState {
  gameId: string
  status: 'lobby' | 'bidding' | 'playing' | 'round_end' | 'game_end'
  round: number
  players: Player[]          // ordered: indices 0,2 = Team 1; 1,3 = Team 2
  hands: Record<string, Card[]>     // playerId → cards (server-side only)
  bids: Record<string, number>      // playerId → bid (-1 = not yet bid)
  currentTrick: { playerId: string; card: Card }[]
  trickLeader: string               // playerId who leads current trick
  tricksWon: Record<string, number> // playerId → tricks this round
  scores: { team1: number; team2: number }
  bags: { team1: number; team2: number }
  dealer: number                    // seat index, rotates each round
}

interface Player {
  id: string       // uuid assigned on join
  name: string
  seat: number     // 0–3
}
```

**Important:** Hands are never sent to the browser in full state. Each player only receives their own hand via a private Pusher event on `game-started`.

### Pusher Events

| Event | Direction | Payload |
|---|---|---|
| `player-joined` | server → all | `{ player }` |
| `teams-updated` | server → all | `{ players }` |
| `game-started` | server → each (private) | `{ hand: Card[] }` |
| `bidding-started` | server → all | `{ currentBidder: string }` |
| `bid-submitted` | server → all | `{ playerId, bid }` |
| `card-played` | server → all | `{ playerId, card }` |
| `trick-complete` | server → all | `{ winner, trick }` |
| `round-complete` | server → all | `{ scores, bags }` |
| `game-over` | server → all | `{ winner: 'team1' \| 'team2', scores }` |
| `hand-restored` | server → player (private) | `{ hand: Card[], gameState: PublicGameState }` |

**Reconnect flow:** When a player reloads, the client re-subscribes to the Pusher presence channel and calls `GET /api/game/[gameId]/state`. The server reads game state from KV, sends the player's hand via a private `hand-restored` Pusher event, and returns the public game state (no hands) in the HTTP response.

---

## Naruto Card Theming

### Suit → Faction

| Suit | Faction | Color Scheme |
|---|---|---|
| ♠ Spades | Hidden Leaf Village | Green (#16a34a) |
| ♥ Hearts | Hidden Sand Village | Amber (#f59e0b) |
| ♦ Diamonds | Akatsuki | Red (#dc2626) |
| ♣ Clubs | Hidden Mist | Blue (#3b82f6) |

### Character Assignments (52 cards)

**♠ Leaf Village**
A=Naruto, K=Minato, Q=Tsunade, J=Kakashi, 10=Sasuke, 9=Sakura, 8=Rock Lee, 7=Neji, 6=Hinata, 5=Shikamaru, 4=Choji, 3=Ino, 2=Kiba

**♥ Sand Village**
A=Gaara, K=4th Kazekage, Q=Temari, J=Kankuro, 10=Chiyo, 9=Pakura, 8=Gari, 7=Baki, 6=Toroi, 5=Yugito, 4=Han, 3=Fū, 2=Rōshi

**♦ Akatsuki**
A=Pain, K=Madara, Q=Konan, J=Itachi, 10=Kabuto, 9=Orochimaru, 8=Hidan, 7=Kakuzu, 6=Zetsu, 5=Tobi, 4=Sasori, 3=Deidara, 2=Yahiko

**♣ Hidden Mist**
A=Zabuza, K=Yagura, Q=Mei, J=Mangetsu, 10=Suigetsu, 9=Chojuro, 8=Ao, 7=Utakata, 6=Kisame, 5=Tobirama, 4=Gengetsu, 3=Kagami, 2=Haku

### Card Visual Design
Cards are React SVG components — no external image dependencies. Each card shows:
- Large rank (A/K/Q/J/2–10) in faction color
- Character name below rank
- Faction symbol as watermark
- Dark card background with faction-colored border

Card backs use a Hidden Leaf symbol on a dark green gradient.

---

## Screens

### Landing Page (`/`)
- Dark Naruto-themed background
- App title: "SPADES: NARUTO EDITION"
- Name input
- Two buttons: **Create Game** / **Join Game** (join shows code input)

### Lobby (`/game/[gameId]`)
- Large game code display for host to share
- 4 player slots with green/grey status dots
- Team labels (Team 1 / Team 2)
- **Randomize Teams** button (host only)
- Click any player to swap seats (host only)
- **Start Game** button (host, enabled when 4 players connected)

### Bid Screen
- Full-screen overlay on game table
- Shows your 13 cards (read-only)
- Bid picker 0–13 with clear nil highlight
- Shows other players' bids as they come in
- "Waiting for [name] to bid…" indicator

### Game Table
- Dark felt-green table background
- Top: opponent + card backs + name/bid/tricks
- Left/Right: opponents, rotated card backs
- Center: 2×2 trick area, current trick cards
- Bottom: your hand, fan-spread, clickable when your turn
- Top bar: Team 1 score | Round | Team 2 score

### Round End
- Score summary overlay: bids vs made, bags, delta
- "Next Round" button (host)

### Game Over
- Winner announcement with Naruto art/theming
- Final scores
- "Play Again" button — redirects all players back to the landing page to start a fresh game with a new code. Same teams are not preserved.

### Abandoned Player Handling
No automatic handling — if a player closes their tab the game stalls until they reconnect. The Pusher presence channel shows who is online; disconnected players are visually marked as offline. If the host disconnects, host privileges (Start Game, Next Round) transfer to the next connected player by seat order.

### Data Cleanup
Vercel KV game keys are set with a 24-hour TTL on creation. Abandoned games expire automatically.

---

## Spades Rules Implemented

- Standard partnership spades (2v2)
- Spades always trump, cannot lead spades until broken (or only spades in hand)
- Bidding: 0–13 per player; nil = 0 tricks for +/- 100 pts
- Scoring: made bid = 10×bid + overtricks (bags); set (missed bid) = -10×bid
- Nil: scored individually — if made, player's team +100; if broken, player's team -100. Partner's bid scores independently. If nil is broken, the tricks taken by the nil player count toward the team's total trick count (and become bags if over the partner's bid); the nil player's tricks do not count toward the partner's bid total separately. Example: partner bid 4, nil player took 2 tricks — team total = 6 tricks, partner made bid, 2 bags.
- Play proceeds clockwise by seat index (0→1→2→3→0…). The trick winner leads the next trick.
- Bags: each overtrick = 1 bag; 10 bags = -100 penalty, bags reset to 0
- Win condition: first team to 500; lose condition: -200
- Seat swap: host clicks a player slot to select it (highlighted), then clicks another slot to swap those two players. Clicking the same slot twice deselects. Host's own seat can be swapped.

---

## Verification Plan

1. **Local dev**: `npm run dev`, open 4 browser tabs (or 4 different browsers), create game in one, join with the code in others
2. **Real-time**: play a card in one tab, verify it appears in all others within ~200ms
3. **Reconnect**: refresh mid-game, verify hand and game state are restored from KV
4. **Rules**: play through a full round, verify trick resolution and scoring match expected values
5. **Deploy**: push to Vercel, set `PUSHER_*` and `KV_*` env vars, test with real remote players
