import { useEffect, useState } from 'react'
import { Check, CircleHelp, Clock3, Pause, Play } from 'lucide-react'
import type { Exercise } from './curriculum'
import { advice, rate, type Session } from './training'

export function ExerciseGuide({ exercise, level }: { exercise: Exercise; level: number }) {
  return <div className="guide">
    <p className="tag">{exercise.dimension} · {exercise.levels[level]}</p>
    <ol>{exercise.steps.map(step => <li key={step}>{step}</li>)}</ol>
    <p><strong>Count a success when</strong> {exercise.criterion}</p>
    <p><strong>Keep it safe.</strong> {exercise.safety}</p>
    <p><strong>Make it easier.</strong> {exercise.easier}</p>
  </div>
}

export function SessionRunner({ exercise, level, save, exit }: {
  exercise: Exercise; level: number; save: (session: Session) => Promise<Session[]>; exit: () => void
}) {
  const [minutes, setMinutes] = useState(3)
  const [remaining, setRemaining] = useState(180)
  const [deadline, setDeadline] = useState<number | null>(null)
  const [started, setStarted] = useState(false)
  const [attempts, setAttempts] = useState<boolean[]>([])
  const [finishing, setFinishing] = useState(false)
  const [notes, setNotes] = useState('')
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState<Session[] | null>(null)
  const [error, setError] = useState('')
  const [id] = useState(() => crypto.randomUUID())
  const successes = attempts.filter(Boolean).length
  const counts = { successes, attempts: attempts.length }
  useEffect(() => {
    if (deadline === null) return
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemaining(seconds)
      if (!seconds) setDeadline(null)
    }, 200)
    return () => window.clearInterval(timer)
  }, [deadline])

  function toggleTimer() {
    if (deadline !== null) {
      setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
      setDeadline(null)
    } else {
      setStarted(true)
      setDeadline(Date.now() + remaining * 1000)
    }
  }

  async function complete() {
    setPending(true)
    setError('')
    try {
      setSaved(await save({ id, exerciseId: exercise.id, level, date: new Date().toISOString(),
        seconds: minutes * 60 - remaining, ...counts, notes: notes.trim() }))
    } catch { setError('The session could not be saved. Your attempts are still here. Try again.') }
    finally { setPending(false) }
  }

  if (saved) {
    const recommendation = advice(saved, exercise.id, level)
    const summary = recommendation === 'advance'
      ? level === exercise.levels.length - 1 ? 'This exercise is mastered. The curriculum shows your next available exercise.' : 'Ella is ready for the next level.'
      : recommendation === 'easier' ? `Make the next session easier. ${exercise.easier}`
      : 'Repeat this level. Advancement takes two sessions with at least five attempts and 80% success each.'
    return <section className="panel narrow" aria-labelledby="summary-title">
      <p className="eyebrow">Session saved</p><h1 id="summary-title">Good work, Ella!</h1>
      <p>{successes} of {attempts.length} repetitions successful · {Math.round(rate(counts) * 100)}%</p>
      <p>{summary}</p>{notes.trim() && <p className="notes">{notes.trim()}</p>}
      <button className="primary" onClick={exit}>Back to today</button>
    </section>
  }

  return <section className="panel narrow" aria-labelledby="session-title">
    <p className="eyebrow">Training session</p><h1 id="session-title">{exercise.title}</h1>
    <ExerciseGuide exercise={exercise} level={level} />
    <div className="timer">
      <label>Session length <select value={minutes} disabled={started} onChange={e => {
        const value = Number(e.target.value)
        setMinutes(value); setRemaining(value * 60)
      }}><option value={3}>3 minutes</option><option value={4}>4 minutes</option><option value={5}>5 minutes</option></select></label>
      <p className="clock"><Clock3 aria-hidden="true" /> {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</p>
      {!remaining && <p role="status">Time’s up. End with a release and give Ella a break.</p>}
      {!finishing && <button className="secondary" disabled={!remaining} onClick={toggleTimer}>
        {deadline !== null ? <><Pause size={17} /> Pause timer</> : <><Play size={17} /> {started ? 'Resume timer' : 'Start timer'}</>}
      </button>}
    </div>
    <p aria-live="polite"><strong>{successes} successful</strong> · {attempts.length} attempts</p>
    {!finishing ? <>
      <div className="cluster">
        <button className="primary" disabled={!started || !remaining || attempts.length >= 10000} onClick={() => setAttempts(previous => [...previous, true])}><Check size={18} /> Success</button>
        <button className="secondary" disabled={!started || !remaining || attempts.length >= 10000} onClick={() => setAttempts(previous => [...previous, false])}><CircleHelp size={18} /> Needs an easier rep</button>
        <button className="text-button" disabled={!attempts.length} onClick={() => setAttempts(previous => previous.slice(0, -1))}>Undo last attempt</button>
      </div>
      {attempts.at(-1) === false && <p role="status">{exercise.easier} Keep any easier warm-up out of this level’s tally.</p>}
      <div className="cluster"><button className="secondary" disabled={!attempts.length} onClick={() => {
        if (deadline !== null) setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
        setDeadline(null); setFinishing(true)
      }}>Finish session</button><button className="text-button" onClick={() => {
        if (!attempts.length || window.confirm('Leave this session and discard its unsaved attempts?')) exit()
      }}>Exit session</button></div>
    </> : <>
      <label className="field">Session notes (optional)<textarea maxLength={1000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="What helped Ella today?" /></label>
      {error && <p role="alert">{error}</p>}
      <div className="cluster"><button className="primary" onClick={complete} disabled={pending}>{pending ? 'Saving…' : 'Save session'}</button>
        <button className="secondary" disabled={pending} onClick={() => setFinishing(false)}>Keep practising</button></div>
    </>}
  </section>
}
