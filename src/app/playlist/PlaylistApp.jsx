import { useEffect, useState } from 'react'
import { reelLinks, reelNotes } from '../../data/playlist.js'

const AUTO_SHUFFLE_MS = 30000

const readyReels = reelLinks
  .map((link) => (typeof link === 'string' ? link.trim() : ''))
  .filter((link) => /^https:\/\/www\.instagram\.com\/reels?\/[A-Za-z0-9_-]+/.test(link))
  .map((link, index) => ({
    id: `reel-${index + 1}`,
    title: `Her reel ${index + 1}`,
    url: link,
  }))

function buildEmbedUrl(url) {
  const cleanUrl = url.split('?')[0].replace(/\/+$/, '')
  return `${cleanUrl}/embed/`
}

function pickRandomFrom(list, excludeId = null) {
  if (!list.length) {
    return null
  }

  const pool = excludeId ? list.filter((item) => item.id !== excludeId) : list
  const source = pool.length ? pool : list

  return source[Math.floor(Math.random() * source.length)]
}

function pickRandomNote(currentNote = null) {
  if (!reelNotes.length) {
    return ''
  }

  const pool = reelNotes.filter((note) => note !== currentNote)
  const source = pool.length ? pool : reelNotes

  return source[Math.floor(Math.random() * source.length)]
}

function PlaylistApp() {
  const [currentReel, setCurrentReel] = useState(() => pickRandomFrom(readyReels))
  const [note, setNote] = useState(() => pickRandomNote())
  const [autoShuffle, setAutoShuffle] = useState(true)
  const currentReelId = currentReel?.id ?? null

  useEffect(() => {
    if (!autoShuffle || readyReels.length < 2) {
      return undefined
    }

    const timer = setInterval(() => {
      setCurrentReel((current) => pickRandomFrom(readyReels, current?.id))
      setNote((current) => pickRandomNote(current))
    }, AUTO_SHUFFLE_MS)

    return () => clearInterval(timer)
  }, [autoShuffle, currentReelId])

  if (!currentReel) {
    return (
      <div className="stack">
        <h3>Her Voice</h3>
        <p>Warming up the mic. Your songs land here very soon.</p>
      </div>
    )
  }

  function showAnotherReel() {
    setCurrentReel((current) => pickRandomFrom(readyReels, current?.id))
    setNote((current) => pickRandomNote(current))
  }

  return (
    <div className="playlist-reels">
      <div className="playlist-head">
        <h3>Her Voice</h3>
        <small>Hit play and let my favourite singer take over the room.</small>
      </div>

      <div className="reel-frame-wrap">
        <iframe
          key={currentReel.id}
          title={currentReel.title}
          src={buildEmbedUrl(currentReel.url)}
          className="reel-iframe"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {note ? <p className="playlist-caption">{note}</p> : null}

      <div className="playlist-actions">
        <button type="button" onClick={showAnotherReel} className="playlist-random-button">
          🎧 Play Another One
        </button>
        <button
          type="button"
          onClick={() => setAutoShuffle((current) => !current)}
          className={`playlist-switch${autoShuffle ? ' is-on' : ''}`}
          aria-pressed={autoShuffle}
        >
          <span className="playlist-switch-track" aria-hidden="true">
            <span className="playlist-switch-knob" />
          </span>
          <span className="playlist-switch-label">Auto shuffle</span>
          <span className="playlist-switch-state">{autoShuffle ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  )
}

export default PlaylistApp
