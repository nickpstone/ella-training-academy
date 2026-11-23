import { exercises } from './curriculum'

export interface Profile { breed: string; age: number; cues: string[] }
export interface Session {
  id: string
  exerciseId: string
  level: number
  date: string
  seconds: number
  successes: number
  attempts: number
  notes: string
}
export interface TrainingData {
  profile: Profile
  sessions: Session[]
  restDays: string[]
  theme: 'system' | 'light' | 'dark'
}
export const initialData: TrainingData = {
  profile: { breed: 'Miniature Schnauzer', age: 6, cues: ['Ella, Sit', 'Touch', 'Yes!'] },
  sessions: [], restDays: [], theme: 'system',
}
export const rate = (session: Pick<Session, 'successes' | 'attempts'>) =>
  session.attempts ? session.successes / session.attempts : 0

export function advice(sessions: Session[], exerciseId: string, level: number) {
  const recent = sessions.filter(s => s.exerciseId === exerciseId && s.level === level)
    .sort((a, b) => b.date.localeCompare(a.date))
  const latest = recent[0]
  if (!latest) return 'start'
  if (rate(latest) < 0.6) return 'easier'
  if (rate(latest) < 0.8) return 'repeat'
  const pair = recent.filter(s => s.attempts >= 5).slice(0, 2)
  if (pair.length === 2 && pair.every(s => rate(s) >= 0.8)) return 'advance'
  return 'repeat'
}

export function progress(sessions: Session[]) {
  const levels = new Map<string, number>()
  const mastered = new Set<string>()
  const unlocked = new Set<string>()
  const ordered = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  let nextExercise = 0
  let maxLevel = 0
  let attempts: Session[] = []
  unlocked.add(exercises[0].id)
  levels.set(exercises[0].id, 0)
  for (const session of ordered) {
    const exercise = exercises[nextExercise]
    if (!exercise || session.exerciseId !== exercise.id || session.level > maxLevel) continue
    attempts.push(session)
    if (session.level !== maxLevel || advice(attempts, exercise.id, maxLevel) !== 'advance') continue
    if (maxLevel < exercise.levels.length - 1) {
      maxLevel++
      levels.set(exercise.id, maxLevel)
    } else {
      mastered.add(exercise.id)
      nextExercise++
      maxLevel = 0
      attempts = []
      const next = exercises[nextExercise]
      if (next) {
        unlocked.add(next.id)
        levels.set(next.id, 0)
      }
    }
  }

  const focus = exercises[nextExercise] ?? exercises[0]
  let recommendation = advice(attempts, focus.id, maxLevel)
  let level = maxLevel
  if (recommendation === 'easier' && maxLevel > 0) {
    const setback = attempts.findLast(session => session.level === maxLevel)
    const recovery = attempts.filter(session => setback && session.date > setback.date && session.level === maxLevel - 1)
    if (advice(recovery, focus.id, maxLevel - 1) === 'advance') recommendation = 'repeat'
    else level--
  }
  return { levels, mastered, unlocked, focus, level, recommendation }
}

export function localDay(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
