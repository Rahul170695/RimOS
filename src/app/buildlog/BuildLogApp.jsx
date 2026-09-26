const entries = [
  'phase/boot -> lock handoff stable',
  'desktop window drag latency: 16ms avg',
  'palette route unlocked for advanced users',
  'sound hooks online (safe no-asset mode)',
]

function BuildLogApp() {
  return (
    <div className="stack">
      <h3>BuildLog</h3>
      <p>Internal notes from the latest RimOS iteration.</p>
      <ul className="badge-list">
        {entries.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
    </div>
  )
}

export default BuildLogApp
