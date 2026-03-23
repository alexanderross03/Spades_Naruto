interface Props {
  bids: Record<string, number>
  tricksWon: Record<string, number>
  players: { id: string; name: string; seat: number }[]
  scores: { team1: number; team2: number }
  bags: { team1: number; team2: number }
  isHost: boolean
  onNextRound: () => void
}

export default function RoundEndOverlay({ bids, tricksWon, players, scores, bags, isHost, onNextRound }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 gap-6 p-6">
      <h2 className="text-white text-2xl font-bold">Round Over</h2>

      <div className="grid grid-cols-2 gap-8">
        {[1, 2].map(team => {
          const teamPlayers = players.filter(p => p.seat % 2 === team - 1)
          return (
            <div key={team} className="text-center">
              <h3 className="text-orange-400 font-bold mb-2">Team {team}</h3>
              {teamPlayers.map(p => (
                <div key={p.id} className="text-sm text-slate-300">
                  {p.name}: bid {bids[p.id]} · won {tricksWon[p.id] ?? 0}
                </div>
              ))}
              <div className="text-white font-bold mt-2 text-lg">
                {scores[`team${team}` as 'team1' | 'team2']} pts
              </div>
              <div className="text-slate-500 text-xs">
                {bags[`team${team}` as 'team1' | 'team2']} bags
              </div>
            </div>
          )
        })}
      </div>

      {isHost ? (
        <button onClick={onNextRound} className="bg-orange-500 text-white px-8 py-2 rounded font-bold">
          Next Round
        </button>
      ) : (
        <p className="text-slate-400">Waiting for host to start next round…</p>
      )}
    </div>
  )
}
