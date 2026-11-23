import { exercises } from './curriculum'
import { initialData, localDay, type TrainingData } from './training'

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isText = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length <= max
const isInt = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max

function isDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T12:00:00')
  return !Number.isNaN(date.valueOf()) && localDay(date) === value
}

export function parseBackup(text: string): TrainingData {
  const raw: unknown = JSON.parse(text)
  if (!isObject(raw) || raw.version !== 1 || !isObject(raw.data)) {
    throw new Error('This file is not an Ella Training Academy version 1 backup.')
  }
  const { profile, sessions, restDays, theme } = raw.data
  if (!isObject(profile) || !isText(profile.breed, 100) || !profile.breed.trim() ||
      !isInt(profile.age, 1, 360) || !Array.isArray(profile.cues) || profile.cues.length > 30 ||
      !profile.cues.every(cue => isText(cue, 80) && cue.trim()) || !Array.isArray(sessions) ||
      !Array.isArray(restDays) || !restDays.every(isDay) ||
      (theme !== 'system' && theme !== 'light' && theme !== 'dark')) {
    throw new Error('The backup contains invalid profile or settings data.')
  }
  const ids = new Set<string>()
  const cleanSessions = sessions.map(session => {
    if (!isObject(session)) throw new Error('Invalid training session.')
    const { id, exerciseId, level, date, seconds, successes, attempts, notes } = session
    if (!isText(id, 100) || !id || ids.has(id) ||
        typeof exerciseId !== 'string' || !exercises.some(exercise => exercise.id === exerciseId) ||
        !isInt(level, 0, 2) || !isText(date, 24) ||
        !Number.isFinite(Date.parse(date)) || new Date(date).toISOString() !== date ||
        !isInt(seconds, 0, 300) || !isInt(attempts, 1, 10000) ||
        !isInt(successes, 0, attempts) || !isText(notes, 1000)) {
      throw new Error('The backup contains an invalid or duplicate training session.')
    }
    ids.add(id)
    return { id, exerciseId, level, date, seconds, successes, attempts, notes }
  })
  return {
    profile: { breed: profile.breed, age: profile.age, cues: profile.cues },
    sessions: cleanSessions, restDays: [...new Set<string>(restDays)], theme,
  }
}

export const makeBackup = (data: TrainingData) => JSON.stringify({ version: 1, data }, null, 2)

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ella-training-academy', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('training')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('Close other Academy tabs and try again.'))
  })
}

export async function loadData(): Promise<TrainingData> {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('training').objectStore('training').get('state')
      request.onsuccess = () => resolve(request.result ?? structuredClone(initialData))
      request.onerror = () => reject(request.error)
    })
  } finally { db.close() }
}

export async function updateData(update: (current: TrainingData) => TrainingData): Promise<TrainingData> {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('training', 'readwrite')
      const store = transaction.objectStore('training')
      const request = store.get('state')
      let next: TrainingData
      request.onsuccess = () => {
        try {
          next = update(request.result ?? structuredClone(initialData))
          store.put(next, 'state')
        } catch (error) {
          transaction.abort()
          reject(error)
        }
      }
      transaction.oncomplete = () => resolve(next)
      transaction.onabort = () => reject(transaction.error ?? new Error('The local save was interrupted.'))
    })
  } finally { db.close() }
}
