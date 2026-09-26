import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOSStore } from '../../store/useOSStore.js'
import { questLetter } from '../../data/questLetter.js'

const SECRET_NICKNAME = 'panda'
const HEART_COUNT = 7
const README_FILE_NAME = 'README_FOR_RIMOS.md'

const letterBodyVariants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.45, staggerChildren: 0.22 },
  },
}

const letterLineVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

function normalizeValue(value) {
  return value.trim().toLowerCase()
}

function createReadmeContent() {
  const dateLabel = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `# README_FOR_RIMOS

## Build: RIMos Birthday Edition

Created on: ${dateLabel}

---

RIMos is not a generic template.
It was built memory by memory, joke by joke, and bug by bug.

## Why this exists
- To celebrate you in a way that feels personal
- To show real effort through code and details
- To preserve our normal moments that are actually special

## Included in this release
- Quest with a hidden nickname challenge
- Custom desktop flow and easter eggs
- A sealed envelope with a letter written for you

## Patch notes
- feat: made the experience handcrafted
- fix: reduced boring birthday pages to zero
- chore: saved this memory in source control forever

Happy Birthday 🎉
`
}

function FloatingHearts() {
  return (
    <span className="quest-hearts" aria-hidden="true">
      {Array.from({ length: HEART_COUNT }).map((_item, index) => (
        <span key={index} className="quest-heart">
          ♥
        </span>
      ))}
    </span>
  )
}

function BirthdayQuestApp() {
  const questSolved = useOSStore((state) => state.questSolved)
  const solveQuest = useOSStore((state) => state.solveQuest)

  const [nicknameInput, setNicknameInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [letterOpen, setLetterOpen] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()

    const normalized = normalizeValue(nicknameInput)
    if (normalized !== SECRET_NICKNAME) {
      setErrorMessage('That is not correct. Try again.')
      return
    }

    setErrorMessage('')
    solveQuest(nicknameInput.trim() || 'Panda')
  }

  function handleReadmeDownload() {
    const content = createReadmeContent()
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = README_FILE_NAME
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!questSolved) {
    return (
      <div className="quest-shell">
        <h3>Quest</h3>
        <section className="quest-step">
          <p>Security Challenge</p>
          <h4>What is your nickname?</h4>
          <form className="quest-form" onSubmit={handleSubmit}>
            <input
              value={nicknameInput}
              onChange={(event) => setNicknameInput(event.target.value)}
              placeholder="type your nickname…"
              aria-label="Nickname answer"
            />
            <button type="submit">Submit Answer</button>
          </form>
          {errorMessage ? <p className="quest-error">{errorMessage}</p> : null}
        </section>
      </div>
    )
  }

  return (
    <div className="quest-shell">
      <h3>Quest Complete 🎉</h3>
      <section className="quest-step quest-success">
        <p>
          A letter was left here for <strong>Madhurima</strong>
        </p>
        <p className="quest-muted">
          {letterOpen ? 'Take your time with it.' : 'Sealed until you open it.'}
        </p>

        <div className="quest-letter-stage">
          <AnimatePresence mode="wait" initial={false}>
            {letterOpen ? (
              <motion.article
                key="letter"
                className="quest-letter"
                initial={{ opacity: 0, scaleY: 0.32, y: 26 }}
                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                exit={{ opacity: 0, scaleY: 0.4, y: 18 }}
                transition={{ type: 'spring', stiffness: 130, damping: 17 }}
              >
                <span className="quest-letter-tape" aria-hidden="true" />
                <motion.div
                  className="quest-letter-body"
                  variants={letterBodyVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.p className="quest-letter-date" variants={letterLineVariants}>
                    {questLetter.date}
                  </motion.p>
                  <motion.p className="quest-letter-greeting" variants={letterLineVariants}>
                    {questLetter.greeting}
                  </motion.p>
                  {questLetter.lines.map((line) => (
                    <motion.p key={line} className="quest-letter-line" variants={letterLineVariants}>
                      {line}
                    </motion.p>
                  ))}
                  <motion.p className="quest-letter-closing" variants={letterLineVariants}>
                    {questLetter.closing}
                  </motion.p>
                  <motion.p className="quest-letter-sign" variants={letterLineVariants}>
                    {questLetter.signature}
                  </motion.p>
                  {questLetter.postscript ? (
                    <motion.p className="quest-letter-ps" variants={letterLineVariants}>
                      {questLetter.postscript}
                    </motion.p>
                  ) : null}
                </motion.div>
              </motion.article>
            ) : (
              <motion.button
                key="envelope"
                type="button"
                className="quest-envelope"
                onClick={() => setLetterOpen(true)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -22, scale: 0.9 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                aria-label="Open the letter"
              >
                <span className="quest-envelope-body">
                  <span className="quest-envelope-paper" />
                  <span className="quest-envelope-flap" />
                  <span className="quest-seal">♥</span>
                </span>
                <span className="quest-envelope-hint">Click to open your letter</span>
              </motion.button>
            )}
          </AnimatePresence>
          {letterOpen ? <FloatingHearts /> : null}
        </div>

        <div className="quest-actions">
          {letterOpen ? (
            <button type="button" onClick={() => setLetterOpen(false)}>
              Fold it back
            </button>
          ) : null}
          <button type="button" onClick={handleReadmeDownload}>
            Download {README_FILE_NAME}
          </button>
        </div>
      </section>
    </div>
  )
}

export default BirthdayQuestApp
