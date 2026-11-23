import 'fake-indexeddb/auto'
import { beforeEach, expect, it } from 'vitest'
import { loadData, updateData } from './storage'
import { initialData } from './training'

beforeEach(async () => { await updateData(() => structuredClone(initialData)) })

it('persists changes on a new connection and serialises concurrent writes', async () => {
  await Promise.all([
    updateData(current => ({ ...current, theme: 'dark' })),
    updateData(current => ({ ...current, restDays: ['2026-11-23'] })),
  ])
  expect(await loadData()).toEqual({ ...initialData, theme: 'dark', restDays: ['2026-11-23'] })
})

it('leaves the original state when the update aborts', async () => {
  await expect(updateData(() => { throw new Error('interrupted') })).rejects.toThrow('interrupted')
  expect(await loadData()).toEqual(initialData)
})
