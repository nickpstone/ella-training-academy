import { BookOpen, Check, ChevronRight, Clock3, Footprints, Heart, ListChecks, LockKeyhole, PawPrint, Play, Sparkles, Target, Trophy } from 'lucide-react'
import { exercises, weeks, type Exercise } from './curriculum'
import { localDay, progress, rate, type TrainingData } from './training'
import { ExerciseGuide } from './SessionRunner'

type Progress = ReturnType<typeof progress>
export type Start = (exercise: Exercise, level: number) => void

export function Dashboard({ data, plan, start, showPlan, rest }: {
  data: TrainingData; plan: Progress; start: Start; showPlan: (index: number) => void; rest: () => void
}) {
  const week = weeks.findIndex(item => item.exercises.some(exercise => exercise.id === plan.focus.id))
  const resting = data.restDays.includes(localDay())
  const overall = rate(data.sessions.reduce((total, session) => ({
    successes: total.successes + session.successes, attempts: total.attempts + session.attempts,
  }), { successes: 0, attempts: 0 }))
  const allMastered = plan.mastered.size === exercises.length
  return <>
    <div className="page-intro">
      <p className="eyebrow"><PawPrint size={16} /> Ella’s training journal</p>
      <h1>Little steps, <em>big wins.</em></h1>
      <p>Short, happy training sessions for your miniature schnauzer.</p>
    </div>
    <section className="hero" aria-labelledby="focus-title">
      <div className="hero-content">
        <span className="tag"><Sparkles size={15} /> {resting ? 'Rest day' : allMastered ? 'Skills refresher' : 'Today’s practice'}</span>
        <h2 id="focus-title">{resting ? 'Take it easy, Ella.' : plan.focus.title}</h2>
        <p>{resting ? 'A little downtime is part of learning. Enjoy some relaxed time together.' :
          plan.recommendation === 'easier' ? plan.focus.easier : plan.focus.description}</p>
        {!resting && <div className="hero-meta"><span><Clock3 size={17} /> 3–5 min</span><span><Footprints size={17} /> {plan.focus.levels[plan.level]}</span></div>}
        <button className="primary" onClick={() => resting ? rest() : start(plan.focus, plan.level)}>
          {resting ? 'Resume daily practice' : <><Play size={17} fill="currentColor" /> Start session</>}
        </button>
      </div>
      <img src={import.meta.env.BASE_URL + 'ella.webp'} alt="Illustration of a salt-and-pepper miniature schnauzer sitting attentively" width="1050" height="700" />
    </section>

    <section className="stats" aria-label="Training statistics">
      <Stat icon={<ListChecks />} label="Sessions logged" value={data.sessions.length} tone="mint" />
      <Stat icon={<Target />} label="Success rate" value={data.sessions.length ? `${Math.round(overall * 100)}%` : '—'} tone="gold" />
      <Stat icon={<Trophy />} label="Exercises mastered" value={`${plan.mastered.size} / ${exercises.length}`} tone="peach" />
    </section>

    <div className="bottom-grid">
      <section className="panel path">
        <div className="section-title"><div className="tile mint"><BookOpen size={20} /></div><h2>Training path</h2></div>
        <p className="muted">Six weeks of skills, at Ella’s pace.</p>
        {weeks.map((item, index) => {
          const mastered = item.exercises.every(exercise => plan.mastered.has(exercise.id))
          return <button key={item.title} className={'path-row ' + (index === week && !allMastered ? 'current' : '')} onClick={() => showPlan(index)}>
            <span className="week-number">{index + 1}</span><span className="path-label"><small>Week {index + 1}</small>{item.title}</span>
            {mastered ? <Check size={17} aria-label="Mastered" /> : index === week ? <ChevronRight size={18} /> : <LockKeyhole size={16} aria-label="Future foundation" />}
          </button>
        })}
      </section>
      <section className="panel reminders">
        <div className="section-title"><div className="tile gold"><Heart size={20} /></div><h2>A quick reminder</h2></div>
        <dl><div><dt>“Yes!”</dt><dd>Mark the moment Ella gets it right and follow with a treat.</dd></div>
          <div><dt>“Free!”</dt><dd>Release Ella from her position so she knows she can move.</dd></div></dl>
        <p className="reminder-note">If a rep is hard, make the next one easier. End while it’s still fun.</p>
        {!resting && <button className="text-button" onClick={rest}>Make today a rest day</button>}
      </section>
    </div>
  </>
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: string }) {
  return <div className="stat"><div className={'tile ' + tone}>{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>
}

export function Curriculum({ plan, start }: { plan: Progress; start: Start }) {
  return <>
    <div className="page-intro"><p className="eyebrow"><BookOpen size={16} /> Six-week curriculum</p><h1>Training <em>path</em></h1>
      <p>Build foundations at Ella’s pace. Each level changes one dimension at a time.</p></div>
    <div className="curriculum">
      {weeks.map((week, index) => <section className="panel week" id={'week-' + (index + 1)} key={week.title}>
        <p className="eyebrow">Week {index + 1}</p><h2>{week.title}</h2><p className="muted">{week.description}</p>
        {week.exercises.map(exercise => {
          const locked = !plan.unlocked.has(exercise.id)
          const level = plan.levels.get(exercise.id) ?? 0
          return <details key={exercise.id}>
            <summary>{exercise.title}<small>{plan.mastered.has(exercise.id) ? 'Mastered' : locked ? 'Upcoming' : 'Available'}</small></summary>
            <p>{exercise.description}</p>
            <ExerciseGuide exercise={exercise} level={level} />
            {locked ? <p className="muted">Master the previous exercise to unlock practice.</p> :
              <div className="cluster">{exercise.levels.slice(0, level + 1).map((target, index) =>
                <button key={target} className={index === level ? 'primary' : 'secondary'} onClick={() => start(exercise, index)}>
                  Practise {target.toLowerCase()}
                </button>)}</div>}
          </details>
        })}
      </section>)}
    </div>
  </>
}

export function Journal({ data, plan }: { data: TrainingData; plan: Progress }) {
  const sorted = [...data.sessions].sort((a, b) => b.date.localeCompare(a.date))
  return <>
    <div className="page-intro"><p className="eyebrow"><ListChecks size={16} /> Training journal</p><h1>Ella’s <em>progress</em></h1><p>See what you’ve practised and how Ella is doing over time.</p></div>
    <section className="panel">
      <h2>By difficulty dimension</h2>
      <div className="dimensions">
        {(['duration', 'movement', 'distance', 'distraction'] as const).map(dimension => {
          const relevant = exercises.filter(item => item.dimension === dimension)
          const sessions = sorted.filter(session => relevant.some(item => item.id === session.exerciseId))
          const count = sessions.reduce((sum, item) => sum + item.attempts, 0)
          const successes = sessions.reduce((sum, item) => sum + item.successes, 0)
          return <div key={dimension}><h3>{dimension}</h3><p>{count ? `${Math.round(successes / count * 100)}% successful` : 'No attempts yet'}</p>
            <small>{sessions.length} sessions · {relevant.filter(item => plan.mastered.has(item.id)).length} mastered</small></div>
        })}
      </div>
    </section>
    <section className="panel spaced">
      <h2>Recent success rates</h2>
      {sorted.length ? <ol className="trend">{sorted.slice(0, 8).reverse().map((item, index) => {
        const percent = Math.round(rate(item) * 100)
        return <li key={item.id}><span>{index + 1}. {exercises.find(e => e.id === item.exerciseId)?.title}</span><progress max="100" value={percent} aria-label="Session success rate" /><strong>{percent}%</strong></li>
      })}</ol> : <p className="muted">Your trend will appear here after your first saved session.</p>}
    </section>
    <section className="panel spaced">
      <h2>Session history</h2>
      {sorted.length ? <ul className="history">{sorted.map(item => {
        const exercise = exercises.find(exercise => exercise.id === item.exerciseId)
        return <li key={item.id}><strong>{exercise?.title}</strong><small>{new Date(item.date).toLocaleString()} · {exercise?.levels[item.level]}</small>
          <p>{item.successes}/{item.attempts} successful · {Math.floor(item.seconds / 60)}m {item.seconds % 60}s</p>
          {item.notes && <p className="notes">{item.notes}</p>}</li>
      })}</ul> : <p className="muted">No sessions logged yet.</p>}
      {data.restDays.length > 0 && <p className="muted">Rest days: {[...data.restDays].sort().reverse().join(', ')}</p>}
    </section>
  </>
}
