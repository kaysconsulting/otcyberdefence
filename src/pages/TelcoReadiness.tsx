import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { AreaId, Band, Capability, EntryId, FixId, Inputs, PathStep, BlockedStep, ScenarioId, SimResult, ZoneId } from '../telco/engine/types.ts'
import { DEFAULT_INPUTS, effective } from '../telco/engine/inputs.ts'
import { worstCase } from '../telco/engine/model.ts'
import { applyFixes, AREA_ENTRIES, AREA_FIXES, AREA_ORDER, fixApplies, PHASE_FIXES, PHASE_ORDER, progress, rankFixes } from '../telco/engine/fixes.ts'
import { detection, LAST_REVIEWED, runScenario, SCENARIOS, type ScenarioResult } from '../telco/engine/scenarios.ts'
import { obligations, OBLIGATION_FIXES, readyCount, type ObligationResult } from '../telco/engine/obligations.ts'
import * as C from '../telco/content/copy.ts'
import * as RL from '../telco/content/roles.ts'
import type { Role } from '../telco/content/roles.ts'
import NetworkDiagram, { Legend } from '../telco/ui/NetworkDiagram.tsx'
import { track } from '../blast/analytics.ts'
import { postForm } from '../lib/forms.ts'
import { img } from '../media.ts'

type Step = 0 | 1 | 2 | 3 | 4 | 5
const STEPS = C.STEP_NAMES
const stepLabel = (n: number) => `Step ${n} · ${STEPS[n - 1]}`
const ev = (name: string, props?: Record<string, string | number>) => track(`telco_${name}`, props)

type State = { step: Step; inputs: Inputs; unsure: (keyof Inputs)[]; capability: Capability; fixes: FixId[]; pretick: boolean; qi: number; role: Role | null }
type Action =
  | { t: 'step'; step: Step }
  | { t: 'set'; key: keyof Inputs; value: Inputs[keyof Inputs] }
  | { t: 'unsure'; key: keyof Inputs }
  | { t: 'capability'; capability: Capability }
  | { t: 'toggleFix'; fix: FixId }
  | { t: 'setFixes'; fixes: FixId[] }
  | { t: 'qi'; qi: number }
  | { t: 'role'; role: Role }

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'step':
      return { ...s, step: a.step }
    case 'set':
      return { ...s, inputs: { ...s.inputs, [a.key]: a.value }, unsure: s.unsure.filter((k) => k !== a.key) }
    case 'unsure':
      return { ...s, unsure: s.unsure.includes(a.key) ? s.unsure.filter((k) => k !== a.key) : [...s.unsure, a.key] }
    case 'capability':
      return { ...s, capability: a.capability }
    case 'toggleFix':
      return { ...s, pretick: false, fixes: s.fixes.includes(a.fix) ? s.fixes.filter((f) => f !== a.fix) : [...s.fixes, a.fix] }
    case 'setFixes':
      return { ...s, pretick: false, fixes: a.fixes }
    case 'qi':
      return { ...s, qi: Math.max(0, a.qi) }
    case 'role':
      // A different role asks a different set of questions, so start them from the top.
      return { ...s, role: a.role, qi: s.role === a.role ? s.qi : 0 }
  }
}

/** Who is using the tool: changes words, questions and what results lead with. */
const RoleCtx = createContext<Role>('engineer')
const useRole = () => useContext(RoleCtx)
const fixName = (f: FixId, r: Role) => (RL.isPlain(r) ? RL.plainFix[f] : C.fixes[f].name)

const levelOf = (b: Band): 'high' | 'medium' | 'low' => (b === 'Highly exposed' ? 'high' : b === 'Partly exposed' ? 'medium' : 'low')
const scrollTop = () => window.scrollTo({ top: Math.max(0, (document.getElementById('tc-top')?.offsetTop ?? 0) - 90), behavior: 'instant' })

export default function TelcoReadiness() {
  const [s, dispatch] = useReducer(reducer, { step: 0, inputs: DEFAULT_INPUTS, unsure: [], capability: 2, fixes: [], pretick: true, qi: 0, role: null })
  const go = (step: Step) => dispatch({ t: 'step', step })
  // Scroll after the step renders, since the hero shrinks once the tool starts.
  useEffect(() => {
    if (s.step > 0) scrollTop()
  }, [s.step])
  useEffect(() => {
    document.title = 'Telco SOCI Readiness | OT Cyber Defence'
    ev('landing_view')
  }, [])

  // "Not sure" answers are scored as the riskier option everywhere.
  const inputs = useMemo(() => effective(s.inputs, s.unsure), [s.inputs, s.unsure])
  const main = useMemo(() => worstCase(inputs, s.capability), [inputs, s.capability])
  const fixedInputs = useMemo(() => applyFixes(inputs, s.fixes), [inputs, s.fixes])
  const fixed = useMemo(() => worstCase(fixedInputs, s.capability), [fixedInputs, s.capability])
  const setCap = (capability: Capability) => {
    ev('attacker_changed', { capability })
    dispatch({ t: 'capability', capability })
  }

  const role = s.role ?? 'engineer'
  return (
    <RoleCtx.Provider value={role}>
    <div className="br">
      <div className={`banner${s.step > 0 ? ' tc-banner-compact' : ''}`} style={{ backgroundImage: `url('${img('control-room', 2400)}')` }}>
        <div className="wrap">
          <div className="crumb">
            <Link to="/">Home</Link> / Telco SOCI Readiness
          </div>
          {s.step === 0 && (
            <span className="eyebrow" style={{ color: '#FF8A92' }}>
              {C.landing.eyebrow}
            </span>
          )}
          <h1>{s.step > 0 ? C.landing.eyebrow : C.landing.title}</h1>
          {s.step === 0 && <p>{C.landing.sub}</p>}
          {s.step === 0 && (
            <button className="btn btn-red" onClick={() => (ev('build_started'), go(1))}>
              {C.landing.cta}
            </button>
          )}
        </div>
      </div>

      <section id="tc-top" className={s.step === 0 ? '' : 'br-tight'}>
        <div className="wrap">
          {s.step === 0 ? (
            <Landing onStart={() => go(1)} />
          ) : (
            <>
              <Progress step={s.step} go={go} />
              {s.role && <RoleBar role={s.role} setRole={(r) => (ev('role_changed', { role: r }), dispatch({ t: 'role', role: r }))} />}
              {s.step === 1 && (
                <Build
                  role={s.role}
                  setRole={(r) => (ev('role_picked', { role: r }), dispatch({ t: 'role', role: r }))}
                  inputs={s.inputs}
                  unsure={s.unsure}
                  qi={s.qi}
                  setQi={(qi) => dispatch({ t: 'qi', qi })}
                  set={(key, value) => dispatch({ t: 'set', key, value })}
                  setUnsure={(key) => (ev('not_sure', { question: key }), dispatch({ t: 'unsure', key }))}
                  next={() => go(2)}
                />
              )}
              {s.step === 2 && <Exposure inputs={inputs} unsure={s.unsure} data={main} capability={s.capability} setCap={setCap} next={() => go(3)} back={() => go(1)} />}
              {s.step === 3 && <Exercise inputs={inputs} next={() => go(4)} back={() => go(2)} />}
              {s.step === 4 && <Obligations inputs={inputs} capability={s.capability} next={() => go(5)} back={() => go(3)} />}
              {s.step === 5 && (
                <Plan
                  inputs={inputs}
                  fixes={s.fixes}
                  pretick={s.pretick}
                  setFixes={(fixes) => dispatch({ t: 'setFixes', fixes })}
                  toggle={(fix) => (ev('fix_toggled', { fix }), dispatch({ t: 'toggleFix', fix }))}
                  current={main.worst}
                  withFixes={fixed.worst}
                  fixedInputs={fixedInputs}
                  capability={s.capability}
                  setCap={setCap}
                  back={() => go(4)}
                />
              )}
            </>
          )}
        </div>
      </section>

      <PrintSummary inputs={inputs} fixes={s.fixes} current={main.worst} withFixes={fixed.worst} fixedInputs={fixedInputs} capability={s.capability} />
    </div>
    </RoleCtx.Provider>
  )
}

/* ---------------- Step 0: landing ---------------- */
function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="br-landing">
      <p className="br-intro">{C.landing.intro}</p>
      <ol className="br-steps5">
        {C.landing.points.map((p, k) => (
          <li key={p.title}>
            <span className="br-steps5-n">{k + 1}</span>
            <b>{p.title}</b>
            <p>{p.text}</p>
            <small>
              <em>You get:</em> {p.get}
            </small>
          </li>
        ))}
      </ol>
      <p className="br-centre">
        <button className="btn btn-blue" onClick={onStart}>
          {C.landing.cta}
        </button>
      </p>
      <p className="fine br-centre">{C.privacyPromise}</p>
      <p className="fine br-centre">{C.disclaimer}</p>
      <p className="fine br-centre">
        Run an operational site instead of a carrier network? Try <Link to="/blast-radius">OT Blast Radius</Link>.
      </p>
    </div>
  )
}

function Progress({ step, go }: { step: Step; go: (s: Step) => void }) {
  return (
    <ol className="br-progress tc-progress">
      {STEPS.map((label, k) => {
        const n = (k + 1) as Step
        return (
          <li key={label} className={n === step ? 'on' : n < step ? 'done' : ''}>
            <button onClick={() => n < step && go(n)} disabled={n > step}>
              <b>{n}</b> <span>{label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function Nav({ back, next, backLabel, nextLabel }: { back?: () => void; next?: () => void; backLabel?: string; nextLabel?: string }) {
  return (
    <div className="br-nav">
      {back ? (
        <button className="btn btn-line-b" onClick={back}>
          ← {backLabel}
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button className="btn btn-red" onClick={next}>
          {nextLabel} →
        </button>
      ) : (
        <span />
      )}
    </div>
  )
}

/* ---------------- Step 1: describe your network ---------------- */
type Q = (typeof C.groups)[number]['questions'][number] & { gi: number }
type Opt = { value: Inputs[keyof Inputs]; label: string; hint?: string }

/** The questions this role is asked, in order, worded for them. */
function questionsFor(role: Role): Q[] {
  const plain = RL.isPlain(role)
  return C.groups.flatMap((g, gi) =>
    g.questions
      .filter((q) => RL.asksAll(role) || RL.SHORT_SET.includes(q.id))
      .map((q) => {
        const p = plain ? RL.plainQuestions[q.id] : undefined
        return { ...q, gi, label: p?.label ?? q.label, helper: p?.helper ?? q.helper } as Q
      }),
  )
}

function optionsOf(q: Q, role: Role): Opt[] {
  if (q.kind === 'yesno')
    return [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ]
  if (q.kind !== 'choice') return []
  const p = RL.isPlain(role) ? RL.plainQuestions[q.id]?.options : undefined
  return q.options.map((o) => (p?.[String(o.value)] ? { value: o.value, ...p[String(o.value)] } : o))
}

function answerLabel(q: Q, role: Role, inputs: Inputs, unsure: (keyof Inputs)[]) {
  if (unsure.includes(q.id)) return RL.isPlain(role) ? RL.plainNotSure.label : 'Not sure'
  if (q.kind === 'slider') return String(inputs.vendorCount)
  return optionsOf(q, role).find((o) => o.value === inputs[q.id])?.label ?? ''
}

function RoleBar({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  return (
    <p className="tc-rolebar">
      <label htmlFor="tc-role">Showing this for</label>
      <select id="tc-role" aria-label="Change who this is for" value={role} onChange={(e) => setRole(e.target.value as Role)}>
        {RL.roles.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </p>
  )
}

function Build({ role, setRole, inputs, unsure, qi, setQi, set, setUnsure, next }: { role: Role | null; setRole: (r: Role) => void; inputs: Inputs; unsure: (keyof Inputs)[]; qi: number; setQi: (n: number) => void; set: (k: keyof Inputs, v: Inputs[keyof Inputs]) => void; setUnsure: (k: keyof Inputs) => void; next: () => void }) {
  if (!role)
    return (
      <div className="br-build tc-col">
        <span className="eyebrow">{stepLabel(1)}</span>
        <h2>Describe a network like yours</h2>
        <div className="tc-qcard">
          <h3>{RL.picker.title}</h3>
          <p className="tc-qhelp">{RL.picker.sub}</p>
          <div className="tc-choices" role="radiogroup" aria-label={RL.picker.title}>
            {RL.roles.map((r) => (
              <button key={r.value} role="radio" aria-checked={false} onClick={() => setRole(r.value)}>
                <span>
                  <b>{r.label}</b>
                  <small>{r.hint}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  return <Wizard role={role} inputs={inputs} unsure={unsure} qi={qi} setQi={setQi} set={set} setUnsure={setUnsure} next={next} />
}

function Wizard({ role, inputs, unsure, qi, setQi, set, setUnsure, next }: { role: Role; inputs: Inputs; unsure: (keyof Inputs)[]; qi: number; setQi: (n: number) => void; set: (k: keyof Inputs, v: Inputs[keyof Inputs]) => void; setUnsure: (k: keyof Inputs) => void; next: () => void }) {
  const QUESTIONS = useMemo(() => questionsFor(role), [role])
  const plain = RL.isPlain(role)
  const total = QUESTIONS.length
  const review = qi >= total
  const q = QUESTIONS[Math.min(qi, total - 1)]
  const isUnsure = (k: keyof Inputs) => unsure.includes(k)
  const timer = useRef<number | undefined>(undefined)
  // Opened from the review screen: an answer goes straight back to the review.
  const [fromReview, setFromReview] = useState(false)
  const forward = () => {
    setQi(fromReview ? total : qi + 1)
    setFromReview(false)
  }
  // A short pause after a pick, so the choice is seen before the next question slides in.
  const advance = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(forward, 280)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const pick = (v: Inputs[keyof Inputs]) => {
    set(q.id, v)
    advance()
  }
  const notSure = () => {
    if (!isUnsure(q.id)) setUnsure(q.id)
    advance()
  }
  // Keyboard: 1 to 4 picks an option, N is "Not sure", Enter or → moves on, ← goes back.
  useEffect(() => {
    if (review) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || ((e.target as HTMLElement)?.tagName === 'INPUT' && e.key !== 'Enter') || (e.target as HTMLElement)?.tagName === 'SELECT') return
      const opts = optionsOf(q, role)
      const n = Number(e.key)
      if (n >= 1 && n <= opts.length) pick(opts[n - 1].value)
      else if (e.key.toLowerCase() === 'n') notSure()
      else if (e.key === 'Enter' || e.key === 'ArrowRight') forward()
      else if (e.key === 'ArrowLeft' && qi > 0) setQi(qi - 1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const sections = C.groups.map((g, gi) => ({ title: g.title, gi, qs: QUESTIONS.filter((x) => x.gi === gi) })).filter((x) => x.qs.length)
  const inSection = QUESTIONS.filter((x) => x.gi === q.gi)
  const NS = plain ? RL.plainNotSure : { label: 'Not sure', hint: 'We assume the riskier answer' }
  return (
    <div className="br-build tc-col">
      <span className="eyebrow">{stepLabel(1)}</span>
      <h2>Describe a network like yours</h2>
      <p className="lead tc-build-lead">
        {total} questions, one at a time{plain ? ', in plain English' : ''}. Not sure? Say so and we assume the riskier answer.
      </p>

      <ol className="tc-sections" aria-label="Sections">
        {sections.map((sec, k) => {
          const start = QUESTIONS.indexOf(sec.qs[0])
          const end = start + sec.qs.length
          const state = review || qi >= end ? 'done' : qi >= start ? 'on' : ''
          return (
            <li key={sec.title} className={state}>
              <button onClick={() => (setFromReview(false), setQi(start))}>
                <b>{state === 'done' ? '✓' : k + 1}</b> <span>{sec.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="tc-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(qi, total)}>
        <i style={{ width: `${(Math.min(qi, total) / total) * 100}%` }} />
      </div>

      {review ? (
        <div className="tc-qcard">
          <span className="tc-qmeta">All {total} questions answered</span>
          <h3>Here is the network you described</h3>
          <p className="tc-qhelp">Check it over. Click any answer to change it.</p>
          {sections.map((sec) => (
            <div key={sec.title} className="tc-recap">
              <b>{sec.title}</b>
              <ul>
                {sec.qs.map((x) => (
                  <li key={x.id}>
                    <button onClick={() => (setFromReview(true), setQi(QUESTIONS.indexOf(x)))}>
                      <span>{x.label}</span>
                      <em className={isUnsure(x.id) ? 'unsure' : ''}>{answerLabel(x, role, inputs, unsure)}</em>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!RL.asksAll(role) && <p className="tc-qhelp" style={{ marginTop: 16 }}>Other technical details use typical answers for a carrier. Your team can refine them by choosing their role.</p>}
          {unsure.length > 0 && <p className="br-note">{C.notes.unsureCount(unsure.length)}</p>}
        </div>
      ) : (
        <div className="tc-qcard" key={q.id}>
          <span className="tc-qmeta">
            {C.groups[q.gi].title} · Question {inSection.indexOf(q) + 1} of {inSection.length}
          </span>
          <h3>{q.label}</h3>
          <p className="tc-qhelp">{q.helper}</p>
          {q.kind === 'slider' ? (
            <div className="br-slider tc-slider">
              <input type="range" min={0} max={50} value={inputs.vendorCount} onChange={(e) => set('vendorCount', Number(e.target.value))} aria-label={q.label} autoFocus />
              <output>{isUnsure('vendorCount') ? '?' : inputs.vendorCount}</output>
              <small>{C.notes.vendorRisk(inputs.vendorCount)}</small>
            </div>
          ) : (
            <div className="tc-choices" role="radiogroup" aria-label={q.label}>
              {optionsOf(q, role).map((o, k) => {
                const on = !isUnsure(q.id) && inputs[q.id] === o.value
                return (
                  <button key={String(o.value)} role="radio" aria-checked={on} className={on ? 'on' : ''} onClick={() => pick(o.value)}>
                    <kbd>{k + 1}</kbd>
                    <span>
                      <b>{o.label}</b>
                      {o.hint && <small>{o.hint}</small>}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
          <div className="tc-choices tc-choices-unsure">
            <button role="radio" aria-checked={isUnsure(q.id)} className={`br-unsure${isUnsure(q.id) ? ' on' : ''}`} onClick={notSure}>
              <kbd>N</kbd>
              <span>
                <b>{NS.label}</b>
                <small>{NS.hint}</small>
              </span>
            </button>
          </div>
          <div className="tc-qnav">
            <button className="btn btn-line-b" onClick={() => setQi(qi - 1)} disabled={qi === 0}>
              ← Back
            </button>
            <span className="tc-qcount">
              {qi + 1} of {total}
            </span>
            <button className="btn btn-blue" onClick={forward}>
              {fromReview || qi === total - 1 ? 'Back to my answers' : q.kind === 'slider' ? 'Next' : 'Keep this answer'} →
            </button>
          </div>
          <p className="tc-tip">Tip: press 1 to {Math.max(2, optionsOf(q, role).length)} to answer, N for {NS.label.toLowerCase()}, ← to go back.</p>
        </div>
      )}

      <div className="br-nav">
        {review ? (
          <button className="btn btn-line-b" onClick={() => setQi(total - 1)}>
            ← Last question
          </button>
        ) : (
          <button className="tc-skip" onClick={next}>
            Short on time? See results with the answers so far
          </button>
        )}
        {review && (
          <button className="btn btn-red" onClick={next}>
            {STEPS[1]} →
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------------- shared bits ---------------- */
function ScoreBadge({ score, band }: { score: number; band: Band }) {
  const tone = band === 'Contained' ? 'ok' : band === 'Partly exposed' ? 'mid' : 'bad'
  return (
    <div className={`br-score br-${tone}`}>
      <b>{score}</b>
      <span>
        <strong>{band}</strong>
        <small>{C.results.bands[band]}</small>
      </span>
    </div>
  )
}

function AttackerPicker({ value, onChange }: { value: Capability; onChange: (c: Capability) => void }) {
  return (
    <div className="br-attacker">
      <span>Attacker</span>
      <div className="br-opts" role="radiogroup" aria-label="Attacker">
        {C.attackers.map((a) => (
          <button key={a.value} role="radio" aria-checked={value === a.value} className={value === a.value ? 'on' : ''} onClick={() => onChange(a.value)}>
            <b>{a.label}</b>
            <span>{a.hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function PathList({ path, blocked, r }: { path: PathStep[]; blocked: BlockedStep[]; r: SimResult }) {
  const T = C.results.tags
  return (
    <ol className="br-path">
      {!r.entrySucceeded && (
        <li className="br-step-block">
          <span className="br-tag">{T.failed}</span>
          {r.entryReason}
        </li>
      )}
      {path.map((p, k) => (
        <li key={k} className={`br-step-${p.kind === 'entry' ? 'entry' : 'spread'}${p.likelihood !== 'likely' ? ` br-step-${p.likelihood}` : ''}`}>
          <span className="br-tag">{p.kind === 'entry' ? T.entry : T[p.likelihood]}</span>
          {p.reason}
        </li>
      ))}
      {blocked.map((b, k) => (
        <li key={`b${k}`} className="br-step-block">
          <span className="br-tag">{T.stopped}</span>
          {b.reason}
        </li>
      ))}
    </ol>
  )
}

function Banners({ z }: { z: SimResult['zoneLikelihood'] }) {
  const B = C.results.banners
  const deep = z.core ?? z.transport
  return (
    <>
      {z.li && <div className={`br-banner ${z.li === 'unlikely' ? 'br-banner-amber' : 'br-banner-red'}`}>{B.li}</div>}
      {deep && <div className="br-banner">{deep === 'likely' ? B.services : B.servicesMaybe}</div>}
      {z.site && z.site !== 'unlikely' && <div className="br-banner br-banner-amber">{B.site}</div>}
      {z.corp && z.corp !== 'unlikely' && <div className="br-banner br-banner-amber">{z.corp === 'likely' ? B.customer : B.customerMaybe}</div>}
    </>
  )
}

/** Plays an attack one zone at a time, in the order it is likely reached. */
function usePlayback(path: PathStep[], key: string) {
  const order = useMemo(() => {
    const seq: ZoneId[] = []
    path.forEach((p) => !seq.includes(p.to) && seq.push(p.to))
    return seq
  }, [path])
  const [shown, setShown] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const start = () => {
    window.clearInterval(timer.current)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setShown(null)
    setShown(0)
    timer.current = window.setInterval(() => setShown((n) => (n === null || n >= order.length ? (window.clearInterval(timer.current), null) : n + 1)), 700)
  }
  useEffect(() => () => window.clearInterval(timer.current), [])
  useEffect(() => setShown(null), [key])
  const playing = shown !== null
  return { start, playing, active: playing && shown! > 0 ? order[shown! - 1] : null, visible: new Set(playing ? order.slice(0, shown!) : order) }
}

const visibleZones = (z: SimResult['zoneLikelihood'], visible: Set<ZoneId>) => Object.fromEntries(Object.entries(z).filter(([k]) => visible.has(k as ZoneId))) as SimResult['zoneLikelihood']

/* ---------------- Step 2: exposure ---------------- */
type Finding = { text: string; good: boolean }
function areaFindings(i: Inputs, a: AreaId): Finding[] {
  const A = C.answerText
  const out: Finding[] = []
  const add = (k: keyof Inputs, best: Inputs[keyof Inputs]) => out.push({ text: A[k]![String(i[k])]!, good: i[k] === best })
  if (a === 'network') {
    add('mgmtSeparation', 'dedicated_oob')
    add('mgmtSegmentation', 'per_asset')
    add('liIsolation', 'separate')
    add('siteOt', 'isolated')
  } else if (a === 'access') {
    add('privilegedAuth', 'phishing_resistant')
    add('vendorAccess', 'brokered')
    out.push({ text: C.vendorCountText(i.vendorCount), good: i.vendorCount <= 2 })
    out.push({ text: i.sharedAccounts ? C.sharedText.yes : C.sharedText.no, good: !i.sharedAccounts })
  } else {
    add('edgePatching', 'current')
    add('apiExposure', 'tested')
  }
  return [...out.filter((f) => !f.good), ...out.filter((f) => f.good)]
}

function Exposure({ inputs, unsure, data, capability, setCap, next, back }: { inputs: Inputs; unsure: (keyof Inputs)[]; data: ReturnType<typeof worstCase>; capability: Capability; setCap: (c: Capability) => void; next: () => void; back: () => void }) {
  const [view, setView] = useState<'whole' | AreaId>('whole')
  const [entry, setEntry] = useState<EntryId | null>(null)
  const areas = useMemo(
    () =>
      AREA_ORDER.map((id) => {
        const runs = data.runs.filter((r) => AREA_ENTRIES[id].includes(r.entry))
        const worst = runs.reduce((w, r) => (r.exposureScore > w.exposureScore ? r : w))
        return { id, runs, worst, findings: areaFindings(inputs, id), alone: worstCase(applyFixes(inputs, AREA_FIXES[id]), capability).worst.exposureScore }
      }),
    [data, inputs, capability],
  )
  useEffect(() => ev('results_viewed', { band: data.worst.band }), [data.worst.band])
  const area = view === 'whole' ? null : areas.find((a) => a.id === view)!
  const pool = area ? area.runs : data.runs
  const r = (entry && pool.find((x) => x.entry === entry)) || (area ? area.worst : data.worst)
  const play = usePlayback(r.path, `${r.entry}-${capability}-${view}`)
  const pick = (v: 'whole' | AreaId) => {
    setView(v)
    setEntry(null)
    ev('area_viewed', { area: v })
  }
  const role = useRole()
  const plain = RL.isPlain(role)
  // Technical roles always see the detail; others open it when they want it.
  const [opened, setTechOpen] = useState(false)
  const techOpen = !plain || opened
  return (
    <div>
      <span className="eyebrow">{stepLabel(2)}</span>
      <h2>{C.results.heading}</h2>
      {!plain && <AttackerPicker value={capability} onChange={setCap} />}
      <Briefing inputs={inputs} data={data} capability={capability} />
      {plain && (
        <button className="tc-techtoggle" aria-expanded={techOpen} onClick={() => setTechOpen(!techOpen)}>
          {techOpen ? 'Hide the technical detail' : RL.briefing.technical} {techOpen ? '▴' : '▾'}
        </button>
      )}
      {techOpen && (
      <>
      {unsure.length > 0 && (
        <div className="br-flags">
          <p className="br-note">{C.notes.unsureCount(unsure.length)}</p>
        </div>
      )}
      <h3 className="br-areas-h">{C.areas.heading}</h3>
      <p className="br-areas-sub">{C.areas.sub}</p>
      <div className="br-areas">
        <button className={`br-area br-area-whole${view === 'whole' ? ' on' : ''}`} onClick={() => pick('whole')}>
          <span className="br-area-top">
            <b>{C.areas.wholeSite}</b>
            <em className={`br-area-score lvl-${levelOf(data.worst.band)}`}>{data.worst.exposureScore}</em>
          </span>
          <span className={`br-level lvl-${levelOf(data.worst.band)}`}>{C.areas.level[levelOf(data.worst.band)]}</span>
          <span className="br-area-q">{C.areas.wholeHint}</span>
        </button>
        {areas.map((a) => (
          <button key={a.id} className={`br-area${view === a.id ? ' on' : ''}`} onClick={() => pick(a.id)}>
            <span className="br-area-top">
              <b>{C.areas.list[a.id].title}</b>
              <em className={`br-area-score lvl-${levelOf(a.worst.band)}`}>{a.worst.exposureScore}</em>
            </span>
            <span className={`br-level lvl-${levelOf(a.worst.band)}`}>{C.areas.level[levelOf(a.worst.band)]}</span>
            <span className="br-area-q">{C.areas.list[a.id].question}</span>
          </button>
        ))}
      </div>

      <div className="br-result br-area-detail">
        <div className="br-summary">
          <h3 style={{ marginTop: 0 }}>{area ? C.areas.list[area.id].title : C.areas.wholeSite}</h3>
          <p className="br-area-ways">{area ? C.areas.list[area.id].ways : C.areas.wholeHint}</p>
          {pool.length > 1 && (
            <div className="br-tabs" role="tablist">
              <button role="tab" aria-selected={!entry} className={!entry ? 'on' : ''} onClick={() => setEntry(null)}>
                {area ? 'Worst of these' : C.results.worstCase}
              </button>
              {pool.map((x) => (
                <button key={x.entry} role="tab" aria-selected={entry === x.entry} className={entry === x.entry ? 'on' : ''} onClick={() => setEntry(x.entry)}>
                  {C.ENTRY_NAMES[x.entry]}
                </button>
              ))}
            </div>
          )}
          <ScoreBadge score={r.exposureScore} band={r.band} />
          {area && <p className="tc-small">{C.areas.alone(data.worst.exposureScore, area.alone)}</p>}
          <p className="br-entry-line">
            <b>Way in:</b> {C.ENTRY_NAMES[r.entry]}. {r.entryReason}
          </p>
          <Banners z={r.zoneLikelihood} />
          {area && (
            <>
              {area.findings.some((f) => !f.good) && <h3>What is likely driving it</h3>}
              <ul className="br-findings">
                {area.findings.filter((f) => !f.good).map((f) => (
                  <li key={f.text}>{f.text}</li>
                ))}
              </ul>
              {area.findings.some((f) => f.good) && <h3>What is likely helping</h3>}
              <ul className="br-findings good">
                {area.findings.filter((f) => f.good).map((f) => (
                  <li key={f.text}>{f.text}</li>
                ))}
              </ul>
            </>
          )}
          <details className="br-details">
            <summary>{C.results.showPath}</summary>
            <PathList path={r.path} blocked={r.blocked} r={r} />
          </details>
        </div>
        <div className="br-diagram-wrap">
          <NetworkDiagram zones={visibleZones(r.zoneLikelihood, play.visible)} entryZones={r.entrySucceeded ? r.entryZones : []} blocked={play.playing ? [] : r.blocked} activeZone={play.active} />
          <Legend />
          <button className="btn btn-line br-play" onClick={play.start} disabled={play.playing || !r.entrySucceeded}>
            {play.playing ? 'Playing the attack…' : '▶ Play the attack step by step'}
          </button>
        </div>
      </div>
      </>
      )}
      <p className="fine">
        {C.results.likelihoodNote} {C.disclaimer}
      </p>
      <Nav back={back} backLabel={STEPS[0]} next={next} nextLabel={STEPS[2]} />
    </div>
  )
}


/** What the result means, in the words of the person reading it: one headline, three points, the rest on request. */
function Briefing({ inputs, data, capability }: { inputs: Inputs; data: ReturnType<typeof worstCase>; capability: Capability }) {
  const role = useRole()
  const B = RL.briefing
  const head = B[role]
  const plain = RL.isPlain(role)
  const z = data.worst.zoneLikelihood
  const real = (l?: string) => l === 'likely' || l === 'possible'
  const impacts = [
    real(z.core ?? z.transport) && B.impacts.services,
    real(z.corp) && B.impacts.customer,
    real(z.li) && B.impacts.li,
    real(z.site) && B.impacts.site,
  ].filter(Boolean) as string[]
  const issues = (Object.keys(RL.plainIssue) as (keyof Inputs)[]).map((k) => RL.plainIssue[k]?.[String(inputs[k])]).filter(Boolean) as string[]
  const ranked = rankFixes(inputs, capability).slice(0, 3)
  const phaseOf = (f: FixId) => PHASE_ORDER.find((p) => PHASE_FIXES[p].includes(f))!
  const ob = readyCount(obligations(inputs, capability))
  if (!plain)
    return (
      <div className="tc-brief tc-brief-tech">
        <b>{head.title}</b>
        <span>{head.sub}</span>
      </div>
    )
  const tiles = [
    { k: 'What could happen', v: impacts[0] ?? 'An attack is likely to stay close to where it gets in.' },
    { k: 'Main reason', v: issues[0] ?? 'Your answers describe a well-separated network.' },
    role === 'board' ? { k: 'SOCI', v: B.toObligations(ob.ready, ob.of) } : { k: 'First step', v: ranked[0] ? `${fixName(ranked[0].fix, role)} (${C.phases[phaseOf(ranked[0].fix)].when.toLowerCase()})` : 'Keep it working: review and re-test regularly.' },
  ]
  return (
    <div className="tc-brief">
      <span className="tc-qmeta">{head.title}</span>
      <p className={`tc-headline lvl-${levelOf(data.worst.band)}`}>{B.headline[data.worst.band]}</p>
      <div className="tc-tiles">
        {tiles.map((t) => (
          <div key={t.k}>
            <small>{t.k}</small>
            <p>{t.v}</p>
          </div>
        ))}
      </div>
      <div className="tc-more">
        {role === 'board' && (
          <details open>
            <summary>{RL.board.askTitle}</summary>
            <BoardAsk />
          </details>
        )}
        {role === 'executive' && (
          <details>
            <summary>{RL.cost.title}</summary>
            <CostCalc />
          </details>
        )}
        <details>
          <summary>All reasons and first decisions</summary>
          <div className="tc-two">
            <div>
              <h4>{B.topIssues}</h4>
              <ul>
                {issues.slice(0, 5).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>{B.decisions}</h4>
              <ol>
                {ranked.map((x) => (
                  <li key={x.fix}>
                    {fixName(x.fix, role)} <small>({C.phases[phaseOf(x.fix)].when.toLowerCase()})</small>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </details>
        <details>
          <summary>SOCI: {B.toObligations(ob.ready, ob.of)}</summary>
          <p className="tc-small">{B.deadlines}</p>
          {role === 'board' && <p className="tc-small">{RL.board.accountability}</p>}
        </details>
      </div>
    </div>
  )
}

function BoardAsk() {
  return (
    <ol className="tc-asklist">
      {RL.board.ask.map((q) => (
        <li key={q}>{q}</li>
      ))}
    </ol>
  )
}

/** Revenue at risk from the visitor's own figures; published reference points carry their source. */
function costAtRisk(revenueMillions: number, hours: number) {
  return (revenueMillions * 1_000_000 * hours) / (365 * 24)
}
const money = (n: number) => (n >= 1e9 ? `A$${(n / 1e9).toFixed(1)} billion` : n >= 1e6 ? `A$${(n / 1e6).toFixed(1)} million` : `A$${Math.round(n / 1000).toLocaleString('en-AU')} thousand`)

function CostCalc() {
  const T = RL.cost
  const [rev, setRev] = useState('')
  const [hours, setHours] = useState(24)
  const r = Number(rev)
  return (
    <div className="tc-cost">
      <p className="tc-small">{T.sub}</p>
      <div className="row2">
        <label>
          {T.revenue}
          <input inputMode="decimal" value={rev} placeholder="e.g. 250" onChange={(e) => setRev(e.target.value.replace(/[^0-9.]/g, ''))} />
        </label>
        <label>
          {T.hours}: <b>{hours}</b>
          <input type="range" min={1} max={168} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          <small>{T.hoursHint}</small>
        </label>
      </div>
      <p className="tc-cost-result">{r > 0 ? T.result(money(costAtRisk(r, hours)), hours) : T.empty}</p>
      <p className="tc-small">{T.beyond}</p>
      <h4>{T.refsTitle}</h4>
      <ul>
        {T.refs.map((x) => (
          <li key={x.url}>
            {x.text}{' '}
            <a href={x.url} target="_blank" rel="noopener noreferrer">
              Source: {x.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------- Step 3: exercise ---------------- */
const outcomeClass = (r: ScenarioResult) => (r.outcome === 'succeeds' ? 'bad' : r.outcome === 'partly' ? 'warn' : 'ok')

function Exercise({ inputs, next, back }: { inputs: Inputs; next: () => void; back: () => void }) {
  const [id, setId] = useState<ScenarioId | null>(null)
  const sc = SCENARIOS.find((x) => x.id === id)
  const res = useMemo(() => (id ? runScenario(inputs, id) : null), [inputs, id])
  const play = usePlayback(res?.run.path ?? [], id ?? '')
  const { start } = play
  // Replay each time a new attack is picked.
  useEffect(() => {
    if (id) start()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  const E = C.exercise
  const role = useRole()
  const plain = RL.isPlain(role)
  // Injects are revealed one at a time, the way a facilitator runs a tabletop.
  const [inject, setInject] = useState(0)
  const resultRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setInject(0)
    if (id) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [id])
  return (
    <div>
      <span className="eyebrow">{stepLabel(3)}</span>
      <h2>{E.heading}</h2>
      <p className="lead">{E.lead}</p>
      <div className="br-cards tc-cards">
        {SCENARIOS.map((x) => {
          const pickIt = () => (ev('scenario_replayed', { scenario: x.id }), setId(x.id))
          return (
            <div
              key={x.id}
              role="button"
              tabIndex={0}
              aria-pressed={id === x.id}
              className={`br-card${id === x.id ? ' on' : ''}`}
              onClick={pickIt}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pickIt())}
            >
              <span className="br-card-tags">
                <span className="tag">{x.year}</span>
                {x.australian && <span className="tag tag-au">Australia</span>}
              </span>
              <b>{x.name}</b>
              <small>Target: {x.targetLabel}</small>
            </div>
          )
        })}
      </div>
      {res && sc && (
        <div className="br-result" ref={resultRef} style={{ scrollMarginTop: 90 }}>
          <div className="br-summary">
            <h3>{sc.name}</h3>
            <p className="br-facts">
              {sc.facts}{' '}
              <a className="br-source" href={sc.source.url} target="_blank" rel="noopener noreferrer">
                Source: {sc.source.label} ↗
              </a>
            </p>
            {play.playing ? (
              <div className="br-outcome">
                <b>{C.results.outcome.replaying}</b>
                <span>{play.active ? `Likely reaches ${C.ZONE_NAMES[play.active].toLowerCase()}` : 'Trying the way in'}</span>
              </div>
            ) : (
              <div className={`br-outcome ${outcomeClass(res)}`}>
                <b>
                  {C.results.outcome.label[res.outcome]}: {sc.targetLabel.toLowerCase()} {res.targetLikelihood ? C.results.state[res.targetLikelihood === 'likely' ? 'hit' : res.targetLikelihood].toLowerCase() : 'likely not reached'}
                </b>
                <span>{C.ENTRY_NAMES[sc.entry]}, by a {C.attackers.find((a) => a.value === sc.capability)!.label.toLowerCase()}.</span>
              </div>
            )}
            <ol className="tc-injects" data-shown={inject}>
              <li data-n={0}>
                <b>{E.injects.wayIn}</b>
                <span>
                  {res.run.entryReason} {sc.entryNote}
                </span>
              </li>
              <li data-n={1}>
                <b>{E.injects.spread}</b>
                <span>
                  {plain && res.run.path.some((p) => p.kind === 'cross')
                    ? `Likely to reach: ${res.run.path.filter((p) => p.kind === 'cross').map((p) => C.ZONE_NAMES[p.to].toLowerCase()).join(', ')}.`
                    : res.run.path.filter((p) => p.kind === 'cross').length
                    ? res.run.path.filter((p) => p.kind === 'cross').map((p) => p.reason).join(' ')
                    : res.run.entrySucceeded
                      ? 'The attack is likely to stay where it got in.'
                      : 'The way in is likely to fail.'}
                </span>
              </li>
              <li data-n={2}>
                <b>{E.injects.notice}</b>
                <span>
                  {E.detect[detection(inputs, sc)]} {sc.stealthy && E.stealthy}
                </span>
              </li>
              <li data-n={3}>
                <b>{E.injects.clock}</b>
                <span>{E.clock}</span>
              </li>
              <li data-n={4}>
                <b>{E.injects.respond}</b>
                <span>{E.respond[inputs.irPlan]}</span>
              </li>
            </ol>
            {inject < 4 ? (
              <button className="btn btn-blue" onClick={() => setInject(inject + 1)}>
                Next: {[E.injects.spread, E.injects.notice, E.injects.clock, E.injects.respond][inject]} →
              </button>
            ) : (
              <>
                <h3>{E.questionsHeading}</h3>
                <ul className="br-findings plain">
                  {[...(plain ? [] : (E.scenarioQuestions[sc.id] ?? [])), ...RL.exerciseQuestions[role]].slice(0, 3).map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </>
            )}
            <details className="br-details">
              <summary>{C.results.showPath}</summary>
              <PathList path={res.run.path} blocked={res.run.blocked} r={res.run} />
            </details>
          </div>
          <div className="br-diagram-wrap">
            <NetworkDiagram
              zones={visibleZones(res.run.zoneLikelihood, play.visible)}
              entryZones={res.run.entrySucceeded ? res.run.entryZones : []}
              blocked={play.playing ? [] : res.run.blocked}
              activeZone={play.active}
            />
            <Legend />
            <button className="btn btn-line br-play" onClick={play.start} disabled={play.playing || !res.run.entrySucceeded}>
              {play.playing ? 'Replaying…' : '▶ Replay the attack'}
            </button>
          </div>
        </div>
      )}
      <p className="fine">
        {C.methodology} {E.latestNote} {LAST_REVIEWED}.
      </p>
      <p className="fine">{C.disclaimer}</p>
      <Nav back={back} backLabel={STEPS[1]} next={next} nextLabel={STEPS[3]} />
    </div>
  )
}

/* ---------------- Step 4: obligations ---------------- */
const STATUS_ORDER = { gap: 0, partly: 1, check: 2, ready: 3 }
const byStatus = (a: ObligationResult, b: ObligationResult) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]

/** One line per obligation; the detail opens on click. */
function ObligationRow({ o, compare }: { o: ObligationResult; compare?: ObligationResult }) {
  const T = C.obligationText[o.id]
  const role = useRole()
  const steps = OBLIGATION_FIXES[o.id]
  return (
    <details className={`tc-orow tc-${o.status}`}>
      <summary>
        <span className={`tc-pill tc-${o.status}`}>{C.obligations.status[o.status]}</span>
        {compare && compare.status !== o.status && <span className={`tc-pill tc-${compare.status}`}>→ {C.obligations.status[compare.status]}</span>}
        <b>{T.title}</b>
        <span className="tc-orow-why">{o.why}</span>
      </summary>
      <div className="tc-orow-body">
        <small className="tc-ref">{T.ref}</small>
        <p>{T.asks}</p>
        <p className="tc-why">{o.why}</p>
        {steps.length > 0 && o.status !== 'ready' && (
          <small className="tc-helps">
            {C.obligations.helps} {steps.slice(0, 3).map((f) => fixName(f, role)).join(' · ')}
            {steps.length > 3 && ` and ${steps.length - 3} more`}
          </small>
        )}
      </div>
    </details>
  )
}

function ObligationList({ rs, compare }: { rs: ObligationResult[]; compare?: ObligationResult[] }) {
  return (
    <div className="tc-orows">
      {[...rs].sort(byStatus).map((o) => (
        <ObligationRow key={o.id} o={o} compare={compare?.find((c) => c.id === o.id)} />
      ))}
    </div>
  )
}

function Counts({ rs }: { rs: ObligationResult[] }) {
  const n = (st: ObligationResult['status']) => rs.filter((o) => o.status === st).length
  return (
    <span className="tc-counts">
      {(['gap', 'partly', 'ready'] as const).map((st) => (n(st) ? <span key={st} className={`tc-pill tc-${st}`}>{n(st)} {C.obligations.status[st].toLowerCase()}</span> : null))}
    </span>
  )
}

function Obligations({ inputs, capability, next, back }: { inputs: Inputs; capability: Capability; next: () => void; back: () => void }) {
  const rs = useMemo(() => obligations(inputs, capability), [inputs, capability])
  const n = readyCount(rs)
  const O = C.obligations
  useEffect(() => ev('obligations_viewed', { ready: n.ready }), [n.ready])
  const group = (g: ObligationResult['group']) => rs.filter((o) => o.group === g)
  return (
    <div className="tc-col tc-col-wide">
      <span className="eyebrow">{stepLabel(4)}</span>
      <h2>{O.heading}</h2>
      <p className="tc-headline">{O.ready(n.ready, n.of)}</p>
      <p className="tc-small" style={{ marginTop: -8 }}>Gaps first. Click any line for what it asks and what helps.</p>
      <h3 className="br-areas-h">{O.allTitle}</h3>
      <ObligationList rs={group('all')} />
      <div className="tc-more">
        <details>
          <summary>
            {O.enhancedTitle} <Counts rs={group('enhanced')} />
          </summary>
          <p className="tc-small">{O.enhancedSub}</p>
          <ObligationList rs={group('enhanced')} />
        </details>
        <details>
          <summary>
            {O.directionTitle} <Counts rs={group('direction')} />
          </summary>
          <p className="tc-small">{O.directionSub}</p>
          <ObligationList rs={group('direction')} />
        </details>
        <details>
          <summary>Who these apply to</summary>
          <p className="tc-small">{O.allSub}</p>
        </details>
      </div>
      <p className="fine">
        {O.sourcesTitle}:{' '}
        {O.sources.map((x, k) => (
          <span key={x.url}>
            {k > 0 && ' · '}
            <a href={x.url} target="_blank" rel="noopener noreferrer">
              {x.label}
            </a>
          </span>
        ))}
      </p>
      <p className="fine">{C.disclaimer}</p>
      <Nav back={back} backLabel={STEPS[2]} next={next} nextLabel={STEPS[4]} />
    </div>
  )
}

/* ---------------- Step 5: plan and summary ---------------- */
type R = SimResult
function Plan(p: { inputs: Inputs; fixes: FixId[]; pretick: boolean; setFixes: (f: FixId[]) => void; toggle: (f: FixId) => void; current: R; withFixes: R; fixedInputs: Inputs; capability: Capability; setCap: (c: Capability) => void; back: () => void }) {
  const ranked = useMemo(() => rankFixes(p.inputs, p.capability), [p.inputs, p.capability])
  const prog = useMemo(() => progress(p.inputs, p.capability, p.fixes), [p.inputs, p.capability, p.fixes])
  const before = useMemo(() => obligations(p.inputs, p.capability), [p.inputs, p.capability])
  const after = useMemo(() => obligations(p.fixedInputs, p.capability), [p.fixedInputs, p.capability])
  const dropOf = (f: FixId) => ranked.find((x) => x.fix === f)?.drop ?? 0
  const { pretick, fixes, setFixes } = p
  // Pre-tick the two biggest likely drops once, so a visitor who doesn't click still sees the improvement.
  useEffect(() => {
    if (pretick && fixes.length === 0) setFixes(ranked.slice(0, 2).map((x) => x.fix))
  }, [pretick, fixes.length, ranked, setFixes])
  const T = C.plan
  const role = useRole()
  const [phase, setPhase] = useState(0)
  const nb = readyCount(before)
  const na = readyCount(after)
  return (
    <div>
      <span className="eyebrow">{stepLabel(5)}</span>
      <h2>{T.heading}</h2>
      <p className="lead">{T.lead}</p>
      {!RL.isPlain(role) && <AttackerPicker value={p.capability} onChange={p.setCap} />}
      <ol className="br-timeline tc-timeline">
        <li>
          <small>{T.today}</small>
          <b className={`lvl-${levelOf(p.current.band)}`}>{p.current.exposureScore}</b>
          <span>{p.current.band}</span>
        </li>
        {prog.map((x) => (
          <li key={x.phase}>
            <small>After phase {PHASE_ORDER.indexOf(x.phase) + 1}</small>
            <b className={`lvl-${levelOf(x.band)}`}>{x.score}</b>
            <span>{C.phases[x.phase].title}</span>
          </li>
        ))}
      </ol>

      <div className="br-result">
        <div className="br-phases">
          <div className="br-tabs tc-phasetabs" role="tablist">
            {PHASE_ORDER.map((ph, k) => (
              <button key={ph} role="tab" aria-selected={k === phase} className={k === phase ? 'on' : ''} onClick={() => setPhase(k)}>
                Phase {k + 1}
                {PHASE_FIXES[ph].some((f) => p.fixes.includes(f)) && ' ✓'}
              </button>
            ))}
          </div>
          {PHASE_ORDER.filter((_, k) => k === phase).map((ph) => (
            <div key={ph} className="br-phase">
              <div className="br-phase-head">
                <span className="br-phase-n">Phase {phase + 1} of {PHASE_ORDER.length}</span>
                <h3>{C.phases[ph].title}</h3>
                <small>Typical timeframe (indicative): {C.phases[ph].when}</small>
              </div>
              <p>{C.phases[ph].intro}</p>
              {C.phases[ph].notes && (
                <ul className="br-findings plain">
                  {C.phases[ph].notes!.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
              {PHASE_FIXES[ph].map((f) => {
                const applies = fixApplies(p.inputs, f)
                const on = p.fixes.includes(f)
                return (
                  <label key={f} className={`br-stepcard${on ? ' on' : ''}${applies ? '' : ' done'}`}>
                    <input type="checkbox" checked={on || !applies} disabled={!applies} onChange={() => p.toggle(f)} />
                    <span>
                      <b>{fixName(f, role)}</b>
                      <em>{applies ? C.fixes[f].detail : T.inPlace}</em>
                      {applies && (
                        <small>
                          {dropOf(f) > 0 ? `On its own: likely −${dropOf(f)} · ` : ''}Disruption: {C.fixes[f].disruption}
                        </small>
                      )}
                    </span>
                  </label>
                )
              })}
              <div className="tc-qnav">
                <button className="btn btn-line-b" disabled={phase === 0} onClick={() => setPhase(phase - 1)}>
                  ← Phase {phase}
                </button>
                {phase < PHASE_ORDER.length - 1 && (
                  <button className="btn btn-blue" onClick={() => setPhase(phase + 1)}>
                    Phase {phase + 2}: {C.phases[PHASE_ORDER[phase + 1]].title} →
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="fine">{T.timeframes}</p>
        </div>
        <div className="br-diagram-wrap br-sticky">
          <div className="br-vs" style={{ marginTop: 0 }}>
            <div>
              <small>{T.today}</small>
              <ScoreBadge score={p.current.exposureScore} band={p.current.band} />
            </div>
            <div>
              <small>{T.withPlan}</small>
              <ScoreBadge score={p.withFixes.exposureScore} band={p.withFixes.band} />
            </div>
          </div>
          <p className="br-gapcount">
            Obligations likely ready: <b>{nb.ready}</b> of {nb.of} today → <b>{na.ready}</b> of {na.of} with your plan
          </p>
          <NetworkDiagram zones={p.withFixes.zoneLikelihood} entryZones={p.withFixes.entrySucceeded ? p.withFixes.entryZones : []} blocked={p.withFixes.blocked} />
          <Legend />
        </div>
      </div>

      <div className="tc-more" style={{ marginTop: 32 }}>
      <details>
      <summary>The real attacks, today and with your plan</summary>
      <div className="br-table-wrap">
        <table className="br-table">
          <thead>
            <tr>
              <th>Attack</th>
              <th>Today</th>
              <th>With your plan</th>
            </tr>
          </thead>
          <tbody>
            {SCENARIOS.map((x) => {
              const a = runScenario(p.inputs, x.id)
              const b = runScenario(p.fixedInputs, x.id)
              return (
                <tr key={x.id}>
                  <td>{x.name}</td>
                  <td className={outcomeClass(a)}>{C.results.outcome.label[a.outcome]}</td>
                  <td className={outcomeClass(b)}>{C.results.outcome.label[b.outcome]}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      </details>
      <details>
        <summary>
          Your obligations: {nb.ready} of {nb.of} likely ready today, {na.ready} with your plan
        </summary>
        <ObligationList rs={before.filter((o) => o.group !== 'direction')} compare={after} />
      </details>
      </div>

      <h2 style={{ marginTop: 56 }}>Your board summary and a free review</h2>
      <div className="br-offer">
        <SummaryCard inputs={p.inputs} fixes={p.fixes} current={p.current} withFixes={p.withFixes} fixedInputs={p.fixedInputs} capability={p.capability} />
        <ReviewForm inputs={p.inputs} fixes={p.fixes} current={p.current} />
      </div>
      <p className="fine">{C.disclaimer}</p>
      <Nav back={p.back} backLabel={STEPS[3]} />
    </div>
  )
}

function summaryMessage(role: Role, inputs: Inputs, fixes: FixId[], current: R, withFixes: R, fixedInputs: Inputs, capability: Capability, company: string) {
  const ob = obligations(inputs, capability)
  const n = readyCount(ob)
  const na = readyCount(obligations(fixedInputs, capability))
  return [
    `Company: ${company}`,
    `Role: ${RL.roleLabel(role)}`,
    '',
    `Exposure today: ${current.exposureScore} (${current.band}). With their plan: ${withFixes.exposureScore} (${withFixes.band}).`,
    `Attacker: ${C.attackers.find((a) => a.value === capability)?.label}. Worst way in: ${C.ENTRY_NAMES[current.entry]}.`,
    `Obligations likely ready: ${n.ready} of ${n.of} today, ${na.ready} of ${na.of} with their plan.`,
    '',
    'Gaps:',
    ...ob.filter((o) => o.status === 'gap').map((o) => `- ${C.obligationText[o.id].title}`),
    '',
    `Plan steps chosen: ${fixes.length ? fixes.map((f) => C.fixes[f].name).join('; ') : 'none'}`,
    '',
    'Telco SOCI Readiness answers:',
    JSON.stringify(inputs, null, 2),
  ].join('\n')
}

function SummaryCard({ inputs, fixes, current, withFixes, fixedInputs, capability }: { inputs: Inputs; fixes: FixId[]; current: R; withFixes: R; fixedInputs: Inputs; capability: Capability }) {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const role = useRole()
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    if (!f.checkValidity()) return f.reportValidity()
    const d = new FormData(f)
    if (d.get('botcheck')) return
    const v = (k: string) => String(d.get(k) ?? '').trim()
    setBusy(true)
    try {
      await postForm({
        formName: 'Telco SOCI Readiness board summary',
        subject: `Telco board summary downloaded: ${v('company')}`,
        name: v('name'),
        email: v('email'),
        message: summaryMessage(role, inputs, fixes, current, withFixes, fixedInputs, capability, v('company')),
      })
      ev('summary_requested')
    } catch {
      // Never hold the visitor's summary hostage to a network error.
      ev('summary_request_failed')
    } finally {
      setBusy(false)
    }
    setDone(true)
    window.print()
  }
  const S = C.summary
  return (
    <div className="card">
      <h3>{S.title}</h3>
      <p>{S.sub}</p>
      <div className="br-vs" style={{ margin: '18px 0' }}>
        <div>
          <small>Today</small>
          <ScoreBadge score={current.exposureScore} band={current.band} />
        </div>
        <div>
          <small>With your plan</small>
          <ScoreBadge score={withFixes.exposureScore} band={withFixes.band} />
        </div>
      </div>
      {done ? (
        <>
          <p>{S.thanks}</p>
          <button className="btn btn-blue" onClick={() => window.print()}>
            Download again (PDF)
          </button>
        </>
      ) : (
        <form className="br-form br-form-tight" onSubmit={submit} noValidate>
          <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <label>
            Name <em>*</em>
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Work email <em>*</em>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Company <em>*</em>
            <input name="company" required autoComplete="organization" />
          </label>
          <p className="fine" style={{ margin: 0 }}>
            {S.consent}{' '}
            <Link to="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy policy
            </Link>
            .
          </p>
          <button className="btn btn-blue" type="submit" disabled={busy} style={{ justifySelf: 'start' }}>
            {busy ? 'Preparing…' : 'Get my board summary (PDF)'}
          </button>
        </form>
      )}
    </div>
  )
}

function ReviewForm({ inputs, fixes, current }: { inputs: Inputs; fixes: FixId[]; current: R }) {
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const O = C.offer
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    if (!f.checkValidity()) return f.reportValidity()
    const d = new FormData(f)
    if (d.get('botcheck')) return
    const v = (k: string) => String(d.get(k) ?? '').trim()
    const settings = d.get('include') ? JSON.stringify({ inputs, fixes, score: current.exposureScore, band: current.band }, null, 2) : ''
    const message = [
      `Company: ${v('company')}`,
      `Role: ${v('role')}`,
      `Type: ${v('type')}`,
      `State: ${v('state')}`,
      '',
      v('message') || '(no message)',
      ...(settings ? ['', 'Telco SOCI Readiness answers (shared by the visitor):', settings] : ['', 'Answers: not shared']),
    ].join('\n')
    setBusy(true)
    setErr('')
    try {
      await postForm({ formName: 'Telco SOCI Readiness review request', subject: `Telco SOCI review request: ${v('company')}`, name: v('name'), email: v('email'), message, location: v('state') })
      ev('review_requested')
      setSent(true)
    } catch {
      setErr('Sorry, your request could not be sent. Please try again, or email us directly.')
    } finally {
      setBusy(false)
    }
  }
  if (sent)
    return (
      <div className="card br-form">
        <h3>Request sent</h3>
        <p>{O.thanks}</p>
      </div>
    )
  const Select = ({ name, label, opts }: { name: string; label: string; opts: string[] }) => (
    <label>
      {label} <em>*</em>
      <select name={name} required defaultValue="">
        <option value="" disabled>
          Choose one
        </option>
        {opts.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </label>
  )
  return (
    <form className="br-form" onSubmit={submit} noValidate>
      <h3 style={{ margin: 0 }}>{O.title}</h3>
      <p style={{ color: 'var(--muted)', marginTop: -8 }}>{O.sub}</p>
      <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
      <div className="row2">
        <label>
          Name <em>*</em>
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          Work email <em>*</em>
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <div className="row2">
        <label>
          Company <em>*</em>
          <input name="company" required autoComplete="organization" />
        </label>
        <Select name="role" label="Role" opts={O.roles} />
      </div>
      <div className="row2">
        <Select name="type" label="Your organisation" opts={O.types} />
        <Select name="state" label="State" opts={O.states} />
      </div>
      <label>
        Message (optional)
        <textarea name="message" rows={3} />
      </label>
      <label className="br-check">
        <input type="checkbox" name="include" /> {O.includeSettings}
      </label>
      <p className="fine" style={{ marginTop: 0 }}>
        {O.consent}{' '}
        <Link to="/privacy" target="_blank" rel="noopener noreferrer">
          Read our privacy policy
        </Link>
        .
      </p>
      {err && (
        <p role="status" style={{ color: 'var(--red)', fontWeight: 600 }}>
          {err}
        </p>
      )}
      <button className="btn btn-red" type="submit" disabled={busy} style={{ justifySelf: 'start' }}>
        {busy ? 'Sending…' : 'Book my free review'}
      </button>
    </form>
  )
}

/* ---------------- Print summary (PDF via window.print) ---------------- */
function PrintSummary({ inputs, fixes, current, withFixes, fixedInputs, capability }: { inputs: Inputs; fixes: FixId[]; current: R; withFixes: R; fixedInputs: Inputs; capability: Capability }) {
  const role = useRole()
  const plain = RL.isPlain(role)
  const issues = (Object.keys(RL.plainIssue) as (keyof Inputs)[]).map((k) => RL.plainIssue[k]?.[String(inputs[k])]).filter(Boolean).slice(0, 4) as string[]
  const ob = obligations(inputs, capability)
  const after = obligations(fixedInputs, capability)
  const answer = (q: (typeof C.groups)[number]['questions'][number]) => {
    const v = inputs[q.id]
    if (q.kind === 'slider') return String(v)
    if (q.kind === 'yesno') return v ? 'Yes' : 'No'
    return q.options.find((o) => o.value === v)?.label ?? String(v)
  }
  return (
    <div className="br-print" aria-hidden="true">
      <img src="/brand/otcd-logo.png" alt="" style={{ height: 60 }} />
      <h1>Telco SOCI Readiness board summary</h1>
      <p>
        Prepared {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} for: {RL.roleLabel(role)}
      </p>
      {plain && (
        <>
          <h2>In short</h2>
          <p>
            <b>{RL.briefing.headline[current.band]}</b>
          </p>
          <ul>
            {issues.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p>{RL.briefing.deadlines}</p>
        </>
      )}
      {role === 'board' && (
        <>
          <h2>{RL.board.askTitle}</h2>
          <ol>
            {RL.board.ask.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
          <p>{RL.board.accountability}</p>
        </>
      )}
      <h2>Your exposure</h2>
      <p>
        Attacker: {C.attackers.find((a) => a.value === capability)?.label} · Today: <b>{current.exposureScore}</b> ({current.band}) · With your plan: <b>{withFixes.exposureScore}</b> ({withFixes.band})
      </p>
      <p>Likely worst way in: {C.ENTRY_NAMES[current.entry]}</p>
      {!plain && (
        <ol>
          {current.path.map((x, k) => (
            <li key={k}>{x.reason}</li>
          ))}
          {current.blocked.map((x, k) => (
            <li key={`b${k}`}>{x.reason}</li>
          ))}
        </ol>
      )}
      <h2>Real attacks replayed (likely outcomes)</h2>
      <table>
        <tbody>
          {SCENARIOS.map((x) => (
            <tr key={x.id}>
              <td>
                {x.name} ({x.year})
              </td>
              <td>Today: {C.results.outcome.label[runScenario(inputs, x.id).outcome]}</td>
              <td>With your plan: {C.results.outcome.label[runScenario(fixedInputs, x.id).outcome]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>SOCI obligations</h2>
      <table>
        <tbody>
          {ob.map((o, k) => (
            <tr key={o.id}>
              <td>
                {C.obligationText[o.id].title} ({C.obligationText[o.id].ref}){o.group === 'enhanced' ? ', if declared' : o.group === 'direction' ? ', for guidance' : ''}
              </td>
              <td>Today: {C.obligations.status[o.status]}</td>
              <td>With your plan: {C.obligations.status[after[k].status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Your plan, step by step</h2>
      {PHASE_ORDER.map((ph, k) => {
        const chosen = PHASE_FIXES[ph].filter((f) => fixes.includes(f))
        return (
          <p key={ph}>
            <b>
              Phase {k + 1}: {C.phases[ph].title}
            </b>{' '}
            ({C.phases[ph].when}). {C.phases[ph].notes ? C.phases[ph].notes!.join('. ') + '.' : chosen.length ? chosen.map((f) => fixName(f, role)).join(' · ') : 'No steps chosen yet.'}
          </p>
        )
      })}
      <h2>Network described</h2>
      <ul>
        {C.groups.flatMap((g) => g.questions).map((q) => (
          <li key={q.id}>
            {q.label} <b>{answer(q)}</b>
          </li>
        ))}
      </ul>
      <p className="fine">{C.disclaimer}</p>
      <p>Book a free 30-minute SOCI readiness review: otcyberdefence.com.au/telco-readiness</p>
    </div>
  )
}
