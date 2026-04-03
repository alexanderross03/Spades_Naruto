import { CARDS } from '@/lib/cards'
import { CHARACTER_IMAGES, CHARACTER_IMAGE_ADJUSTMENTS } from '@/lib/character-images'
import Card from '@/components/Card'
import SearchTool from './SearchTool'

const SUITS = ['joker', 'spades', 'hearts', 'diamonds', 'clubs'] as const
const SUIT_LABELS: Record<string, string> = {
  joker:    '★ Jokers — Shinobi World',
  spades:   '♠ Spades — Hidden Leaf',
  hearts:   '♥ Hearts — Hidden Sand',
  diamonds: '♦ Diamonds — Akatsuki',
  clubs:    '♣ Clubs — Hidden Mist',
}
const SUIT_COLORS: Record<string, string> = {
  joker:    '#f97316',
  spades:   '#4ade80',
  hearts:   '#fbbf24',
  diamonds: '#f87171',
  clubs:    '#60a5fa',
}

export default function ImagePreviewPage() {
  const withImage = CARDS.filter(c => CHARACTER_IMAGES[c.character])
  const withoutImage = CARDS.filter(c => !CHARACTER_IMAGES[c.character])

  return (
    <div style={{ background: '#0a0f0a', minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        Card Image Preview
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.875rem' }}>
        {withImage.length}/52 cards have portrait images · {withoutImage.length} use faction art fallback
      </p>

      {/* Summary legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Has portrait image</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#475569' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Faction art fallback</span>
        </div>
      </div>

      {/* Cards by suit */}
      {SUITS.map(suit => {
        const suitCards = CARDS.filter(c => c.suit === suit)
        return (
          <div key={suit} style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: SUIT_COLORS[suit], fontSize: '1rem', marginBottom: '1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {SUIT_LABELS[suit]}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {suitCards.map(card => {
                const hasImage = !!CHARACTER_IMAGES[card.character]
                const adj = CHARACTER_IMAGE_ADJUSTMENTS[card.character]
                return (
                  <div key={`${card.suit}-${card.rank}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {/* Status dot */}
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: hasImage ? '#4ade80' : '#475569',
                      alignSelf: 'center',
                    }} />
                    <Card card={card} size="md" />
                    {/* Character name */}
                    <div style={{ color: hasImage ? '#cbd5e1' : '#64748b', fontSize: '0.6rem', textAlign: 'center', maxWidth: 72, lineHeight: 1.3 }}>
                      {card.character}
                    </div>
                    {/* Adjustment hint */}
                    {adj && (
                      <div style={{ color: '#fbbf24', fontSize: '0.55rem' }}>
                        {adj.yShift !== undefined ? `y${adj.yShift > 0 ? '+' : ''}${adj.yShift}` : ''}
                        {adj.xShift !== undefined ? ` x${adj.xShift > 0 ? '+' : ''}${adj.xShift}` : ''}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Missing images list */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', marginTop: '1rem' }}>
        <h2 style={{ color: '#f1f5f9', fontSize: '1rem', marginBottom: '1rem' }}>
          Characters without portrait images ({withoutImage.length})
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '1rem', lineHeight: 1.8 }}>
          These use faction art. To add an image, find the character URL on{' '}
          <span style={{ color: '#60a5fa' }}>s4.anilist.co</span> and add it to{' '}
          <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 3 }}>lib/character-images.ts</code>
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {withoutImage.map(c => (
            <span key={`${c.suit}-${c.rank}`} style={{
              background: '#1e293b', color: '#94a3b8',
              padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem',
              border: '1px solid #334155',
            }}>
              {c.rank} — {c.character}
            </span>
          ))}
        </div>
      </div>

      {/* Crop instructions */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', marginTop: '2rem', maxWidth: 600 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: '1rem', marginBottom: '0.75rem' }}>
          Adjusting image crops
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.8 }}>
          Open <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 3 }}>lib/character-images.ts</code>{' '}
          and edit <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 3 }}>CHARACTER_IMAGE_ADJUSTMENTS</code>.{' '}
          Use <strong style={{ color: '#f1f5f9' }}>yShift</strong> to move the portrait up (negative) or down (positive) within its frame.
          Refresh this page to see changes live.
        </p>
        <pre style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: '1rem', color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.75rem', overflowX: 'auto' }}>{`// lib/character-images.ts
export const CHARACTER_IMAGE_ADJUSTMENTS = {
  'Naruto':  { yShift: -10 }, // shift up — shows more of the top
  'Kakashi': { yShift:  8  }, // shift down — shows lower part
  'Hidan':   { xShift: -5  }, // shift left horizontally
}`}</pre>
      </div>

      <SearchTool />
    </div>
  )
}
