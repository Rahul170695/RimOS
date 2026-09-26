import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AchievementsApp from '../achievements/AchievementsApp.jsx'
import { useSoundEffects } from '../audio/useSoundEffects.js'
import BuildLogApp from '../buildlog/BuildLogApp.jsx'
import KannadaLearnApp from '../kannada/KannadaLearnApp.jsx'
import MemoriesApp from '../memories/MemoriesApp.jsx'
import PlaylistApp from '../playlist/PlaylistApp.jsx'
import BirthdayQuestApp from '../quest/BirthdayQuestApp.jsx'
import SnackRouletteApp from '../snack-roulette/SnackRouletteApp.jsx'
import TerminalApp from '../terminal/TerminalApp.jsx'
import { apps, desktopFolders } from '../../data/apps.js'
import { useOSStore } from '../../store/useOSStore.js'
import AppIcon from './AppIcon.jsx'
import CommandPalette from './CommandPalette.jsx'
import WindowShell from './WindowShell.jsx'

const THEME_OPTIONS = [
  { id: 'night', label: 'Night Sky' },
  { id: 'day', label: 'Soft Day' },
  { id: 'pink', label: 'Pink Bloom' },
  { id: 'cozy', label: 'Cozy Cafe' },
]
const BIRTHDAY_MONTH_INDEX = 8
const BIRTHDAY_DAY = 30
const BIRTHDAY_AGE = 27
const BIRTHDAY_PHOTO = '/memories/birthday-girl.jpg'
const FINAL_CONFETTI = ['♥', '✦', '♥', '✧', '♥', '✦', '♥', '✧', '♥']

const DESKTOP_BLOBS = [
  { id: 'blob-rose', x: '4%', y: '14%', size: '300px', tint: 'rgba(255, 150, 210, 0.32)', duration: '15s', delay: '0s' },
  { id: 'blob-blue', x: '66%', y: '4%', size: '340px', tint: 'rgba(130, 168, 255, 0.28)', duration: '18s', delay: '-4s' },
  { id: 'blob-warm', x: '28%', y: '58%', size: '380px', tint: 'rgba(255, 206, 150, 0.22)', duration: '21s', delay: '-8s' },
  { id: 'blob-mint', x: '76%', y: '54%', size: '250px', tint: 'rgba(150, 236, 214, 0.2)', duration: '17s', delay: '-2s' },
  { id: 'blob-lilac', x: '42%', y: '2%', size: '220px', tint: 'rgba(196, 166, 255, 0.24)', duration: '24s', delay: '-11s' },
  { id: 'blob-peach', x: '2%', y: '68%', size: '260px', tint: 'rgba(255, 178, 176, 0.2)', duration: '19s', delay: '-6s' },
]

const DESKTOP_DOODLES = [
  { id: 'doodle-heart', glyph: '💗', x: '18%', y: '12%', size: '1.15rem', duration: '7s', delay: '0s' },
  { id: 'doodle-star', glyph: '✦', x: '42%', y: '20%', size: '0.95rem', duration: '9s', delay: '-1.5s' },
  { id: 'doodle-sparkle', glyph: '✧', x: '62%', y: '38%', size: '1.05rem', duration: '8s', delay: '-3s' },
  { id: 'doodle-flower', glyph: '🌸', x: '12%', y: '56%', size: '1.2rem', duration: '10s', delay: '-2s' },
  { id: 'doodle-cloud', glyph: '☁️', x: '80%', y: '18%', size: '1.35rem', duration: '13s', delay: '-5s' },
  { id: 'doodle-paw', glyph: '🐾', x: '34%', y: '78%', size: '1rem', duration: '11s', delay: '-4s' },
  { id: 'doodle-moon', glyph: '✩', x: '88%', y: '72%', size: '1.1rem', duration: '8.5s', delay: '-6s' },
  { id: 'doodle-tiny-star', glyph: '✦', x: '70%', y: '84%', size: '0.8rem', duration: '9.5s', delay: '-7s' },
  { id: 'doodle-mini-heart', glyph: '♡', x: '54%', y: '58%', size: '1rem', duration: '12s', delay: '-3.5s' },
  { id: 'doodle-soft-cloud', glyph: '☁️', x: '8%', y: '34%', size: '1.1rem', duration: '16s', delay: '-9s' },
]

const PANDA_TAP_LINES = [
  'Boop accepted ✨',
  'Sending cute vibes 💖',
  'You clicked me, I am happy now 🐾',
  'Panda says: snack break soon?',
  'One boop, full battery 🔋',
  'That tickled a little 🐼',
  'Official panda approval granted ✅',
  'Boop counter went up by one 📈',
  'Yes? I was listening the whole time 👂',
  'Do it again, I liked that 💫',
  'You found the softest button 🩷',
  'Panda status: extremely fine 🌈',
  'Bonus cuteness loaded 🍬',
  'Reporting for duty, captain 🫡',
  'I was just thinking about snacks 🍪',
  'Paw five! 🐾',
  'Tiny panda dance in progress 🎶',
  'Boop received, mood improved 📊',
  'Consider me your desktop buddy 💻',
  'Happiness meter: full 💗',
  'Careful, I am very boopable 😌',
  'Best click of the day so far ⭐',
  'I will pretend I was busy 🧾',
  'Panda cache cleared, feeling fresh 🫧',
]

const PANDA_IDLE_LINES = [
  'I am here with you 🐼',
  'Just sitting here being cute 🩷',
  'Take your time, I am not going anywhere ✨',
  'Panda on standby 🐾',
  'Everything looks good from here 👀',
  'Keeping this corner warm ☕',
  'Quietly cheering for you 📣',
  'No notifications, only vibes 🌸',
  'Still your favourite desktop pet, right? 💫',
  'Waiting for the next fun click 🖱️',
]

const PANDA_SLEEP_LINES = [
  'Panda is napping... tap to wake me 💤',
  'Power saving mode, tap me 😴',
  'Dreaming about snacks... 🍡',
  'Five more minutes, then tap me 🛏️',
  'Sleep mode on, cuteness still running 💤',
]

const PANDA_WAKE_LINES = [
  'I am awake again, hi hi! 🌞',
  'Nap over, panda rebooted ⚡',
  'Oh! You are here. Hello 👋',
  'Stretching... okay, ready 🐾',
  'Back online and fully cute 💖',
]

const PANDA_OPEN_LINES = [
  'Opening something fun ✨',
  'Good pick, this one is nice 🌟',
  'Loading the good stuff 🍰',
  'Ooh, my favourite app 💫',
  'Let us see what is inside 🎁',
  'Window incoming 🪟',
]

const PANDA_REOPEN_LINES = [
  'Welcome back to this app 👋',
  'Missed this one, huh? 💗',
  'Right where you left it ✨',
  'Back again, I kept it safe 🐾',
  'Returning to your window 🪟',
]

const PANDA_CLOSE_LINES = [
  'Window closed neatly ✅',
  'Tidy desktop, tidy mind ✨',
  'Saved and put away 📦',
  'That one is resting now 😌',
  'Closed it for you 🐾',
]

const PANDA_PALETTE_LINES = [
  'Command mode activated ⚡',
  'Type anything, I will find it 🔍',
  'Shortcut queen at work 👑',
  'Power user mode on 💻',
]

const PANDA_RETURN_LINES = [
  'You are back. I missed you ✨',
  'Oh good, you returned 💖',
  'I kept everything ready for you 🐾',
  'Welcome back to RIMos 🌸',
]

function appRenderer(appId, revealSurprise) {
  switch (appId) {
    case 'memories':
      return <MemoriesApp />
    case 'kannada-learn':
      return <KannadaLearnApp />
    case 'snack-roulette':
      return <SnackRouletteApp />
    case 'birthday-quest':
      return <BirthdayQuestApp />
    case 'terminal':
      return <TerminalApp onRevealSurprise={revealSurprise} />
    case 'playlist':
      return <PlaylistApp />
    case 'achievements':
      return <AchievementsApp />
    case 'build-log':
      return <BuildLogApp />
    default:
      return null
  }
}

function randomFrom(list, exclude) {
  const options = list.length > 1 ? list.filter((item) => item !== exclude) : list
  return options[Math.floor(Math.random() * options.length)]
}

function loadInitialTheme() {
  const savedTheme = window.localStorage.getItem('rimos-theme')
  if (savedTheme && THEME_OPTIONS.some((option) => option.id === savedTheme)) {
    return savedTheme
  }

  return 'night'
}

function padNumber(value) {
  return `${value}`.padStart(2, '0')
}

function getBirthdayCountdown(dateValue) {
  const birthdayThisYear = new Date(dateValue.getFullYear(), BIRTHDAY_MONTH_INDEX, BIRTHDAY_DAY, 0, 0, 0, 0)
  const isBirthdayToday =
    dateValue.getMonth() === BIRTHDAY_MONTH_INDEX && dateValue.getDate() === BIRTHDAY_DAY
  const nextBirthdayDate =
    dateValue.getTime() >= birthdayThisYear.getTime()
      ? new Date(dateValue.getFullYear() + 1, BIRTHDAY_MONTH_INDEX, BIRTHDAY_DAY)
      : birthdayThisYear
  const previousBirthdayDate = new Date(
    nextBirthdayDate.getFullYear() - 1,
    BIRTHDAY_MONTH_INDEX,
    BIRTHDAY_DAY,
  )

  const totalSecondsLeft = Math.max(0, Math.floor((nextBirthdayDate.getTime() - dateValue.getTime()) / 1000))
  const daysLeft = Math.floor(totalSecondsLeft / (24 * 60 * 60))
  const hoursLeft = Math.floor((totalSecondsLeft % (24 * 60 * 60)) / (60 * 60))
  const minutesLeft = Math.floor((totalSecondsLeft % (60 * 60)) / 60)
  const secondsLeft = totalSecondsLeft % 60

  const cycleMs = nextBirthdayDate.getTime() - previousBirthdayDate.getTime()
  const elapsedMs = dateValue.getTime() - previousBirthdayDate.getTime()
  const yearProgress = Math.min(1, Math.max(0, elapsedMs / cycleMs))

  return {
    daysLeft,
    hoursLeft,
    minutesLeft,
    secondsLeft,
    isBirthdayToday,
    yearProgress,
    progressPercent: Math.round(yearProgress * 100),
    timerLabel: `${daysLeft}d ${padNumber(hoursLeft)}:${padNumber(minutesLeft)}:${padNumber(secondsLeft)}`,
    nextBirthdayDate,
  }
}

function Desktop() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState('')
  const [openFolderId, setOpenFolderId] = useState(null)
  const [clockTime, setClockTime] = useState(() => new Date())
  const [theme, setTheme] = useState(loadInitialTheme)
  const [pandaMood, setPandaMood] = useState('wave')
  const [pandaLine, setPandaLine] = useState('Welcome to your cute birthday desktop! 💗')
  const [birthdayPhotoBroken, setBirthdayPhotoBroken] = useState(false)

  const pandaMoodRef = useRef('wave')
  const pandaLineRef = useRef('Welcome to your cute birthday desktop! 💗')
  const pandaResetTimerRef = useRef(null)
  const pandaIdleTimerRef = useRef(null)

  const windows = useOSStore((state) => state.windows)
  const openApp = useOSStore((state) => state.openApp)
  const focusApp = useOSStore((state) => state.focusApp)
  const closeApp = useOSStore((state) => state.closeApp)
  const minimizeApp = useOSStore((state) => state.minimizeApp)
  const updateBounds = useOSStore((state) => state.updateBounds)
  const surpriseOpen = useOSStore((state) => state.surpriseOpen)
  const revealSurprise = useOSStore((state) => state.revealSurprise)
  const closeSurprise = useOSStore((state) => state.closeSurprise)
  const hiddenUnlocked = useOSStore((state) => state.hiddenUnlocked)
  const unlockHiddenApp = useOSStore((state) => state.unlockHiddenApp)
  const { playClose, playFocus, playOpen, playPalette } = useSoundEffects()

  const visibleApps = useMemo(
    () => apps.filter((app) => !app.hidden || hiddenUnlocked),
    [hiddenUnlocked],
  )

  const handleOpenLetter = useCallback(() => {
    closeSurprise()
    openApp('birthday-quest')
    focusApp('birthday-quest')
    playOpen()
  }, [closeSurprise, focusApp, openApp, playOpen])

  const availableFolders = useMemo(
    () =>
      desktopFolders.map((folder) => ({
        ...folder,
        apps: folder.appIds
          .map((appId) => apps.find((app) => app.id === appId))
          .filter((app) => app && (!app.hidden || hiddenUnlocked)),
      })),
    [hiddenUnlocked],
  )

  const activeWindowId = useMemo(() => {
    if (!windows.length) {
      return null
    }

    return windows.reduce((topWindow, windowItem) => (windowItem.z > topWindow.z ? windowItem : topWindow))
      .appId
  }, [windows])
  const birthdayCountdown = useMemo(() => getBirthdayCountdown(clockTime), [clockTime])

  const paletteEntries = useMemo(() => {
    const openEntries = apps
      .filter((app) => !app.hidden || hiddenUnlocked)
      .map((app) => ({
        id: `open-${app.id}`,
        label: `Open ${app.name}`,
        hint: 'Launch app',
        keywords: `${app.id} ${app.name}`,
        run: () => {
          openApp(app.id)
          playOpen()
        },
      }))

    return [
      ...openEntries,
      {
        id: 'reveal-surprise',
        label: 'Reveal surprise',
        hint: 'Trigger hidden celebration',
        keywords: 'surprise celebrate birthday',
        run: () => revealSurprise(),
      },
      {
        id: 'unlock-build-log',
        label: 'Unlock BuildLog',
        hint: 'Advanced mode',
        keywords: 'build log hidden app unlock',
        run: () => {
          unlockHiddenApp()
          openApp('build-log')
          window.location.hash = 'build-log'
          playOpen()
        },
      },
    ]
  }, [hiddenUnlocked, openApp, playOpen, revealSurprise, unlockHiddenApp])

  const setPandaMoment = useCallback((nextMood, message, holdMs = 0) => {
    setPandaMood(nextMood)
    pandaMoodRef.current = nextMood
    setPandaLine(message)
    pandaLineRef.current = message

    if (pandaResetTimerRef.current) {
      clearTimeout(pandaResetTimerRef.current)
      pandaResetTimerRef.current = null
    }

    if (holdMs > 0) {
      pandaResetTimerRef.current = window.setTimeout(() => {
        const idleLine = randomFrom(PANDA_IDLE_LINES, pandaLineRef.current)
        setPandaMood('idle')
        pandaMoodRef.current = 'idle'
        setPandaLine(idleLine)
        pandaLineRef.current = idleLine
      }, holdMs)
    }
  }, [])

  const pickPandaLine = useCallback((lines) => randomFrom(lines, pandaLineRef.current), [])

  const resetPandaIdleTimer = useCallback(() => {
    if (pandaIdleTimerRef.current) {
      clearTimeout(pandaIdleTimerRef.current)
    }

    pandaIdleTimerRef.current = window.setTimeout(() => {
      setPandaMoment('sleep', randomFrom(PANDA_SLEEP_LINES, pandaLineRef.current))
    }, 18000)
  }, [setPandaMoment])

  const openPalette = useCallback(() => {
    setPaletteOpen(true)
    playPalette()
    setPandaMoment('cheer', pickPandaLine(PANDA_PALETTE_LINES), 1400)
  }, [pickPandaLine, playPalette, setPandaMoment])

  const closePalette = useCallback(() => {
    setPaletteOpen(false)
    setPaletteQuery('')
  }, [])

  function handlePaletteSelect(entry) {
    entry.run()
    closePalette()
  }

  function handleOpenApp(appId) {
    openApp(appId)
    playOpen()
    setPandaMoment('cheer', pickPandaLine(PANDA_OPEN_LINES), 1400)
    resetPandaIdleTimer()
  }

  function handleTaskbarOpen(appId) {
    openApp(appId)
    playFocus()
    setPandaMoment('wave', pickPandaLine(PANDA_REOPEN_LINES), 1200)
    resetPandaIdleTimer()
  }

  function handleFocusApp(appId) {
    focusApp(appId)
    playFocus()
    resetPandaIdleTimer()
  }

  function handleCloseApp(appId) {
    closeApp(appId)
    playClose()
    setPandaMoment('wave', pickPandaLine(PANDA_CLOSE_LINES), 1200)
    resetPandaIdleTimer()
  }

  function handlePandaTap() {
    const wakeLine =
      pandaMoodRef.current === 'sleep'
        ? pickPandaLine(PANDA_WAKE_LINES)
        : pickPandaLine(PANDA_TAP_LINES)

    setPandaMoment('wave', wakeLine, 1700)
    resetPandaIdleTimer()
  }

  useEffect(() => {
    window.localStorage.setItem('rimos-theme', theme)
  }, [theme])

  useEffect(() => {
    const intervalId = setInterval(() => setClockTime(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const welcomeTimer = window.setTimeout(() => {
      setPandaMoment('idle', randomFrom(PANDA_IDLE_LINES, pandaLineRef.current))
    }, 2200)

    resetPandaIdleTimer()
    return () => clearTimeout(welcomeTimer)
  }, [resetPandaIdleTimer, setPandaMoment])

  useEffect(() => {
    function onKeyDown(event) {
      const commandPaletteHotkey = event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)

      if (commandPaletteHotkey) {
        event.preventDefault()
        openPalette()
        return
      }

      if (event.key === 'Escape') {
        closePalette()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closePalette, openPalette])

  useEffect(() => {
    function syncHiddenRoute() {
      const hash = window.location.hash.replace('#', '').toLowerCase()
      if (hash !== 'build-log') {
        return
      }

      unlockHiddenApp()
      openApp('build-log')
      playOpen()
    }

    syncHiddenRoute()
    window.addEventListener('hashchange', syncHiddenRoute)
    return () => window.removeEventListener('hashchange', syncHiddenRoute)
  }, [openApp, playOpen, unlockHiddenApp])

  useEffect(() => {
    function onActivity() {
      if (pandaMoodRef.current === 'sleep') {
        setPandaMoment('wave', randomFrom(PANDA_RETURN_LINES, pandaLineRef.current), 1600)
      }

      resetPandaIdleTimer()
    }

    window.addEventListener('pointerdown', onActivity)
    window.addEventListener('keydown', onActivity)

    return () => {
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('keydown', onActivity)
    }
  }, [resetPandaIdleTimer, setPandaMoment])

  useEffect(
    () => () => {
      if (pandaResetTimerRef.current) {
        clearTimeout(pandaResetTimerRef.current)
      }

      if (pandaIdleTimerRef.current) {
        clearTimeout(pandaIdleTimerRef.current)
      }
    },
    [],
  )

  return (
    <div className={`screen desktop-screen theme-${theme}`}>
      <header className="os-topbar">
        <strong>RimOS v1.0</strong>
        <div className="os-topbar-controls">
          <span>Birthday Build • handcrafted mode</span>
          <label className="theme-picker">
            <span>Theme</span>
            <select value={theme} onChange={(event) => setTheme(event.target.value)}>
              {THEME_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="desktop-area">
        <div className="desktop-sky" aria-hidden="true">
          {DESKTOP_BLOBS.map((blob) => (
            <span
              key={blob.id}
              className="desktop-sky-blob"
              style={{
                '--blob-x': blob.x,
                '--blob-y': blob.y,
                '--blob-size': blob.size,
                '--blob-tint': blob.tint,
                '--blob-duration': blob.duration,
                '--blob-delay': blob.delay,
              }}
            />
          ))}

          {DESKTOP_DOODLES.map((doodle) => (
            <span
              key={doodle.id}
              className="desktop-doodle"
              style={{
                '--doodle-x': doodle.x,
                '--doodle-y': doodle.y,
                '--doodle-size': doodle.size,
                '--doodle-duration': doodle.duration,
                '--doodle-delay': doodle.delay,
              }}
            >
              {doodle.glyph}
            </span>
          ))}
        </div>

        <aside
          className={`birthday-countdown-widget${birthdayCountdown.isBirthdayToday ? ' is-today' : ''}`}
          aria-label="next birthday countdown"
        >
          <span className="countdown-bow" aria-hidden="true">
            🎀
          </span>

          <header className="countdown-head">
            <span className="countdown-cake" aria-hidden="true">
              🎂
            </span>
            <div className="countdown-head-copy">
              <p className="countdown-kicker">
                {birthdayCountdown.isBirthdayToday ? 'Today is the day' : 'Next Birthday'}
              </p>
              <p className="countdown-date">Sep 30 • {birthdayCountdown.nextBirthdayDate.getFullYear()}</p>
            </div>
          </header>

          {birthdayCountdown.isBirthdayToday ? (
            <p className="countdown-today-line">Happy Birthday, Panda 🎉</p>
          ) : (
            <>
              <p className="countdown-days">
                <strong>{birthdayCountdown.daysLeft}</strong>
                <span>day{birthdayCountdown.daysLeft === 1 ? '' : 's'} to go</span>
              </p>

              <div className="countdown-chips" aria-live="polite">
                <span className="countdown-chip">
                  <strong>{padNumber(birthdayCountdown.hoursLeft)}</strong>
                  <small>hrs</small>
                </span>
                <span className="countdown-chip">
                  <strong>{padNumber(birthdayCountdown.minutesLeft)}</strong>
                  <small>min</small>
                </span>
                <span className="countdown-chip">
                  <strong>{padNumber(birthdayCountdown.secondsLeft)}</strong>
                  <small>sec</small>
                </span>
              </div>

              <div
                className="countdown-progress"
                role="img"
                aria-label={`${birthdayCountdown.progressPercent}% of the way to the next birthday`}
              >
                <span style={{ width: `${birthdayCountdown.progressPercent}%` }} />
              </div>

              <small className="countdown-foot">{birthdayCountdown.progressPercent}% of the year done</small>
            </>
          )}
        </aside>

        <div className="desktop-icons-layer">
          <div className="icon-grid">
            {visibleApps.map((app) => (
              <AppIcon key={app.id} app={app} onOpen={handleOpenApp} />
            ))}

            {availableFolders.map((folder) => (
              <div key={folder.id} className="folder-tile">
                <button
                  type="button"
                  className="app-icon folder-button"
                  onClick={() => setOpenFolderId((currentId) => (currentId === folder.id ? null : folder.id))}
                  aria-expanded={openFolderId === folder.id}
                >
                  <span className={`app-badge app-badge-${folder.iconTone}`}>{folder.iconGlyph}</span>
                  <span className="app-label">{folder.name}</span>
                </button>

                {openFolderId === folder.id && (
                  <section className="folder-panel" role="dialog" aria-label={`${folder.name} folder`}>
                    <p>{folder.name}</p>
                    <div className="folder-app-list">
                      {folder.apps.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          className="folder-app-item"
                          onClick={() => {
                            handleOpenApp(app.id)
                            setOpenFolderId(null)
                          }}
                        >
                          <span className={`app-badge app-badge-${app.iconTone}`}>{app.iconGlyph}</span>
                          <span>{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="desktop-windows-layer">
          {windows
            .filter((windowItem) => !windowItem.minimized)
            .sort((a, b) => a.z - b.z)
            .map((windowItem) => {
              const app = apps.find((item) => item.id === windowItem.appId)

              return (
                <WindowShell
                  key={windowItem.appId}
                  appId={windowItem.appId}
                  title={app?.name ?? 'Unknown App'}
                  windowItem={windowItem}
                  onFocus={handleFocusApp}
                  onClose={handleCloseApp}
                  onMinimize={minimizeApp}
                  onChangeBounds={updateBounds}
                >
                  {appRenderer(windowItem.appId, revealSurprise)}
                </WindowShell>
              )
            })}
        </div>

        <div className={`panda-companion is-${pandaMood}`}>
          <p className="panda-line">{pandaLine}</p>
          <button type="button" className="panda-button" onClick={handlePandaTap} aria-label="Panda companion">
            <span>🐼</span>
          </button>
        </div>

        <p className="home-credit" aria-label="made with love by Rahul">
          <span className="home-credit-soft">Made with</span>
          <span className="home-credit-heart">❤️</span>
          <span className="home-credit-soft">by</span>
          <strong>Rahul</strong>
        </p>

        <footer className="taskbar">
          <button type="button" className="taskbar-start" onClick={openPalette}>
            Start
          </button>
          <div className="taskbar-running">
            {windows.length === 0 && <p className="taskbar-empty">No apps running</p>}
            {windows.map((windowItem) => {
              const app = apps.find((item) => item.id === windowItem.appId)
              return (
                <button
                  key={windowItem.appId}
                  type="button"
                  className={`taskbar-app-button${activeWindowId === windowItem.appId ? ' is-active' : ''}`}
                  onClick={() => handleTaskbarOpen(windowItem.appId)}
                >
                  <span>{app?.name ?? windowItem.appId}</span>
                  {windowItem.minimized && <small>min</small>}
                </button>
              )
            })}
          </div>
          <time className="taskbar-clock" dateTime={clockTime.toISOString()}>
            {clockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </footer>
      </main>

      <CommandPalette
        open={paletteOpen}
        query={paletteQuery}
        setQuery={setPaletteQuery}
        entries={paletteEntries}
        onSelect={handlePaletteSelect}
        onClose={closePalette}
      />

      {surpriseOpen && (
        <div className="surprise-overlay" role="dialog" aria-modal="true">
          <span className="final-confetti" aria-hidden="true">
            {FINAL_CONFETTI.map((shape, index) => (
              <span key={`${shape}-${index}`} className="final-confetti-bit">
                {shape}
              </span>
            ))}
          </span>

          <div className="surprise-card final-screen-card">
            <div className="final-photo-wrap">
              {birthdayPhotoBroken ? (
                <div className="final-photo final-photo-fallback">🎂</div>
              ) : (
                <img
                  className="final-photo"
                  src={BIRTHDAY_PHOTO}
                  alt="Madhurima"
                  onError={() => setBirthdayPhotoBroken(true)}
                />
              )}
              <span className="final-age-badge">{BIRTHDAY_AGE}</span>
            </div>

            <h2>
              Happy {BIRTHDAY_AGE}th, Madhurima <span aria-hidden="true">🎉</span>
            </h2>

            <div className="final-screen-lines">
              <p>27 looks unfairly good on you.</p>
              <p>More food, more songs, less overthinking. That is the whole wish.</p>
              <p>Today is yours. So is every other day, honestly.</p>
            </div>

            <div className="final-screen-actions">
              <button type="button" onClick={handleOpenLetter} className="final-letter-button">
                💌 Go read your letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Desktop
