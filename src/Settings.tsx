import { useRef, useState } from 'react'
import { Download, PawPrint, Upload } from 'lucide-react'
import { makeBackup, parseBackup } from './storage'
import { localDay, type TrainingData } from './training'

export type Mutate = (update: (data: TrainingData) => TrainingData) => Promise<TrainingData>

export function Settings({ data, mutate }: { data: TrainingData; mutate: Mutate }) {
  const [breed, setBreed] = useState(data.profile.breed)
  const [age, setAge] = useState(String(data.profile.age))
  const [cues, setCues] = useState(data.profile.cues.join('\n'))
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [backup, setBackup] = useState<TrainingData>()
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  async function apply(update: Parameters<Mutate>[0], message: string) {
    setBusy(true); setError(''); setStatus('')
    try {
      const result = await mutate(update)
      setStatus(message)
      return result
    } catch { setError('Could not save changes to this device. Try again.') }
    finally { setBusy(false) }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([makeBackup(data)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `ella-training-${localDay()}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <>
    <div className="page-intro"><p className="eyebrow"><PawPrint size={16} /> Your training companion</p><h1>Meet <em>Ella.</em></h1>
      <p>Update her profile and manage the data on this device.</p></div>
    <form className="panel narrow" onSubmit={async event => {
      event.preventDefault()
      const entries = cues.split('\n').map(cue => cue.trim()).filter(Boolean)
      if (!breed.trim() || entries.length > 30 || entries.some(cue => cue.length > 80)) {
        setError('Enter a breed and up to 30 cues, each under 81 characters.'); return
      }
      await apply(current => ({ ...current, profile: { breed: breed.trim(), age: Number(age), cues: entries } }), 'Ella’s profile was saved.')
    }}>
      <h2>Ella’s profile</h2>
      <label className="field">Breed<input required maxLength={100} value={breed} onChange={event => setBreed(event.target.value)} /></label>
      <label className="field">Age in months<input type="number" required min={1} max={360} value={age} onChange={event => setAge(event.target.value)} /></label>
      <label className="field">Existing cues, one per line<textarea maxLength={2430} value={cues} onChange={event => setCues(event.target.value)} /></label>
      <button className="primary" disabled={busy}>Save profile</button>
    </form>
    <section className="panel narrow spaced">
      <h2>Appearance</h2>
      <label className="field">Theme<select disabled={busy} value={data.theme} onChange={event => {
        const theme = event.target.value as TrainingData['theme']
        void apply(current => ({ ...current, theme }), 'Appearance saved.')
      }}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
    </section>
    <section className="panel narrow spaced">
      <h2>Backup & restore</h2><p className="muted">Export your profile, preferences, rest days and session history as a JSON file.</p>
      <div className="cluster"><button className="secondary" onClick={download}><Download size={17} /> Export backup</button>
        <button className="secondary" disabled={busy} onClick={() => input.current?.click()}><Upload size={17} /> Import backup</button></div>
      <input ref={input} type="file" accept=".json,application/json" className="hidden" onChange={async event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        setBackup(undefined); setError(''); setStatus('')
        try { setBackup(parseBackup(await file.text())) }
        catch (error) { setError(error instanceof SyntaxError ? 'Choose a valid JSON backup file.' : (error as Error).message) }
      }} />
      {backup && <div role="group" aria-label="Confirm restore">
        <p>This backup contains {backup.sessions.length} sessions. Restoring it replaces the data on this device.</p>
        <div className="cluster"><button className="primary" disabled={busy} onClick={async () => {
          const restored = await apply(() => backup, 'Backup restored.')
          if (restored) {
            setBreed(restored.profile.breed); setAge(String(restored.profile.age))
            setCues(restored.profile.cues.join('\n')); setBackup(undefined)
          }
        }}>Restore backup</button><button className="text-button" disabled={busy} onClick={() => setBackup(undefined)}>Cancel</button></div>
      </div>}
    </section>
    {status && <p className="feedback" role="status">{status}</p>}
    {error && <p className="feedback" role="alert">{error}</p>}
  </>
}
