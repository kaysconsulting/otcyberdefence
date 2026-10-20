import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Capability, EntryId, FixId, Inputs, Likelihood, ScenarioId, ScenarioResult, ZoneId } from '../blast/engine/types.ts'
import { DEFAULT_INPUTS, normalise, onArchitectureChange } from '../blast/engine/inputs.ts'
import { ALL_ENTRIES, mergeAssetLikelihood, worstCase } from '../blast/engine/simulate.ts'
import { runScenario, SCENARIOS } from '../blast/engine/scenarios.ts'
import { applyFixes, FIX_ORDER } from '../blast/engine/fixes.ts'
import * as C from '../blast/content/copy.ts'
import SiteDiagram from '../blast/ui/SiteDiagram.tsx'
import { Banners, PathList, ReachCounts, ScoreBadge } from '../blast/ui/parts.tsx'
import { track } from '../blast/analytics.ts'
import CompliancePanel from '../blast/ui/Compliance.tsx'
import { complianceGaps, FIX_ADDRESSES } from '../blast/engine/compliance.ts'
import { img } from '../media.ts'

type Step = 0 | 1 | 2 | 3 | 4 | 5
const STEPS = ['Build your site', 'Your blast radius', 'Replay real attacks', 'Compare fixes', 'Free review']

type State = { step: Step; inputs: Inputs; fixes: FixId[]; capability: Capability; wantLatest: boolean }
type Action =
  | { t: 'step'; step: Step }
  | { t: 'set'; key: keyof Inputs; value: Inputs[keyof Inputs] }
  | { t: 'toggleFix'; fix: FixId }
  | { t: 'capability'; capability: Capability }
  | { t: 'wantLatest' }

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'step':
      return { ...s, step: a.step }
    case 'set':
      if (a.key === 'architecture') return { ...s, inputs: onArchitectureChange(s.inputs, a.value as Inputs['architecture']) }
      return { ...s, inputs: normalise({ ...s.inputs, [a.key]: a.value } as Inputs) }
    case 'toggleFix':
      return { ...s, fixes: s.fixes.includes(a.fix) ? s.fixes.filter((f) => f !== a.fix) : [...s.fixes, a.fix] }
    case 'capability':
      return { ...s, capability: a.capability }
    case 'wantLatest':
      return { ...s, wantLatest: true, step: 5 }
  }
}

// Same form backend as the main site (ash-be), sending to admin@ as the spec requires.
const FORM_API = 'https://ash-be-z3x4.onrender.com/api/tickets/send-form-submission'
const REVIEW_TO = 'admin@otcyberdefence.com.au'

export default function BlastRadius() {
  const [s, dispatch] = useReducer(reducer, { step: 0, inputs: DEFAULT_INPUTS, fixes: [], capability: 2, wantLatest: false })
  const go = (step: Step) => {
    dispatch({ t: 'step', step })
    // Land at the top of the step, below the sticky header.
    window.scrollTo({ top: Math.max(0, (document.getElementById('br-top')?.offsetTop ?? 0) - 90), behavior: 'auto' })
  }

  useEffect(() => track('landing_view'), [])
  useEffect(() => {
    document.title = 'OT Blast Radius | OT Cyber Defence'
  }, [])

  const main = useMemo(() => worstCase(s.inputs, s.capability), [s.inputs, s.capability])
  const fixedInputs = useMemo(() => applyFixes(s.inputs, s.fixes), [s.inputs, s.fixes])
  const fixed = useMemo(() => worstCase(fixedInputs, s.capability), [fixedInputs, s.capability])
  const setCap = (capability: Capability) => {
    track('attacker_changed', { capability })
    dispatch({ t: 'capability', capability })
  }

  useEffect(() => {
    if (s.step === 2) track('results_viewed', { band: main.worst.band })
  }, [s.step, main.worst.band])

  return (
    <div className="br">
      <div className="banner" style={{ backgroundImage: `url('${img('control-room', 2400)}')` }}>
        <div className="wrap">
          <div className="crumb">
            <Link to="/">Home</Link> / OT Blast Radius
          </div>
          <span className="eyebrow" style={{ color: '#FF8A92' }}>
            {C.landing.eyebrow}
          </span>
          <h1>{C.landing.title}</h1>
          <p>{C.landing.sub}</p>
          {s.step === 0 && (
            <button
              className="btn btn-red"
              onClick={() => {
                track('build_started')
                go(1)
              }}
            >
              {C.landing.cta}
            </button>
          )}
        </div>
      </div>

      <section id="br-top" className={s.step === 0 ? '' : 'br-tight'}>
        <div className="wrap">
          {s.step === 0 ? (
            <Landing onStart={() => go(1)} />
          ) : (
            <>
              <Progress step={s.step} go={go} />
              {s.step === 1 && <Build inputs={s.inputs} set={(key, value) => dispatch({ t: 'set', key, value })} next={() => go(2)} />}
              {s.step === 2 && <Results data={main} inputs={s.inputs} capability={s.capability} setCap={setCap} next={() => go(3)} back={() => go(1)} />}
              {s.step === 3 && (
                <Replay
                  inputs={s.inputs}
                  next={() => go(4)}
                  back={() => go(2)}
                  latest={() => {
                    track('latest_attacks_requested')
                    dispatch({ t: 'wantLatest' })
                    window.scrollTo({ top: Math.max(0, (document.getElementById('br-top')?.offsetTop ?? 0) - 90), behavior: 'auto' })
                  }}
                />
              )}
              {s.step === 4 && (
                <Compare
                  inputs={s.inputs}
                  fixes={s.fixes}
                  toggle={(fix) => {
                    track('fix_toggled', { fix })
                    dispatch({ t: 'toggleFix', fix })
                  }}
                  current={main.worst}
                  withFixes={fixed.worst}
                  fixedInputs={fixedInputs}
                  capability={s.capability}
                  setCap={setCap}
                  next={() => go(5)}
                  back={() => go(3)}
                />
              )}
              {s.step === 5 && <Offer inputs={s.inputs} fixes={s.fixes} current={main.worst} withFixes={fixed.worst} wantLatest={s.wantLatest} back={() => go(4)} />}
            </>
          )}
        </div>
      </section>

      <PrintSummary inputs={s.inputs} fixes={s.fixes} current={main.worst} withFixes={fixed.worst} />
    </div>
  )
}

/* ---------------- Step 0: landing ---------------- */
function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="br-landing">
      <div className="grid3" style={{ marginTop: 0 }}>
        {C.landing.points.map((p, k) => (
          <div key={p} className="card">
            <span className="tag">Step {k + 1}</span>
            <p style={{ color: 'var(--ink)', fontWeight: 600 }}>{p}</p>
          </div>
        ))}
      </div>
      <p className="br-centre">
        <button className="btn btn-blue" onClick={onStart}>
          {C.landing.cta}
        </button>
      </p>
      <p className="fine br-centre">{C.disclaimer}</p>
    </div>
  )
}

function Progress({ step, go }: { step: Step; go: (s: Step) => void }) {
  return (
    <ol className="br-progress">
      {STEPS.map((label, k) => {
        const n = (k + 1) as Step
        return (
          <li key={label} className={n === step ? 'on' : n < step ? 'done' : ''}>
            <button onClick={() => n < step && go(n)} disabled={n > step}>
              <b>{n}</b> {label}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

/* ---------------- Step 1: build your site ---------------- */
function Build({ inputs, set, next }: { inputs: Inputs; set: (k: keyof Inputs, v: Inputs[keyof Inputs]) => void; next: () => void }) {
  return (
    <div className="br-build">
      <span className="eyebrow">Step 1</span>
      <h2>Build a site like yours</h2>
      <p className="lead">Pick the closest match for each question. The defaults describe a typical mature site that has not yet done network segmentation.</p>
      {C.groups.map((g) => (
        <div key={g.title} className="br-group">
          <h3>{g.title}</h3>
          {g.questions.map((q) => (
            <div key={q.id} className="br-q">
              <div className="br-q-head">
                <b>{q.label}</b>
                <span>{q.helper}</span>
              </div>
              {q.kind === 'slider' ? (
                <div className="br-slider">
                  <input type="range" min={0} max={50} value={inputs.vendorCount} onChange={(e) => set('vendorCount', Number(e.target.value))} aria-label={q.label} />
                  <output>{inputs.vendorCount}</output>
                  <small>{C.notes.vendorRisk(inputs.vendorCount)}</small>
                </div>
              ) : q.kind === 'yesno' ? (
                <div className="br-opts" role="radiogroup" aria-label={q.label}>
                  {[
                    [true, 'Yes'],
                    [false, 'No'],
                  ].map(([v, l]) => (
                    <button key={String(v)} role="radio" aria-checked={inputs[q.id] === v} className={inputs[q.id] === v ? 'on' : ''} onClick={() => set(q.id, v as boolean)}>
                      <b>{l as string}</b>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="br-opts" role="radiogroup" aria-label={q.label}>
                  {q.options!.map((o) => {
                    const disabled = q.id === 'itOtLink' && inputs.architecture === 'flat' && o.value !== 'direct'
                    return (
                      <button
                        key={o.value}
                        role="radio"
                        aria-checked={inputs[q.id] === o.value}
                        disabled={disabled}
                        className={inputs[q.id] === o.value ? 'on' : ''}
                        onClick={() => set(q.id, o.value as Inputs[keyof Inputs])}
                      >
                        <b>{o.label}</b>
                        {o.hint && <span>{o.hint}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
              {q.id === 'itOtLink' && inputs.architecture === 'flat' && <p className="br-note">{C.notes.flatForcesDirect}</p>}
            </div>
          ))}
        </div>
      ))}
      <div className="br-nav">
        <span />
        <button className="btn btn-red" onClick={next}>
          Show my blast radius →
        </button>
      </div>
    </div>
  )
}

/* ---------------- Step 2: results ---------------- */
function Results({ data, inputs, capability, setCap, next, back }: { data: ReturnType<typeof worstCase>; inputs: Inputs; capability: Capability; setCap: (c: Capability) => void; next: () => void; back: () => void }) {
  const [view, setView] = useState<'worst' | EntryId>('worst')
  const r = view === 'worst' ? data.worst : data.runs.find((x) => x.entry === view)!
  return (
    <div>
      <span className="eyebrow">{C.results.eyebrow}</span>
      <h2>{C.results.heading}</h2>
      <AttackerPicker value={capability} onChange={setCap} />
      <div className="br-tabs" role="tablist">
        <button role="tab" aria-selected={view === 'worst'} className={view === 'worst' ? 'on' : ''} onClick={() => setView('worst')}>
          {C.results.worstCase}
        </button>
        {ALL_ENTRIES.map((e) => (
          <button key={e} role="tab" aria-selected={view === e} className={view === e ? 'on' : ''} onClick={() => setView(e)}>
            {C.ENTRY_NAMES[e]}
          </button>
        ))}
      </div>
      <div className="br-result">
        <div className="br-summary">
          <ScoreBadge score={r.exposureScore} band={r.band} />
          <StepsToControl n={r.stepsToControl} />
          <p className="br-entry-line">
            <b>Way in:</b> {C.ENTRY_NAMES[r.entry]}. {r.entryReason}
          </p>
          <Banners r={r} />
          <h3>{C.results.reachHeading}</h3>
          <ReachCounts r={r} />
          <details className="br-details">
            <summary>{C.results.showPath}</summary>
            <PathList path={r.path} blocked={r.blocked} entryReason={r.entryReason} entrySucceeded={r.entrySucceeded} />
          </details>
        </div>
        <div className="br-diagram-wrap">
          <SiteDiagram site={r.site} reached={r.reachedAssetIds} likelihood={r.assetLikelihood} entryZones={r.entrySucceeded ? r.entryZones : []} blocked={r.blocked} />
          <Legend />
        </div>
      </div>
      <CompliancePanel inputs={inputs} runs={data.runs} />
      <p className="fine">{C.disclaimer}</p>
      <div className="br-nav">
        <button className="btn btn-line-b" onClick={back}>
          ← Change my site
        </button>
        <button className="btn btn-red" onClick={next}>
          Replay real attacks →
        </button>
      </div>
    </div>
  )
}

function AttackerPicker({ value, onChange }: { value: Capability; onChange: (c: Capability) => void }) {
  return (
    <div className="br-attacker">
      <span>Attacker:</span>
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

function StepsToControl({ n }: { n: number | null }) {
  return (
    <p className={`br-steps${n === null ? ' ok' : ''}`} title={C.results.stepsHelp}>
      <b>{C.results.steps(n)}</b>
      <span>{C.results.stepsHelp}</span>
    </p>
  )
}

function outcomeLabel(l?: Likelihood) {
  return l === 'possible' ? C.results.outcome.possible : l === 'unlikely' ? C.results.outcome.unlikely : C.results.outcome.succeed
}

function cellLabel(r: ScenarioResult) {
  const c = C.results.outcome.cell
  if (!r.succeeded) return c.stopped
  return r.likelihood === 'possible' ? c.possible : r.likelihood === 'unlikely' ? c.unlikely : c.succeed
}

function cellClass(r: ScenarioResult) {
  return !r.succeeded ? 'ok' : r.likelihood === 'unlikely' ? 'warn' : 'bad'
}

function Legend() {
  return (
    <ul className="br-legend">
      <li>
        <i className="lg-hit" /> {C.results.state.hit}
      </li>
      <li>
        <i className="lg-possible" /> {C.results.state.possible}
      </li>
      <li>
        <i className="lg-unlikely" /> {C.results.state.unlikely}
      </li>
      <li>
        <i className="lg-safe" /> {C.results.state.safe}
      </li>
      <li>
        <i className="lg-block" /> {C.results.state.blocked}
      </li>
      <li>
        <i className="lg-entry" /> Entry point
      </li>
    </ul>
  )
}

/* ---------------- Step 3: replay ---------------- */
function Replay({ inputs, next, back, latest }: { inputs: Inputs; next: () => void; back: () => void; latest: () => void }) {
  const [id, setId] = useState<ScenarioId | null>(null)
  const [shown, setShown] = useState(0)
  const timer = useRef<number | undefined>(undefined)
  const res = useMemo(() => (id ? runScenario(inputs, id) : null), [inputs, id])
  const sc = SCENARIOS.find((x) => x.id === id)

  // Zones in the order the attacker reached them, revealed one at a time.
  const order = useMemo(() => {
    if (!res) return [] as ZoneId[]
    const seq: ZoneId[] = []
    res.path.forEach((p) => !seq.includes(p.to) && seq.push(p.to))
    return seq
  }, [res])

  useEffect(() => {
    window.clearInterval(timer.current)
    if (!res) return
    setShown(0)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setShown(order.length)
      return
    }
    timer.current = window.setInterval(() => setShown((n) => (n >= order.length ? n : n + 1)), 700)
    return () => window.clearInterval(timer.current)
  }, [res, order])

  const done = !res || shown >= order.length
  const visibleZones = new Set(order.slice(0, shown))
  const site = res?.runs[0].site
  return (
    <div>
      <span className="eyebrow">Step 3 · OT Threat Files</span>
      <h2>Replay real attacks against your site</h2>
      <p className="lead">Pick an attack. We replay how it worked against the layout you described and show the most likely outcome.</p>
      <div className="br-cards">
        {SCENARIOS.map((x) => (
          <button
            key={x.id}
            className={`br-card${id === x.id ? ' on' : ''}`}
            onClick={() => {
              track('scenario_replayed', { scenario: x.id })
              setId(x.id)
            }}
          >
            <span className="tag">{x.year}</span>
            <b>{x.name}</b>
            <span>{x.facts}</span>
            <small>Target: {x.targetLabel}</small>
          </button>
        ))}
        <div className="br-card br-latest">
          <span className="tag">{C.latest.tag}</span>
          <b>{C.latest.title}</b>
          <span>{C.latest.body}</span>
          <button className="btn btn-red" onClick={latest}>
            {C.latest.cta}
          </button>
        </div>
      </div>
      {res && sc && site && (
        <div className="br-result">
          <div className="br-summary">
            <h3>{sc.name}</h3>
            <p className="br-facts">{sc.facts}</p>
            {done ? (
              <div className={`br-outcome ${res.succeeded ? (res.likelihood === 'unlikely' ? 'warn' : 'bad') : 'ok'}`}>
                <b>
                  {res.succeeded
                    ? outcomeLabel(res.likelihood)
                    : res.stoppedAt
                      ? C.results.outcome.stoppedAt(C.ZONE_NAMES[res.stoppedAt.from], C.ZONE_NAMES[res.stoppedAt.to])
                      : C.results.outcome.stopped}
                </b>
                <span>{res.reason}</span>
              </div>
            ) : (
              <div className="br-outcome">
                <b>{C.results.outcome.replaying}</b>
                <span>{shown > 0 ? `Likely reaches ${C.ZONE_NAMES[order[shown - 1]].toLowerCase()}` : 'Trying the way in'}</span>
              </div>
            )}
            <details className="br-details">
              <summary>{C.results.showPath}</summary>
              {res.runs.map((r) => (
                <div key={r.entry}>
                  <p className="br-sub">{C.ENTRY_NAMES[r.entry]}</p>
                  <PathList path={r.path} blocked={r.blocked} entryReason={r.entryReason} entrySucceeded={r.entrySucceeded} />
                </div>
              ))}
            </details>
          </div>
          <div className="br-diagram-wrap">
            <SiteDiagram
              site={site}
              reached={res.reachedAssetIds.filter((a) => visibleZones.has(site.assets.find((x) => x.id === a)!.zone))}
              entryZones={[...new Set(res.runs.filter((r) => r.entrySucceeded).flatMap((r) => r.entryZones))]}
              blocked={done ? res.runs.flatMap((r) => r.blocked) : []}
              activeZone={done ? null : order[shown - 1]}
              likelihood={mergeAssetLikelihood(res.runs)}
            />
            <Legend />
          </div>
        </div>
      )}
      <div className="br-nav">
        <button className="btn btn-line-b" onClick={back}>
          ← My blast radius
        </button>
        <button className="btn btn-red" onClick={next}>
          Compare fixes →
        </button>
      </div>
    </div>
  )
}

/* ---------------- Step 4: compare fixes ---------------- */
type R = ReturnType<typeof worstCase>['worst']
function Compare(p: { inputs: Inputs; fixes: FixId[]; toggle: (f: FixId) => void; current: R; withFixes: R; fixedInputs: Inputs; capability: Capability; setCap: (c: Capability) => void; next: () => void; back: () => void }) {
  return (
    <div>
      <span className="eyebrow">Step 4</span>
      <h2>Compare fixes</h2>
      <p className="lead">Switch fixes on and off. The likely score and outcomes update straight away.</p>
      <AttackerPicker value={p.capability} onChange={p.setCap} />
      <div className="br-result">
        <div className="br-summary">
          <div className="br-fixes">
            {FIX_ORDER.map((f) => (
              <label key={f} className={p.fixes.includes(f) ? 'on' : ''}>
                <input type="checkbox" checked={p.fixes.includes(f)} onChange={() => p.toggle(f)} />
                <span>
                  {C.fixes[f]}
                  <small>
                    {C.compliance.addresses} {FIX_ADDRESSES[f].map((g) => C.compliance.short[g]).join(', ')}
                  </small>
                </span>
              </label>
            ))}
          </div>
          <div className="br-vs">
            <div>
              <small>Your site today</small>
              <ScoreBadge score={p.current.exposureScore} band={p.current.band} />
            </div>
            <div>
              <small>With selected fixes</small>
              <ScoreBadge score={p.withFixes.exposureScore} band={p.withFixes.band} />
            </div>
          </div>
          <Banners r={p.withFixes} />
          <p className="br-gapcount">
            Compliance gaps: <b>{complianceGaps(p.inputs, worstCase(p.inputs, p.capability).runs).length}</b> today →{' '}
            <b>{complianceGaps(p.fixedInputs, worstCase(p.fixedInputs, p.capability).runs).length}</b> with selected fixes
          </p>
          <h3>The six attacks</h3>
          <table className="br-table">
            <thead>
              <tr>
                <th>Attack</th>
                <th>Today</th>
                <th>With fixes</th>
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map((x) => {
                const a = runScenario(p.inputs, x.id)
                const b = runScenario(p.fixedInputs, x.id)
                return (
                  <tr key={x.id}>
                    <td>{x.name}</td>
                    <td className={cellClass(a)}>{cellLabel(a)}</td>
                    <td className={cellClass(b)}>{cellLabel(b)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="br-diagram-wrap">
          <SiteDiagram site={p.withFixes.site} reached={p.withFixes.reachedAssetIds} likelihood={p.withFixes.assetLikelihood} entryZones={p.withFixes.entrySucceeded ? p.withFixes.entryZones : []} blocked={p.withFixes.blocked} />
          <Legend />
        </div>
      </div>
      <h3 style={{ marginTop: 44 }}>Traditional network rebuild or network segmentation as an overlay?</h3>
      <div className="br-table-wrap">
        <table className="br-table br-trade">
          <thead>
            <tr>
              <th>Factor</th>
              <th>Traditional rebuild</th>
              <th>Overlay network segmentation</th>
            </tr>
          </thead>
          <tbody>
            {C.tradeoffs.map(([f, a, b]) => (
              <tr key={f}>
                <td>
                  <b>{f}</b>
                </td>
                <td>{a}</td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fine">{C.disclaimer}</p>
      <div className="br-nav">
        <button className="btn btn-line-b" onClick={p.back}>
          ← Replay attacks
        </button>
        <button className="btn btn-red" onClick={p.next}>
          Get my summary and review →
        </button>
      </div>
    </div>
  )
}

/* ---------------- Step 5: offer ---------------- */
function Offer({ inputs, fixes, current, withFixes, wantLatest, back }: { inputs: Inputs; fixes: FixId[]; current: R; withFixes: R; wantLatest: boolean; back: () => void }) {
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

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
      `Sector: ${v('sector')}`,
      `State: ${v('state')}`,
      '',
      d.get('latest') ? 'Requested: replay the latest OT attacks against their site in the review.' : '',
      v('message') || '(no message)',
      ...(settings ? ['', 'Blast Radius settings (shared by the visitor):', settings] : ['', 'Blast Radius settings: not shared']),
    ].join('\n')
    setBusy(true)
    setErr('')
    try {
      const r = await fetch(FORM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: {
            websiteName: 'OT Cyber Defence',
            formName: 'OT Blast Radius review request',
            customerName: v('name'),
            customerEmail: v('email'),
            subject: `Architecture review request: ${v('company')}`,
            message,
            phone: '',
            location: v('state'),
          },
          options: { to: REVIEW_TO, websiteName: 'OT Cyber Defence' },
        }),
      })
      if (!(r.status === 201 || r.ok)) throw new Error(String(r.status))
      track('review_requested')
      setSent(true)
    } catch {
      setErr('Sorry, your request could not be sent. Please try again, or email us directly.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="eyebrow">Step 5</span>
      <h2>Your summary and a free review</h2>
      <div className="br-offer">
        <div className="card">
          <h3>Get your summary</h3>
          <p>A one-page summary of your result, the six attacks and the fixes you chose. No email needed.</p>
          <div className="br-vs" style={{ margin: '18px 0' }}>
            <div>
              <small>Today</small>
              <ScoreBadge score={current.exposureScore} band={current.band} />
            </div>
            <div>
              <small>With fixes</small>
              <ScoreBadge score={withFixes.exposureScore} band={withFixes.band} />
            </div>
          </div>
          <button
            className="btn btn-blue"
            onClick={() => {
              track('pdf_downloaded')
              window.print()
            }}
          >
            Download summary (PDF)
          </button>
          <p className="fine">Your browser's print window opens. Choose "Save as PDF".</p>
        </div>
        {sent ? (
          <div className="card br-form">
            <h3>Request sent</h3>
            <p>{C.offer.thanks}</p>
          </div>
        ) : (
          <form className="br-form" onSubmit={submit} noValidate>
            <h3 style={{ margin: 0 }}>{C.offer.title}</h3>
            <p style={{ color: 'var(--muted)', marginTop: -8 }}>{C.offer.sub}</p>
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
              <label>
                Role <em>*</em>
                <select name="role" required defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {C.offer.roles.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="row2">
              <label>
                Sector <em>*</em>
                <select name="sector" required defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {C.offer.sectors.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                State <em>*</em>
                <select name="state" required defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {C.offer.states.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Message (optional)
              <textarea name="message" rows={3} />
            </label>
            <label className="br-check">
              <input type="checkbox" name="latest" defaultChecked={wantLatest} /> {C.latest.checkbox}
            </label>
            <label className="br-check">
              <input type="checkbox" name="include" /> {C.offer.includeSettings}
            </label>
            <p className="fine" style={{ marginTop: 0 }}>
              {C.offer.consent} {C.offer.privacy}{' '}
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
              {busy ? 'Sending...' : 'Book my free review'}
            </button>
          </form>
        )}
      </div>
      <p className="fine">{C.disclaimer}</p>
      <div className="br-nav">
        <button className="btn btn-line-b" onClick={back}>
          ← Compare fixes
        </button>
        <span />
      </div>
    </div>
  )
}

/* ---------------- Print summary (PDF via window.print) ---------------- */
function PrintSummary({ inputs, fixes, current, withFixes }: { inputs: Inputs; fixes: FixId[]; current: R; withFixes: R }) {
  const label = (q: (typeof C.groups)[number]['questions'][number]) => {
    const v = inputs[q.id]
    if (q.kind === 'slider') return String(v)
    if (q.kind === 'yesno') return v ? 'Yes' : 'No'
    return q.options?.find((o) => o.value === v)?.label ?? String(v)
  }
  return (
    <div className="br-print" aria-hidden="true">
      <img src="/brand/otcd-logo.png" alt="" style={{ height: 60 }} />
      <h1>OT Blast Radius summary</h1>
      <p>Prepared {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <h2>Exposure estimate</h2>
      <p>Attacker: {C.attackers.find((a) => a.value === current.capability)?.label} · {C.results.steps(current.stepsToControl)}</p>
      <p>
        Today: <b>{current.exposureScore}</b> ({current.band}) · With selected fixes: <b>{withFixes.exposureScore}</b> ({withFixes.band})
      </p>
      {current.sisLogicChangeable ? <p>{C.results.sisBanner}</p> : current.sisReached ? <p>{C.results.sisNetworkOnly}</p> : null}
      {current.l1Reached && <p>{current.zoneLikelihood.L1 === 'unlikely' ? C.results.l1Unlikely : C.results.l1Banner}</p>}
      <p>{C.results.likelihoodNote}</p>
      <h2>Likely worst-case attack path today</h2>
      <p>Way in: {C.ENTRY_NAMES[current.entry]}</p>
      <ol>
        {current.path.map((x, k) => (
          <li key={k}>{x.reason}</li>
        ))}
        {current.blocked.map((x, k) => (
          <li key={`b${k}`}>{x.reason}</li>
        ))}
      </ol>
      <h2>Real attacks replayed (likely outcomes)</h2>
      <table>
        <tbody>
          {SCENARIOS.map((x) => (
            <tr key={x.id}>
              <td>
                {x.name} ({x.year})
              </td>
              <td>Today: {cellLabel(runScenario(inputs, x.id))}</td>
              <td>With fixes: {cellLabel(runScenario(applyFixes(inputs, fixes), x.id))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Compliance areas this is likely to touch</h2>
      <ul>
        {complianceGaps(inputs, worstCase(inputs, current.capability).runs).map((g) => (
          <li key={g.id}>
            <b>{g.title}</b> (CIRMP: {g.cirmp}). {g.refs.join(' · ')}
          </li>
        ))}
      </ul>
      <p>{C.compliance.reporting}</p>
      <h2>Fixes selected</h2>
      <p>{fixes.length ? fixes.map((f) => C.fixes[f]).join(' · ') : 'None selected'}</p>
      <h2>Site described</h2>
      <ul>
        {C.groups.flatMap((g) => g.questions).map((q) => (
          <li key={q.id}>
            {q.label} <b>{label(q)}</b>
          </li>
        ))}
      </ul>
      <p className="fine">{C.disclaimer}</p>
      <p>Book a free 30-minute architecture review: otcyberdefence.com.au/blast-radius</p>
    </div>
  )
}
