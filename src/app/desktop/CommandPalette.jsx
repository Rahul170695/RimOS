import { useMemo } from 'react'

function CommandPalette({ open, query, setQuery, entries, onSelect, onClose }) {
  const filteredEntries = useMemo(() => {
    const text = query.trim().toLowerCase()
    if (!text) {
      return entries
    }

    return entries.filter((entry) => `${entry.label} ${entry.keywords}`.toLowerCase().includes(text))
  }, [entries, query])

  if (!open) {
    return null
  }

  return (
    <div className="palette-overlay" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="palette-card">
        <div className="palette-header">
          <strong>Command Palette</strong>
          <button type="button" onClick={onClose} aria-label="Close command palette">
            Esc
          </button>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="search apps, memories, anything…"
          autoFocus
          aria-label="Command search input"
        />
        <div className="palette-list">
          {filteredEntries.length ? (
            filteredEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="palette-item"
                onClick={() => onSelect(entry)}
              >
                <span>{entry.label}</span>
                <small>{entry.hint}</small>
              </button>
            ))
          ) : (
            <p className="palette-empty">No matches found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
