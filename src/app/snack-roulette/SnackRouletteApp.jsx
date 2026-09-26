import { useEffect, useRef, useState } from 'react'
import { snackRouletteItems } from '../../data/snackRoulette.js'
import { useOSStore } from '../../store/useOSStore.js'

const SPIN_ANIMATION_MS = 900
const IMAGE_PRELOAD_TIMEOUT_MS = 2200

function pickRandomItem() {
  return snackRouletteItems[Math.floor(Math.random() * snackRouletteItems.length)]
}

function randomSpinCount() {
  return Math.floor(Math.random() * 900) + 100
}

function waitFor(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function preloadImage(src, timeoutMs = IMAGE_PRELOAD_TIMEOUT_MS) {
  if (!src) {
    return Promise.resolve({ failed: true })
  }

  return new Promise((resolve) => {
    let settled = false
    const image = new Image()
    const timeoutId = window.setTimeout(() => {
      if (settled) {
        return
      }

      settled = true
      resolve({ failed: true })
    }, timeoutMs)

    image.onload = () => {
      if (settled) {
        return
      }

      settled = true
      window.clearTimeout(timeoutId)
      resolve({ failed: false })
    }

    image.onerror = () => {
      if (settled) {
        return
      }

      settled = true
      window.clearTimeout(timeoutId)
      resolve({ failed: true })
    }

    image.src = src
  })
}

function SnackRouletteApp() {
  const trackSnackSpin = useOSStore((state) => state.trackSnackSpin)
  const [selected, setSelected] = useState(() => pickRandomItem())
  const [brokenImage, setBrokenImage] = useState(false)
  const [spinCount, setSpinCount] = useState(() => randomSpinCount())
  const [isSpinning, setIsSpinning] = useState(false)
  const spinRequestRef = useRef(0)
  const isAliveRef = useRef(true)

  useEffect(() => {
    isAliveRef.current = true

    return () => {
      isAliveRef.current = false
      spinRequestRef.current += 1
    }
  }, [])

  async function handleSpin() {
    if (isSpinning) {
      return
    }

    const requestId = spinRequestRef.current + 1
    spinRequestRef.current = requestId

    let nextPick = pickRandomItem()
    if (snackRouletteItems.length > 1 && nextPick.title === selected.title) {
      nextPick = pickRandomItem()
    }

    setIsSpinning(true)
    setSpinCount(randomSpinCount())

    const [imageState] = await Promise.all([preloadImage(nextPick.image), waitFor(SPIN_ANIMATION_MS)])

    if (isAliveRef.current && spinRequestRef.current === requestId) {
      setSelected(nextPick)
      setBrokenImage(imageState.failed)
      setIsSpinning(false)
      trackSnackSpin()
    }
  }

  return (
    <div className="snack-roulette">
      <div className="snack-roulette-header">
        <h3>SnackRoulette</h3>
        <p className="snack-welcome">
          Welcome to my favourite POV of any day. You, a plate of something good, and that happy
          face.
        </p>
        <small>Spin for one very accurate you-and-food fact.</small>
      </div>

      <article className="snack-card">
        <div className="snack-media">
          {isSpinning ? (
            <div className="snack-loading-view">
              <span className="snack-loading-panda" aria-hidden="true">
                🐼
              </span>
              <p>Panda is spinning the next snack...</p>
            </div>
          ) : selected.image && !brokenImage ? (
            <img
              src={selected.image}
              alt={selected.title}
              onError={() => setBrokenImage(true)}
              loading="lazy"
            />
          ) : (
            <div className="snack-placeholder">Photo missing. The memory is not.</div>
          )}
        </div>

        <div className="snack-content">
          <p className="snack-chip">Spin #{spinCount}</p>
          <h4>{selected.title}</h4>
          <p className="snack-note">{selected.note}</p>
        </div>
      </article>

      <div className="snack-actions">
        <button type="button" onClick={handleSpin} className="snack-spin-button" disabled={isSpinning}>
          <span className={`snack-panda${isSpinning ? ' is-spinning' : ''}`} aria-hidden="true">
            🐼
          </span>
          <span>{isSpinning ? 'Spinning...' : 'Spin Again'}</span>
        </button>
      </div>
    </div>
  )
}

export default SnackRouletteApp
