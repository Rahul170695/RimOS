import { useState } from 'react'
import { memories } from '../../data/memories.js'
import { useOSStore } from '../../store/useOSStore.js'

function MemoryMedia({ memory }) {
  const [brokenImage, setBrokenImage] = useState(false)
  const showImage = Boolean(memory.image) && !brokenImage

  return (
    <div className="memory-media" style={memory.ratio ? { aspectRatio: memory.ratio } : undefined}>
      {showImage ? (
        <img
          src={memory.image}
          alt={memory.title}
          onError={() => setBrokenImage(true)}
          loading="lazy"
          style={memory.focus ? { objectPosition: memory.focus } : undefined}
        />
      ) : (
        <div className="memory-placeholder">Saved in my head, printing soon</div>
      )}
    </div>
  )
}

function MemoryCard({ memory }) {
  return (
    <article className="memory-card">
      <div className="memory-shot">
        <MemoryMedia memory={memory} />
        <span className="memory-chip">{memory.tag ?? 'Memory'}</span>
      </div>
      <div className="memory-copy">
        <h3>{memory.title}</h3>
        <p>{memory.caption}</p>
      </div>
    </article>
  )
}

function MemoriesApp() {
  const [jarPick, setJarPick] = useState(null)
  const trackMemoryJarPull = useOSStore((state) => state.trackMemoryJarPull)

  function pickRandomMemory() {
    const randomItem = memories[Math.floor(Math.random() * memories.length)]
    setJarPick(randomItem)
    trackMemoryJarPull()
  }

  return (
    <div className="stack">
      <section className="memory-jar">
        <h3>Memory Jar</h3>
        <p className="memory-jar-note">Pick one random tiny moment.</p>
        <button type="button" className="memory-jar-button" onClick={pickRandomMemory}>
          🫙 Pull a memory
        </button>

        {jarPick ? (
          <article className="memory-jar-result">
            <MemoryMedia key={jarPick.title} memory={jarPick} />
            <div className="memory-jar-copy">
              <p className="memory-jar-tag">{jarPick.tag ?? 'Memory'}</p>
              <h4>{jarPick.title}</h4>
              <p>{jarPick.caption}</p>
              {jarPick.date ? <small>{jarPick.date}</small> : null}
            </div>
          </article>
        ) : null}
      </section>

      <div className="panel-grid">
        {memories.map((memory) => (
          <MemoryCard key={memory.title} memory={memory} />
        ))}
      </div>
    </div>
  )
}

export default MemoriesApp
