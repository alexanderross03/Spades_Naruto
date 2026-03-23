interface Props {
  team1Score: number
  team2Score: number
  team1Bags: number
  team2Bags: number
  round: number
  myTeam: 1 | 2
}

export default function ScoreBar({ team1Score, team2Score, team1Bags, team2Bags, round, myTeam }: Props) {
  return (
    <div className="w-full flex justify-between items-center bg-black/50 rounded px-3 py-1.5 text-xs text-yellow-400">
      <span className={myTeam === 1 ? 'font-bold' : ''}>
        Team 1: <strong>{team1Score}</strong>
        <span className="text-slate-500 ml-1">({team1Bags} bags)</span>
      </span>
      <span className="text-slate-400">Round {round}</span>
      <span className={myTeam === 2 ? 'font-bold' : ''}>
        Team 2: <strong>{team2Score}</strong>
        <span className="text-slate-500 ml-1">({team2Bags} bags)</span>
      </span>
    </div>
  )
}
