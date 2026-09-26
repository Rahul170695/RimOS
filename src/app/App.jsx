import { useEffect, useRef } from 'react'
import { useSoundEffects } from './audio/useSoundEffects.js'
import BootScreen from './boot/BootScreen.jsx'
import Desktop from './desktop/Desktop.jsx'
import LockScreen from './lock/LockScreen.jsx'
import { useOSStore } from '../store/useOSStore.js'

const BOOT_SCREEN_DURATION_MS = 7000

function App() {
  const phase = useOSStore((state) => state.phase)
  const setPhase = useOSStore((state) => state.setPhase)
  const startupPlayedRef = useRef(false)
  const { playStartup } = useSoundEffects()

  useEffect(() => {
    if (phase !== 'boot') {
      return undefined
    }

    const timer = setTimeout(() => setPhase('lock'), BOOT_SCREEN_DURATION_MS)
    return () => clearTimeout(timer)
  }, [phase, setPhase])

  useEffect(() => {
    if (phase !== 'lock' || startupPlayedRef.current) {
      return
    }

    startupPlayedRef.current = true
    playStartup()
  }, [phase, playStartup])

  if (phase === 'boot') {
    return <BootScreen />
  }

  if (phase === 'lock') {
    return <LockScreen />
  }

  return <Desktop />
}

export default App
