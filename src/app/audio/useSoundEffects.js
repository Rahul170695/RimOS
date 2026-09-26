import { useMemo } from 'react'
import { Howl } from 'howler'

const soundConfig = {
  startup: ['/sounds/startup.mp3', '/sounds/startup.wav'],
  open: ['/sounds/open.mp3', '/sounds/open.wav'],
  close: ['/sounds/close.mp3', '/sounds/close.wav'],
  focus: ['/sounds/focus.mp3', '/sounds/focus.wav'],
  palette: ['/sounds/palette.mp3', '/sounds/palette.wav'],
}

function createSafeHowl(src) {
  let disabled = false

  const howl = new Howl({
    src,
    volume: 0.45,
    preload: true,
    onloaderror: () => {
      disabled = true
    },
    onplayerror: () => {
      disabled = true
    },
  })

  return () => {
    if (disabled) {
      return
    }

    try {
      howl.play()
    } catch {
      disabled = true
    }
  }
}

export function useSoundEffects() {
  const players = useMemo(
    () => Object.fromEntries(Object.entries(soundConfig).map(([name, src]) => [name, createSafeHowl(src)])),
    [],
  )

  const api = useMemo(
    () => ({
      playStartup: () => players.startup(),
      playOpen: () => players.open(),
      playClose: () => players.close(),
      playFocus: () => players.focus(),
      playPalette: () => players.palette(),
    }),
    [players],
  )

  return api
}
