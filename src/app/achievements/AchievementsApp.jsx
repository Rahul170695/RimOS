import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { nextYearGoals } from '../../data/nextYearGoals.js'
import { relationshipMilestones } from '../../data/relationshipMilestones.js'

const STORAGE_KEY = 'rimos-relationship-milestones-v2'
const GOALS_STORAGE_KEY = 'rimos-next-year-goals-v1'

function createInitialGoals() {
  const raw = window.localStorage.getItem(GOALS_STORAGE_KEY)

  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function createInitialProgress() {
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return { unlockedCount: 1 }
  }

  try {
    const parsed = JSON.parse(raw)
    const unlockedCount = Number.isFinite(parsed?.unlockedCount)
      ? Math.min(Math.max(parsed.unlockedCount, 1), relationshipMilestones.length)
      : 1
    return { unlockedCount }
  } catch {
    return { unlockedCount: 1 }
  }
}

function rewardTypeLabel(type) {
  return type === 'video' ? 'Video reward' : 'Photo reward'
}

async function downloadRewardFile(path, fileName) {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Reward file not found at ${path}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function AchievementsApp() {
  const [{ unlockedCount }, setProgress] = useState(createInitialProgress)
  const [downloadErrors, setDownloadErrors] = useState({})
  const [viewIndex, setViewIndex] = useState(0)
  const [tab, setTab] = useState('shipped')
  const [doneGoals, setDoneGoals] = useState(createInitialGoals)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlockedCount }))
  }, [unlockedCount])

  useEffect(() => {
    window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(doneGoals))
  }, [doneGoals])

  const doneGoalCount = nextYearGoals.filter((goal) => doneGoals[goal.id]).length
  const goalPercent = Math.round((doneGoalCount / nextYearGoals.length) * 100)

  function toggleGoal(goalId) {
    setDoneGoals((current) => ({ ...current, [goalId]: !current[goalId] }))
  }

  const progressPercent = useMemo(
    () => Math.round((unlockedCount / relationshipMilestones.length) * 100),
    [unlockedCount],
  )

  const allUnlocked = unlockedCount >= relationshipMilestones.length
  const clampedViewIndex = Math.min(viewIndex, Math.max(unlockedCount - 1, 0))
  const currentMilestone = relationshipMilestones[clampedViewIndex]

  function revealNextChapter() {
    if (allUnlocked) {
      return
    }

    const nextUnlockedCount = Math.min(unlockedCount + 1, relationshipMilestones.length)
    setProgress({ unlockedCount: nextUnlockedCount })
    setViewIndex(nextUnlockedCount - 1)
  }

  function resetTimeline() {
    setProgress({ unlockedCount: 1 })
    setViewIndex(0)
  }

  async function handleRewardDownload(milestone) {
    try {
      setDownloadErrors((current) => ({
        ...current,
        [milestone.id]: '',
      }))
      await downloadRewardFile(milestone.rewardPath, milestone.rewardFileName)
    } catch {
      setDownloadErrors((current) => ({
        ...current,
        [milestone.id]: 'This one is still wrapped. Try again in a bit.',
      }))
    }
  }

  return (
    <div className="achievements-shell">
      <header className="achievements-header">
        <p>RIMos Roadmap</p>
        <h3>{tab === 'shipped' ? 'Already Shipped' : 'Before Your Next Birthday'}</h3>
        <small>
          {tab === 'shipped'
            ? `${unlockedCount}/${relationshipMilestones.length} milestones revealed`
            : `${doneGoalCount}/${nextYearGoals.length} done, the rest is pending`}
        </small>

        <div className="roadmap-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'shipped'}
            className={tab === 'shipped' ? 'is-active' : ''}
            onClick={() => setTab('shipped')}
          >
            Shipped
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'goals'}
            className={tab === 'goals' ? 'is-active' : ''}
            onClick={() => setTab('goals')}
          >
            Up Next
          </button>
        </div>
      </header>

      {tab === 'goals' ? (
        <>
          <div className="achievement-overall-progress" aria-label="goal progress">
            <span style={{ width: `${goalPercent}%` }} />
          </div>

          <p className="roadmap-goal-note">
            {doneGoalCount === nextYearGoals.length
              ? 'Every single one done. Look at us actually finishing things.'
              : 'The list I keep bringing up. Tick one off and I stop arguing about it.'}
          </p>

          <ul className="goal-list">
            {nextYearGoals.map((goal) => {
              const isDone = Boolean(doneGoals[goal.id])

              return (
                <li key={goal.id}>
                  <button
                    type="button"
                    className={`goal-item${isDone ? ' is-done' : ''}`}
                    onClick={() => toggleGoal(goal.id)}
                    aria-pressed={isDone}
                  >
                    <span className="goal-check" aria-hidden="true">
                      {isDone ? '✓' : ''}
                    </span>
                    <span className="goal-icon" aria-hidden="true">
                      {goal.icon}
                    </span>
                    <span className="goal-copy">
                      <strong>{goal.title}</strong>
                      <small>{goal.line}</small>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <>
          <div className="achievement-overall-progress" aria-label="timeline reveal progress">
            <span style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="timeline-toolbar">
        <div className="timeline-nav-group">
          <button
            type="button"
            onClick={() => setViewIndex((current) => Math.max(current - 1, 0))}
            disabled={clampedViewIndex === 0}
          >
            Previous
          </button>
          <small>
            {clampedViewIndex + 1} / {unlockedCount}
          </small>
          <button
            type="button"
            onClick={() => setViewIndex((current) => Math.min(current + 1, unlockedCount - 1))}
            disabled={clampedViewIndex >= unlockedCount - 1}
          >
            Next
          </button>
        </div>

        <div className="timeline-action-group">
          <button type="button" onClick={revealNextChapter} className="timeline-next-button" disabled={allUnlocked}>
            {allUnlocked ? 'All revealed 💖' : 'Reveal next'}
          </button>
          <button type="button" onClick={resetTimeline} className="timeline-reset-button">
            Restart
          </button>
        </div>
      </div>

      <div className="timeline-stage">
        <motion.article
          key={currentMilestone.id}
          className={`timeline-card is-unlocked${currentMilestone.cinematic ? ' is-cinematic' : ''}`}
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.26, ease: 'easeOut' }}
        >
          <div className="timeline-card-head">
            <span className="timeline-badge" aria-hidden="true">
              {currentMilestone.icon}
            </span>
            <div>
                <small>Milestone {clampedViewIndex + 1}</small>
              <h4 className="timeline-title">{currentMilestone.title}</h4>
            </div>
            <span className="timeline-chip is-open">Unlocked</span>
          </div>

          <p className="timeline-one-line">{currentMilestone.oneLine}</p>
          {currentMilestone.cinematicLine ? (
            <p className="timeline-cinematic-line">{currentMilestone.cinematicLine}</p>
          ) : null}

          <div className="timeline-reward-download">
            <p>{rewardTypeLabel(currentMilestone.rewardType)}</p>
            <small>{currentMilestone.rewardFileName}</small>
            <button type="button" onClick={() => handleRewardDownload(currentMilestone)}>
              Download reward
            </button>
            {downloadErrors[currentMilestone.id] ? (
              <small className="timeline-reward-error">{downloadErrors[currentMilestone.id]}</small>
            ) : null}
              </div>
            </motion.article>
          </div>
        </>
      )}
    </div>
  )
}

export default AchievementsApp
