// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { exercises } from './curriculum'
import { SessionRunner } from './SessionRunner'
import type { Session } from './training'

afterEach(cleanup)

it('records, corrects and saves repetitions with optional notes', async () => {
  const save = vi.fn(async (session: Session) => [session])
  render(<SessionRunner exercise={exercises[0]} level={0} save={save} exit={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))
  fireEvent.click(screen.getByRole('button', { name: 'Success' }))
  fireEvent.click(screen.getByRole('button', { name: 'Needs an easier rep' }))
  fireEvent.click(screen.getByRole('button', { name: 'Undo last attempt' }))
  fireEvent.click(screen.getByRole('button', { name: 'Finish session' }))
  fireEvent.change(screen.getByLabelText('Session notes (optional)'), { target: { value: 'Quiet corner' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save session' }))
  await screen.findByRole('heading', { name: 'Good work, Ella!' })
  expect(save).toHaveBeenCalledWith(expect.objectContaining({ attempts: 1, successes: 1, notes: 'Quiet corner' }))
})
