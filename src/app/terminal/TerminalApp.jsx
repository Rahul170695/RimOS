import { useMemo, useState } from 'react'
import { useOSStore } from '../../store/useOSStore.js'

function TerminalApp({ onRevealSurprise }) {
  const openApp = useOSStore((state) => state.openApp)
  const unlockHiddenApp = useOSStore((state) => state.unlockHiddenApp)
  const [input, setInput] = useState('')
  const [lines, setLines] = useState([
    'RimOS Terminal v1.0',
    'Type `help` to see available commands.',
  ])

  const commandList = useMemo(
    () => [
      'help',
      'whoami',
      'ls',
      'quest --start',
      'cat /heart/message.txt',
      'sudo reveal-surprise',
      'sudo unlock-build-log',
      'clear',
    ],
    [],
  )

  function runCommand(raw) {
    const command = raw.trim()
    if (!command) {
      return
    }

    if (command === 'clear') {
      setLines([])
      return
    }

    if (command === 'help') {
      setLines((current) => [...current, `> ${command}`, ...commandList])
      return
    }

    if (command === 'whoami') {
      setLines((current) => [
        ...current,
        `> ${command}`,
        'She is the protagonist of this build, legendary and version-stable.',
      ])
      return
    }

    if (command === 'ls') {
      setLines((current) => [
        ...current,
        `> ${command}`,
        'memories/ kannada/ snacks/ quest/ playlist/ achievements/',
      ])
      return
    }

    if (command === 'quest --start') {
      openApp('birthday-quest')
      setLines((current) => [...current, `> ${command}`, 'Quest launched.'])
      return
    }

    if (command === 'cat /heart/message.txt') {
      setLines((current) => [
        ...current,
        `> ${command}`,
        'You make ordinary days feel extraordinary.',
      ])
      return
    }

    if (command === 'sudo reveal-surprise') {
      onRevealSurprise()
      setLines((current) => [...current, `> ${command}`, 'Privilege accepted. Surprise unlocked.'])
      return
    }

    if (command === 'sudo unlock-build-log') {
      unlockHiddenApp()
      openApp('build-log')
      window.location.hash = 'build-log'
      setLines((current) => [...current, `> ${command}`, 'Advanced module unlocked: BuildLog'])
      return
    }

    setLines((current) => [...current, `> ${command}`, `Command not found: ${command}`])
  }

  function onSubmit(event) {
    event.preventDefault()
    runCommand(input)
    setInput('')
  }

  return (
    <div className="terminal">
      <div className="terminal-log">
        {lines.map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
      <form onSubmit={onSubmit} className="terminal-input-row">
        <span>$</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="type help and press Enter"
          aria-label="Terminal command input"
        />
      </form>
    </div>
  )
}

export default TerminalApp
