import { useEffect, useMemo, useState } from 'react'
import { kannadaFlashcards } from '../../data/kannadaLessons.js'
import { useOSStore } from '../../store/useOSStore.js'

const QUIZ_SIZE = 10
const TRANSLATE_API_URL =
  import.meta.env.VITE_TRANSLATE_API_URL ?? 'https://api.mymemory.translated.net/get'
const STREAK_STORAGE_KEY = 'rimos-kannada-streak'

function shuffleList(list) {
  const copy = [...list]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }

  return copy
}

function buildQuizQuestions(cards) {
  const uniqueKannadaWords = Array.from(new Set(cards.map((item) => item.kannada)))
  const sampleCards = shuffleList(cards).slice(0, Math.min(QUIZ_SIZE, cards.length))

  return sampleCards.map((card) => {
    const distractors = shuffleList(uniqueKannadaWords.filter((word) => word !== card.kannada)).slice(0, 3)

    return {
      prompt: `How do you say "${card.meaning}" in Kannada?`,
      answer: card.kannada,
      choices: shuffleList([card.kannada, ...distractors]),
    }
  })
}

function getDayStamp(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getYesterdayStamp(todayStamp) {
  const [year, month, day] = todayStamp.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() - 1)
  return getDayStamp(date)
}

function getInitialStreakState() {
  const todayStamp = getDayStamp(new Date())
  const defaultState = { streak: 1, bestStreak: 1, lastVisit: todayStamp }

  const raw = window.localStorage.getItem(STREAK_STORAGE_KEY)
  if (!raw) {
    window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(defaultState))
    return defaultState
  }

  try {
    const parsed = JSON.parse(raw)
    const previousStreak = Number.isFinite(parsed?.streak) ? Math.max(1, parsed.streak) : 1
    const previousBest = Number.isFinite(parsed?.bestStreak) ? Math.max(1, parsed.bestStreak) : previousStreak
    const lastVisit = typeof parsed?.lastVisit === 'string' ? parsed.lastVisit : ''

    if (lastVisit === todayStamp) {
      return { streak: previousStreak, bestStreak: previousBest, lastVisit }
    }

    const streak = lastVisit === getYesterdayStamp(todayStamp) ? previousStreak + 1 : 1
    const nextState = {
      streak,
      bestStreak: Math.max(previousBest, streak),
      lastVisit: todayStamp,
    }

    window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(nextState))
    return nextState
  } catch {
    window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(defaultState))
    return defaultState
  }
}

function KannadaLearnApp() {
  const trackKannadaQuizAttempt = useOSStore((state) => state.trackKannadaQuizAttempt)
  const trackKannadaStreak = useOSStore((state) => state.trackKannadaStreak)
  const [tab, setTab] = useState('cards')
  const [streakState] = useState(getInitialStreakState)
  const [cardIndex, setCardIndex] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState(() => buildQuizQuestions(kannadaFlashcards))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [phrase, setPhrase] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [translateError, setTranslateError] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  const currentCard = kannadaFlashcards[cardIndex]
  const currentQuestion = quizQuestions[questionIndex]
  const isQuizDone = questionIndex >= quizQuestions.length

  const progressLabel = useMemo(
    () => `Card ${cardIndex + 1} / ${kannadaFlashcards.length}`,
    [cardIndex],
  )
  const streakStars = useMemo(
    () => Array.from({ length: Math.min(streakState.streak, 7) }, (_, index) => `star-${index}`),
    [streakState.streak],
  )

  useEffect(() => {
    trackKannadaStreak(streakState.bestStreak)
  }, [streakState.bestStreak, trackKannadaStreak])

  function showNextCard() {
    setCardIndex((index) => (index + 1) % kannadaFlashcards.length)
  }

  function handleChoice(choice) {
    if (selected || isQuizDone) {
      return
    }

    setSelected(choice)
    if (choice === currentQuestion.answer) {
      setScore((value) => value + 1)
    }
  }

  function goToNextQuestion() {
    if (isQuizDone) {
      return
    }

    if (questionIndex === quizQuestions.length - 1) {
      trackKannadaQuizAttempt(score)
    }

    setQuestionIndex((index) => index + 1)
    setSelected(null)
  }

  function restartQuiz() {
    setQuizQuestions(buildQuizQuestions(kannadaFlashcards))
    setQuestionIndex(0)
    setSelected(null)
    setScore(0)
  }

  async function handleTranslate() {
    const text = phrase.trim()
    if (!text) {
      return
    }

    setIsTranslating(true)
    setTranslateError('')
    setTranslatedText('')

    try {
      const query = `${TRANSLATE_API_URL}?q=${encodeURIComponent(text)}&langpair=en|kn`
      const response = await fetch(query)
      if (!response.ok) {
        throw new Error('Translation request failed')
      }

      const data = await response.json()
      const result = data?.responseData?.translatedText?.trim()
      if (!result) {
        throw new Error('No translation returned')
      }

      setTranslatedText(result)
    } catch {
      setTranslateError('Could not fetch translation right now. Try again in a moment.')
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="kannada-app">
      <div className="kannada-head">
        <h3>Kannada Kali</h3>
        <small>100-card starter + API translation</small>
      </div>
      <div className="kannada-streak">
        <div>
          <p>
            {streakState.streak}-day learning streak
          </p>
          <small>Best streak: {streakState.bestStreak} days</small>
        </div>
        <div className="kannada-streak-stars" aria-label="streak star badges">
          {streakStars.map((starId) => (
            <span key={starId}>⭐</span>
          ))}
        </div>
      </div>

      <div className="kannada-tabs">
        <button
          type="button"
          onClick={() => setTab('cards')}
          className={`kannada-tab${tab === 'cards' ? ' is-active' : ''}`}
        >
          Flashcards
        </button>
        <button
          type="button"
          onClick={() => setTab('quiz')}
          className={`kannada-tab${tab === 'quiz' ? ' is-active' : ''}`}
        >
          Quick Quiz
        </button>
        <button
          type="button"
          onClick={() => setTab('translate')}
          className={`kannada-tab${tab === 'translate' ? ' is-active' : ''}`}
        >
          Translate
        </button>
      </div>

      {tab === 'cards' ? (
        <section className="kannada-panel">
          <p className="kannada-progress">{progressLabel}</p>
          <div className="kannada-card">
            <p className="kannada-script">{currentCard.kannada}</p>
            <p className="kannada-latin">{currentCard.latin}</p>
            <p className="kannada-meaning">{currentCard.meaning}</p>
          </div>
          <button type="button" onClick={showNextCard} className="kannada-next">
            Next Word
          </button>
        </section>
      ) : tab === 'quiz' ? (
        <section className="kannada-panel kannada-panel-quiz">
          {isQuizDone ? (
            <div className="kannada-quiz-result">
              <h4>Quiz complete 🎉</h4>
              <p>
                Score: {score} / {quizQuestions.length}
              </p>
              <button type="button" onClick={restartQuiz} className="kannada-next">
                Try Again
              </button>
            </div>
          ) : (
            <>
              <p className="kannada-progress">
                Question {questionIndex + 1} / {quizQuestions.length}
              </p>
              <h4>{currentQuestion.prompt}</h4>
              <div className="kannada-choices">
                {currentQuestion.choices.map((choice, choiceIndex) => {
                  const isRight = selected && choice === currentQuestion.answer
                  const isWrong = selected === choice && choice !== currentQuestion.answer

                  return (
                    <button
                      key={`${choice}-${choiceIndex}`}
                      type="button"
                      onClick={() => handleChoice(choice)}
                      className={`kannada-choice${isRight ? ' is-right' : ''}${isWrong ? ' is-wrong' : ''}`}
                    >
                      {choice}
                    </button>
                  )
                })}
              </div>

              <button type="button" onClick={goToNextQuestion} disabled={!selected} className="kannada-next">
                Next
              </button>
            </>
          )}
        </section>
      ) : (
        <section className="kannada-panel">
          <p className="kannada-progress">English → Kannada translation</p>
          <div className="kannada-translate">
            <input
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              placeholder="type an English phrase…"
              aria-label="English phrase input"
            />
            <button type="button" onClick={handleTranslate} disabled={isTranslating || !phrase.trim()}>
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>

          {translatedText ? <p className="kannada-translate-result">{translatedText}</p> : null}
          {translateError ? <p className="kannada-translate-error">{translateError}</p> : null}

          <small className="kannada-progress">
            API source is configurable with <code>VITE_TRANSLATE_API_URL</code>.
          </small>
        </section>
      )}
    </div>
  )
}

export default KannadaLearnApp
