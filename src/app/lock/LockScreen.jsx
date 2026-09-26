import { useEffect, useMemo, useState } from 'react'
import { useOSStore } from '../../store/useOSStore.js'

function LockScreen() {
  const unlockSystem = useOSStore((state) => state.unlockSystem)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const intervalId = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Enter') {
        unlockSystem()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [unlockSystem])

  const dateLabel = useMemo(
    () =>
      time.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    [time],
  )

  return (
    <div className="screen lock-screen">
      <div className="lock-card">
        <p className="lock-time">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p>{dateLabel}</p>
        <p className="lock-quote">“Built with overthinking, chai, and care.”</p>
        <button type="button" className="lock-unlock" onClick={unlockSystem}>
          <span className="lock-unlock-sheen" aria-hidden="true" />
          <span className="lock-unlock-icon" aria-hidden="true" />
          <span className="lock-unlock-label">Unlock RIMos</span>
          <span className="lock-unlock-arrow" aria-hidden="true">
            →
          </span>
        </button>
        <p className="lock-hint">
          or press <kbd>Enter</kbd>
        </p>
      </div>
    </div>
  )
}

export default LockScreen
