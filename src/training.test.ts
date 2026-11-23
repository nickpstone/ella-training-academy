import { describe, expect, it } from 'vitest'
import { advice, progress, type Session } from './training'

const session = (successes: number, attempts = 5, order = 1, exerciseId = 'shift', level = 0): Session => ({
  id: String(order), exerciseId, level, date: new Date(order * 1000).toISOString(),
  successes, attempts, notes: '', seconds: 40,
})

describe('adaptive progression', () => {
  it('requires two qualifying sessions, including exactly 80%', () => {
    expect(advice([session(4)], 'shift', 0)).toBe('repeat')
    expect(advice([session(4), session(3, 3, 2)], 'shift', 0)).toBe('repeat')
    expect(advice([session(4), session(4, 5, 2)], 'shift', 0)).toBe('advance')
  })
  it('repeats at 60–79% and eases below 60%', () => {
    expect(advice([session(3)], 'shift', 0)).toBe('repeat')
    expect(advice([session(79, 100)], 'shift', 0)).toBe('repeat')
    expect(advice([session(59, 100)], 'shift', 0)).toBe('easier')
    expect(advice([session(4), session(4, 5, 2), session(2, 5, 3)], 'shift', 0)).toBe('easier')
  })
  it('recommends recovery practice before returning to a harder earned level', () => {
    const setback = [session(4), session(4, 5, 2), session(2, 5, 3, 'shift', 1)]
    expect(progress(setback).level).toBe(0)
    const recovered = setback.concat(session(4, 5, 4), session(4, 5, 5))
    expect(progress(recovered)).toMatchObject({ level: 1, recommendation: 'repeat' })
  })
  it('gates higher levels and other exercises behind foundations', () => {
    const initial = progress([session(5, 5, 1, 'foot'), session(5, 5, 2, 'shift', 2)])
    expect(initial.unlocked.has('foot')).toBe(false)
    expect(initial.level).toBe(0)
    const sessions = [0, 1, 2].flatMap(level =>
      [1, 2].map(order => session(4, 5, level * 2 + order, 'shift', level)))
    expect(progress(sessions.slice(0, 2)).level).toBe(1)
    expect(progress(sessions.slice(0, 2).concat(session(2, 5, 3, 'shift', 1))).level).toBe(0)
    expect(progress(sessions).mastered.has('shift')).toBe(true)
    expect(progress(sessions).focus.id).toBe('foot')
  })
})
