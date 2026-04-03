'use client'
import { useState } from 'react'

interface AniListChar {
  id: number
  name: { full: string; native: string }
  image: { large: string }
}

export default function SearchTool() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AniListChar[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  async function search() {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query($search: String) {
            Page(perPage: 10) {
              characters(search: $search) {
                id
                name { full native }
                image { large }
              }
            }
          }`,
          variables: { search: query.trim() },
        }),
      })
      const json = await res.json()
      setResults(json.data?.Page?.characters ?? [])
    } finally {
      setLoading(false)
    }
  }

  function copy(url: string, name: string) {
    const line = `  '${name}': '${url}',`
    navigator.clipboard.writeText(line)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', marginTop: '2rem' }}>
      <h2 style={{ color: '#f1f5f9', fontSize: '1rem', marginBottom: '0.5rem' }}>
        Search AniList for character images
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '1rem' }}>
        Find any Naruto character — click a result to copy the line ready to paste into{' '}
        <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 3 }}>lib/character-images.ts</code>
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="e.g. Choji, Rock Lee, Jiraiya…"
          style={{
            flex: 1, background: '#1e293b', border: '1px solid #334155',
            borderRadius: 6, padding: '8px 12px', color: '#f1f5f9',
            fontSize: '0.875rem', outline: 'none',
          }}
        />
        <button
          onClick={search}
          disabled={loading}
          style={{
            background: '#f97316', color: '#fff', border: 'none',
            borderRadius: 6, padding: '8px 20px', fontWeight: 700,
            cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1,
            fontSize: '0.875rem',
          }}
        >
          {loading ? '…' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {results.map(char => (
            <div
              key={char.id}
              onClick={() => copy(char.image.large, char.name.full)}
              style={{
                background: '#0f172a', border: `1px solid ${copied === char.image.large ? '#f97316' : '#1e293b'}`,
                borderRadius: 8, padding: '0.75rem', cursor: 'pointer',
                width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                transition: 'border-color 0.15s',
              }}
              title="Click to copy"
            >
              <img
                src={char.image.large}
                alt={char.name.full}
                style={{ width: 80, height: 80, objectFit: 'cover', objectPosition: 'top', borderRadius: 4 }}
              />
              <div style={{ color: '#f1f5f9', fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.3 }}>
                {char.name.full}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.6rem', textAlign: 'center' }}>
                {char.name.native}
              </div>
              <div style={{
                color: copied === char.image.large ? '#f97316' : '#475569',
                fontSize: '0.65rem', fontWeight: 700,
              }}>
                {copied === char.image.large ? '✓ Copied!' : 'Click to copy'}
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !loading && query && (
        <p style={{ color: '#475569', fontSize: '0.75rem' }}>No results found.</p>
      )}
    </div>
  )
}
