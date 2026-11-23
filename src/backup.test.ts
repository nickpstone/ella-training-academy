import { describe, expect, it } from 'vitest'
import { makeBackup, parseBackup } from './storage'
import { initialData, type Session } from './training'

const session: Session = {
  id: 'practice', exerciseId: 'shift', level: 0, attempts: 5, successes: 4,
  seconds: 50, date: '2026-11-23T00:00:00.000Z', notes: 'A calmer setup helped.',
}

describe('versioned backups', () => {
  it('round trips a complete backup with Unicode notes and preferences', () => {
    const data = { ...initialData, sessions: [session], restDays: ['2026-11-22'], theme: 'dark' as const }
    expect(parseBackup(makeBackup(data))).toEqual(data)
  })
  it('rejects unknown versions and malformed JSON', () => {
    expect(() => parseBackup('{"version":2}')).toThrow()
    expect(() => parseBackup('{')).toThrow()
  })
  it('rejects impossible counts, duplicate IDs, unknown exercises and invalid dates', () => {
    for (const sessions of [
      [session, session], [{ ...session, successes: 6 }], [{ ...session, level: 9 }],
      [{ ...session, exerciseId: 'unknown' }], [{ ...session, date: '2026-02-30T00:00:00.000Z' }],
    ]) {
      expect(() => parseBackup(makeBackup({ ...initialData, sessions }))).toThrow()
    }
    expect(() => parseBackup(makeBackup({ ...initialData, restDays: ['2026-02-30'] }))).toThrow()
  })
})
