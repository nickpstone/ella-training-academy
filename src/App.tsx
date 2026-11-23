import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChartNoAxesCombined, House, PawPrint, Settings2 } from 'lucide-react'
import { Curriculum, Dashboard, Journal, type Start } from './Dashboard'
import { SessionRunner } from './SessionRunner'
import { Settings, type Mutate } from './Settings'
import { loadData, updateData } from './storage'
import { localDay, progress, type TrainingData } from './training'
import type { Exercise } from './curriculum'

const nav = [
  { id: 'today', label: 'Today', icon: House },
  { id: 'curriculum', label: 'Training path', icon: BookOpen },
  { id: 'progress', label: 'Progress', icon: ChartNoAxesCombined },
  { id: 'profile', label: 'Ella’s profile', icon: Settings2 },
] as const
type Page = (typeof nav)[number]['id']
function currentPage(): Page {
  return nav.find(item => '#' + item.id === window.location.hash.split('/')[0])?.id ?? 'today'
}

export function App() {
  const [data, setData] = useState<TrainingData>()
  const [error, setError] = useState('')
  const [page, setPage] = useState(currentPage)
  const [active, setActive] = useState<{ exercise: Exercise; level: number }>()
  const plan = useMemo(() => data ? progress(data.sessions) : undefined, [data])
  useEffect(() => {
    let alive = true
    const refresh = () => {
      void loadData().then(value => { if (alive) { setData(value); setError('') } })
        .catch(() => { if (alive) setError('Local training data could not be opened. Reload to try again.') })
    }
    refresh()
    window.addEventListener('focus', refresh)
    return () => { alive = false; window.removeEventListener('focus', refresh) }
  }, [])
  useEffect(() => {
    const onHash = () => {
      setPage(currentPage())
      const [, section] = window.location.hash.split('/')
      if (section) window.requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView())
      else window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => { document.documentElement.dataset.theme = data?.theme ?? 'system' }, [data?.theme])

  const mutate: Mutate = async change => {
    const result = await updateData(change)
    setData(result)
    return result
  }
  const start: Start = (exercise, level) => {
    setActive({ exercise, level })
    window.scrollTo(0, 0)
  }
  const exit = () => { setActive(undefined); window.location.hash = 'today'; window.scrollTo(0, 0) }
  async function toggleRest() {
    try {
      const day = localDay()
      await mutate(current => ({ ...current, restDays: current.restDays.includes(day)
        ? current.restDays.filter(item => item !== day) : [...current.restDays, day] }))
      setError('')
    } catch { setError('Could not update today’s rest day. Try again.') }
  }

  return <div className="layout">
    <a className="skip" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus() }}>Skip to content</a>
    <aside className="sidebar">
      <a className="brand" href="#today" onClick={event => { if (active) event.preventDefault() }}>
        <span className="brand-mark"><PawPrint size={25} fill="none" /></span>
        <span>Ella’s<span className="brand-subtitle">Training Academy</span></span>
      </a>
      {!active && <nav aria-label="Main navigation">{nav.map(item => <a href={'#' + item.id} key={item.id} aria-current={page === item.id ? 'page' : undefined}>
        <item.icon size={19} aria-hidden="true" /><span>{item.label}</span></a>)}</nav>}
      <div className="sidebar-foot"><PawPrint size={15} /> Positive reinforcement only</div>
    </aside>
    <main id="main" tabIndex={-1}>
      {error && <p className="feedback" role="alert">{error}</p>}
      {!data || !plan ? !error && <p role="status">Opening Ella’s training journal…</p> :
        active ? <SessionRunner {...active} exit={exit} save={async session => (await mutate(current => ({
          ...current, sessions: current.sessions.some(item => item.id === session.id) ? current.sessions : [...current.sessions, session],
        }))).sessions} /> :
        page === 'curriculum' ? <Curriculum plan={plan} start={start} /> :
        page === 'progress' ? <Journal data={data} plan={plan} /> :
        page === 'profile' ? <Settings data={data} mutate={mutate} /> :
        <Dashboard data={data} plan={plan} start={start} showPlan={index => { window.location.hash = `curriculum/week-${index + 1}` }} rest={() => void toggleRest()} />}
    </main>
  </div>
}
