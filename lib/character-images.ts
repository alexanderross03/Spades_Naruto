// Character portrait URLs from AniList CDN (s4.anilist.co)
// Keyed by the character name as it appears in lib/cards.ts
// Characters without a confirmed URL fall back to faction SVG art
//
// LOCAL OVERRIDES: drop an image into /public/characters/ using the
// filename from CHARACTER_LOCAL_FILES below and it will be used instead
// of the AniList URL. Supported formats: .png .jpg .webp

// Maps character name → local filename (relative to /public/characters/)
export const CHARACTER_LOCAL_FILES: Record<string, string> = {
  'Naruto':       'naruto',
  'Minato':       'minato',
  'Tsunade':      'tsunade',
  'Kakashi':      'kakashi',
  'Sasuke':       'sasuke',
  'Sakura':       'sakura',
  'Rock Lee':     'rock-lee',
  'Neji':         'neji',
  'Hinata':       'hinata',
  'Shikamaru':    'shikamaru',
  'Choji':        'choji',
  'Ino':          'ino',
  'Might Guy':    'might-guy',
  'Gaara':        'gaara',
  '4th Kazekage': '4th-kazekage',
  'Temari':       'temari',
  'Kankuro':      'kankuro',
  'Chiyo':        'chiyo',
  'Pakura':       'pakura',
  'Gari':         'gari',
  'Baki':         'baki',
  'Toroi':        'toroi',
  'Yugito':       'yugito',
  'Han':          'han',
  'Fū':           'fu',
  'Pain':         'pain',
  'Obito':        'obito',
  'Konan':        'konan',
  'Itachi':       'itachi',
  'Kabuto':       'kabuto',
  'Orochimaru':   'orochimaru',
  'Hidan':        'hidan',
  'Kakuzu':       'kakuzu',
  'Zetsu':        'zetsu',
  'Tobi':         'tobi',
  'Sasori':       'sasori',
  'Deidara':      'deidara',
  'Madara':       'madara',
  'Zabuza':       'zabuza',
  'Yagura':       'yagura',
  'Mei':          'mei',
  'Mangetsu':     'mangetsu',
  'Suigetsu':     'suigetsu',
  'Chojuro':      'chojuro',
  'Ao':           'ao',
  'Utakata':      'utakata',
  'Kisame':       'kisame',
  'Tobirama':     'tobirama',
  'Gengetsu':     'gengetsu',
  'Kagami':       'kagami',
  'Haku':         'haku',
}

// Per-character image adjustments.
// yShift: positive = shift image DOWN (shows lower part), negative = shift image UP (shows more head/top)
// Tweak these values in the /image-preview page to fine-tune crops.
export const CHARACTER_IMAGE_ADJUSTMENTS: Record<string, { yShift?: number; xShift?: number }> = {
  // Examples — uncomment and edit to adjust:
  // 'Naruto': { yShift: -10 },   // shift up 10px to show top of face
  // 'Kakashi': { yShift: 5 },    // shift down 5px
}

// ── Local screenshot overrides ────────────────────────────────────────────
// Drop your screenshot into /public/characters/ using the filename from
// CHARACTER_LOCAL_FILES above, then uncomment the matching line below.
// Local images take priority over the AniList CDN URLs.
// Example: you saved "naruto.png" → uncomment 'Naruto' line below.
export const LOCAL_IMAGE_OVERRIDES: Record<string, string> = {
  'Naruto':    '/characters/naruto.png',
  'Sasuke':    '/characters/sasuke.png',
  'Might Guy': '/characters/might-guy.png',
  'Choji':     '/characters/choji.png',
  'Obito':     '/characters/obito.png',
  'Tobi':      '/characters/tobi.png',
  'Zetsu':     '/characters/zetsu.png',
  // add more lines here as you drop files in — e.g.:
  // 'Kakashi':   '/characters/kakashi.png',
  // 'Gaara':     '/characters/gaara.png',
}

export const CHARACTER_IMAGES: Record<string, string> = {
  // ── Jokers ────────────────────────────────────────────────────────
  // 'Naruto' and 'Sasuke' entries below also cover the joker cards

  // ── Spades / Hidden Leaf ──────────────────────────────────────────
  'Naruto':     'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png',
  'Minato':     'https://s4.anilist.co/file/anilistcdn/character/large/b2535-Xq9WKNPJQEt3.png',
  'Tsunade':    'https://s4.anilist.co/file/anilistcdn/character/large/b2767-r61Cj9v8I0wl.png',
  'Kakashi':    'https://s4.anilist.co/file/anilistcdn/character/large/b85-mkVBh2yjxjmx.png',
  'Sasuke':     'https://s4.anilist.co/file/anilistcdn/character/large/b13-SISLEw1oAD7a.png',
  'Sakura':     'https://s4.anilist.co/file/anilistcdn/character/large/b145-IorfpI8arxeX.png',
  'Rock Lee':   'https://s4.anilist.co/file/anilistcdn/character/large/b306-oUTOO45xInXt.png',
  'Neji':       'https://s4.anilist.co/file/anilistcdn/character/large/b1694-TL4obouDwJ7k.jpg',
  'Hinata':     'https://s4.anilist.co/file/anilistcdn/character/large/b1555-Q41GLTV3FvYF.png',
  'Shikamaru':  'https://s4.anilist.co/file/anilistcdn/character/large/b2007-QaesJlIZDifj.jpg',
  'Ino':        'https://s4.anilist.co/file/anilistcdn/character/large/b2009-H7n38Ns1fr0Y.jpg',
  'Might Guy':  'https://s4.anilist.co/file/anilistcdn/character/large/b307-xieUEdhdTVwQ.png',

  // ── Hearts / Hidden Sand ──────────────────────────────────────────
  'Gaara':      'https://s4.anilist.co/file/anilistcdn/character/large/b1662-4E5J0LX9jZKZ.png',
  'Temari':     'https://s4.anilist.co/file/anilistcdn/character/large/b2174-XTX0TtzkZCnO.png',
  'Kankuro':    'https://s4.anilist.co/file/anilistcdn/character/large/n4694-2brvNKpdqARU.png',

  // ── Diamonds / Akatsuki ───────────────────────────────────────────
  'Pain':       'https://s4.anilist.co/file/anilistcdn/character/large/b3180-ITMGBLWNBOgV.png',
  'Obito':      'https://s4.anilist.co/file/anilistcdn/character/large/72221.jpg',
  'Madara':     'https://s4.anilist.co/file/anilistcdn/character/large/b53901-HnRKSoHMG5Vg.png',
  'Konan':      'https://s4.anilist.co/file/anilistcdn/character/large/3179-YVD5zJSYrnPg.jpg',
  'Itachi':     'https://s4.anilist.co/file/anilistcdn/character/large/b14-9Kb1E5oel1ke.png',
  'Kabuto':     'https://s4.anilist.co/file/anilistcdn/character/large/b2405-CqbcGW2tfaMV.png',
  'Orochimaru': 'https://s4.anilist.co/file/anilistcdn/character/large/n2455-V9tLMS3TIgJW.png',
  'Hidan':      'https://s4.anilist.co/file/anilistcdn/character/large/b2792-lyvtbiT4COp0.jpg',
  'Kakuzu':     'https://s4.anilist.co/file/anilistcdn/character/large/b3178-fCqs5wyV0dlJ.jpg',
  'Sasori':     'https://s4.anilist.co/file/anilistcdn/character/large/b1900-Dpd9wVWtlvIx.png',
  'Deidara':    'https://s4.anilist.co/file/anilistcdn/character/large/b1902-JsEFRFwjmtZJ.png',

  // ── Clubs / Hidden Mist ───────────────────────────────────────────
  'Zabuza':     'https://s4.anilist.co/file/anilistcdn/character/large/b728-zHw77BzLzQKT.jpg',
  'Haku':       'https://s4.anilist.co/file/anilistcdn/character/large/b385-pKGCy3oYWxRa.png',
  'Suigetsu':   'https://s4.anilist.co/file/anilistcdn/character/large/1903.jpg',
  'Kisame':     'https://s4.anilist.co/file/anilistcdn/character/large/2672-oxbHx8n3N7WY.jpg',
  'Tobirama':   'https://s4.anilist.co/file/anilistcdn/character/large/n12465-y8ByDAvzC5cA.png',
  'Mei':        'https://s4.anilist.co/file/anilistcdn/character/large/b23478-U7n8YUe2gFDW.png',
}
