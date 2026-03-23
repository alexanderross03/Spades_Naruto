'use client'

interface Props {
  winner: 'team1' | 'team2'
  scores: { team1: number; team2: number }
  myTeam: 1 | 2
  onPlayAgain: () => void
}

export default function GameOverScreen({ winner, scores, myTeam, onPlayAgain }: Props) {
  const won = (winner === 'team1' && myTeam === 1) || (winner === 'team2' && myTeam === 2)

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 gap-8">
      <div className="text-6xl">{won ? '🍃' : '💀'}</div>
      <h1 className="text-4xl font-bold text-white">{won ? 'Victory!' : 'Defeated'}</h1>
      <p className="text-orange-400 text-xl">Team {winner === 'team1' ? 1 : 2} wins!</p>
      <div className="text-slate-300">
        Team 1: {scores.team1} pts · Team 2: {scores.team2} pts
      </div>
      <button
        onClick={onPlayAgain}
        className="bg-orange-500 text-white px-10 py-3 rounded-lg font-bold text-lg"
      >
        Play Again
      </button>
    </div>
  )
}
