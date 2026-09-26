export const apps = [
  { id: 'memories', name: 'Memories', iconGlyph: 'M', iconTone: 'violet' },
  { id: 'kannada-learn', name: 'Kannada Kali', iconGlyph: 'ಕ', iconTone: 'emerald' },
  { id: 'snack-roulette', name: 'SnackRoulette', iconGlyph: 'S', iconTone: 'amber' },
  { id: 'birthday-quest', name: 'Quest', iconGlyph: 'Q', iconTone: 'rose' },
  { id: 'terminal', name: 'Terminal', iconGlyph: '>', iconTone: 'emerald' },
  { id: 'playlist', name: 'Playlist', iconGlyph: 'P', iconTone: 'indigo' },
  { id: 'achievements', name: 'Roadmap', iconGlyph: 'R', iconTone: 'gold' },
  {
    id: 'build-log',
    name: 'BuildLog',
    iconGlyph: 'B',
    iconTone: 'slate',
    hidden: true,
  },
]

export const desktopFolders = [
  {
    id: 'memories-folder',
    name: 'Favorites',
    iconGlyph: '📁',
    iconTone: 'indigo',
    appIds: ['memories', 'snack-roulette', 'birthday-quest', 'playlist', 'achievements'],
  },
  {
    id: 'utilities-folder',
    name: 'Utilities',
    iconGlyph: '🛠',
    iconTone: 'slate',
    appIds: ['terminal', 'kannada-learn', 'build-log'],
  },
]
