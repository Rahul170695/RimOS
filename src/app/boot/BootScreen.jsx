import { useEffect, useMemo, useState } from 'react'

const bootLines = [
  'Booting RIMos v1.0',
  'Loading memory modules...',
  'Starting laugh-engine...',
  'Compiling surprise payload...',
  'System ready.',
]
const BOOT_LINE_STEP_MS = 1000

const brandExpansion = [
  { tone: 'r', initial: 'R', rest: 'ahul' },
  { tone: 'i', initial: 'I', rest: 'n' },
  { tone: 'm', initial: 'M', rest: 'adhurima\u2019s' },
  { tone: 'o', initial: 'O', rest: 'wn' },
  { tone: 's', initial: 'S', rest: 'pace' },
]

function BootScreen() {
  const [activeLineIndex, setActiveLineIndex] = useState(0)
  const lineCount = bootLines.length

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveLineIndex((index) => Math.min(index + 1, lineCount))
    }, BOOT_LINE_STEP_MS)

    return () => clearInterval(intervalId)
  }, [lineCount])

  const progress = useMemo(() => Math.round((activeLineIndex / lineCount) * 100), [activeLineIndex, lineCount])

  return (
    <div className="screen boot-screen">
      <div className="boot-card">
        <h1 className="boot-title">
          <span className="boot-brand-mark">
            <span className="brand-tone-r">R</span>
            <span className="brand-tone-i">I</span>
            <span className="brand-tone-m">M</span>
          </span>
          <span className="boot-brand-soft">
            <span className="brand-tone-o">o</span>
            <span className="brand-tone-s">s</span>
          </span>{' '}
          v1.0
        </h1>
        <p className="boot-tagline boot-expansion" aria-label="RIMos stands for Rahul In Madhurima's Own Space">
          {brandExpansion.map((word, index) => (
            <span
              key={word.initial + word.rest}
              className="boot-expansion-word"
              style={{ animationDelay: `${0.2 + index * 0.16}s` }}
            >
              <span className={`boot-expansion-initial brand-tone-${word.tone}`}>{word.initial}</span>
              {word.rest}
            </span>
          ))}
          <span className="boot-expansion-heart" aria-hidden="true">
            ♥
          </span>
        </p>
        <div className="boot-lines">
          {bootLines.map((line, index) => (
            <p
              key={line}
              className={`boot-line${index < activeLineIndex ? ' is-loaded' : ''}${
                index === activeLineIndex ? ' is-loading' : ''
              }`}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="boot-progress-wrap" aria-label={`Loading ${progress}%`}>
          <div className="boot-progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="boot-progress-meta">
            <div className="boot-spinner" aria-hidden="true" />
            <small>{progress}%</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BootScreen
