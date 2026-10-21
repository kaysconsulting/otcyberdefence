import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { AreaId, Capability, EntryId, FixId, Inputs, PathStep, ScenarioId, ScenarioResult, ZoneId } from '../blast/engine/types.ts'
import { contradictions, DEFAULT_INPUTS, normalise, onArchitectureChange, RISKIER } from '../blast/engine/inputs.ts'
import { mergeAssetLikelihood, worstCase } from '../blast/engine/simulate.ts'
import { runScenario, SCENARIOS } from '../blast/engine/scenarios.ts'
import { applyFixes, FIX_ORDER } from '../blast/engine/fixes.ts'
import { decodeShare, shareUrl } from '../blast/share.ts'
import { SECTOR_FIRST, sectors, type Sector } from '../blast/content/sectors.ts'
import { LAST_REVIEWED } from '../blast/engine/scenarios.ts'
import { areaBreakdown, fixApplies, planPhases, progress } from '../blast/engine/areas.ts'
import * as P from '../blast/content/plan.ts'
import * as C from '../blast/content/copy.ts'
import SiteDiagram from '../blast/ui/SiteDiagram.tsx'
import { Banners, PathList, ReachCounts, ScoreBadge } from '../blast/ui/parts.tsx'
import { track } from '../blast/analytics.ts'
import CompliancePanel from '../blast/ui/Compliance.tsx'
import { SectorContext } from '../blast/ui/context.ts'
import { complianceGaps, FIX_ADDRESSES } from '../blast/engine/compliance.ts'
import { img } from '../media.ts'

type Step = 0 | 1 | 2 | 3 | 4 | 5
const STEPS = C.STEP_NAMES
const stepLabel = (n: number) => `Step ${n} · ${STEPS[n - 1]}`

type State = {
  step: Step
  inputs: Inputs
  fixes: FixId[]
  capability: Capability
  wantLatest: boolean
  /** Questions answered "Not sure" (rule C11: scored as the riskier answer). */
  unsure: (keyof Inputs)[]
  sector: Sector
  /** Step 4 pre-ticks the two biggest fixes once, the first time it opens. */
  pretick: boolean
}
type Action =
  | { t: 'step'; step: Step }
  | { t: 'set'; key: keyof Inputs; value: Inputs[keyof Inputs] }
  | { t: 'unsure'; key: keyof Inputs }
  | { t: 'toggleFix'; fix: FixId }
  | { t: 'setFixes'; fixes: FixId[] }
  | { t: 'capability'; capability: Capability }
  | { t: 'sector'; sector: Sector }
  | { t: 'wantLatest' }

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'step':
      return { ...s, step: a.step }
    case 'set': {
      const unsure = s.unsure.filter((k) => k !== a.key)
      if (a.key === 'architecture') {
        const next = onArchitectureChange(s.inputs, a.value as Inputs['architecture'])
        return { ...s, unsure, inputs: next.architecture === 'flat' ? { ...next, itOtLink: 'direct' } : next }
      }
      return { ...s, unsure, inputs: { ...s.inputs, [a.key]: a.value } as Inputs }
    }
    case 'unsure': {
      const inputs = { ...s.inputs, [a.key]: RISKIER[a.key] } as Inputs
      return { ...s, inputs: inputs.architecture === 'flat' ? { ...inputs, itOtLink: 'direct' } : inputs, unsure: [...new Set([...s.unsure, a.key])] }
    }
    case 'toggleFix':
      return { ...s, fixes: s.fixes.includes(a.fix) ? s.fixes.filter((f) => f !== a.fix) : [...s.fixes, a.fix] }
    case 'setFixes':
      return { ...s, fixes: a.fixes, pretick: false }
    case 'capability':
      return { ...s, capability: a.capability }
    case 'sector':
      return { ...s, sector: a.sector }
    case 'wantLatest':
      return { ...s, wantLatest: true, step: 5 }
  }
}

function initialState(): State {
  const base: State = { step: 0, inputs: DEFAULT_INPUTS, fixes: [], capability: 2, wantLatest: false, unsure: [], sector: 'other', pretick: true }
  // A shared result link opens straight on the results.
  const shared = typeof location !== 'undefined' ? decodeShare(new URLSearchParams(location.search).get('r')) : null
  if (!shared) return base
  return {
    ...base,
    step: 2,
    inputs: shared.inputs,
    capability: shared.capability,
    fixes: shared.fixes.filter((f) => FIX_ORDER.includes(f)),
    unsure: shared.unsure,
    sector: sectors.some((x) => x.value === shared.sector) ? shared.sector : 'other',
    pretick: shared.fixes.length === 0,
  }
}

// Same form backend as the main site (ash-be), sending to admin@ as the spec requires.
const FORM_API = 'https://ash-be-z3x4.onrender.com/api/tickets/send-form-submission'
const REVIEW_TO = 'admin@otcyberdefence.com.au'

export default function BlastRadius() {
  const [s, dispatch] = useReducer(reducer, undefined, initialState)
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

  const share = () => shareUrl({ inputs: s.inputs, capability: s.capability, fixes: s.fixes, unsure: s.unsure, sector: s.sector })
  return (
    <SectorContext.Provider value={s.sector}>
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
              {s.step === 1 && (
                <Build
                  inputs={s.inputs}
                  unsure={s.unsure}
                  sector={s.sector}
                  set={(key, value) => dispatch({ t: 'set', key, value })}
                  setUnsure={(key) => {
                    track('not_sure', { question: key })
                    dispatch({ t: 'unsure', key })
                  }}
                  setSector={(sector) => {
                    track('sector_picked', { sector })
                    dispatch({ t: 'sector', sector })
                  }}
                  next={() => go(2)}
                />
              )}
              {s.step === 2 && <Results data={main} inputs={s.inputs} unsure={s.unsure} share={share} capability={s.capability} setCap={setCap} next={() => go(3)} back={() => go(1)} />}
              {s.step === 3 && (
                <Replay
                  inputs={s.inputs}
                  sector={s.sector}
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
                <Plan
                  pretick={s.pretick}
                  setFixes={(fixes) => dispatch({ t: 'setFixes', fixes })}
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
              {s.step === 5 && <Offer sector={s.sector} inputs={s.inputs} fixes={s.fixes} current={main.worst} withFixes={fixed.worst} wantLatest={s.wantLatest} back={() => go(4)} />}
            </>
          )}
        </div>
      </section>

      <PrintSummary inputs={s.inputs} fixes={s.fixes} current={main.worst} withFixes={fixed.worst} />
    </div>
    </SectorContext.Provider>
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
function Build({ inputs, unsure, sector, set, setUnsure, setSector, next }: {
  inputs: Inputs
  unsure: (keyof Inputs)[]
  sector: Sector
  set: (k: keyof Inputs, v: Inputs[keyof Inputs]) => void
  setUnsure: (k: keyof Inputs) => void
  setSector: (s: Sector) => void
  next: () => void
}) {
  const flags = contradictions(inputs)
  const isUnsure = (k: keyof Inputs) => unsure.includes(k)
  const NotSure = ({ k }: { k: keyof Inputs }) => (
    <button role="radio" aria-checked={isUnsure(k)} className={`br-unsure${isUnsure(k) ? ' on' : ''}`} onClick={() => setUnsure(k)}>
      <b>Not sure</b>
      <span>We assume the riskier answer</span>
    </button>
  )
  return (
    <div className="br-build">
      <span className="eyebrow">{stepLabel(1)}</span>
      <h2>Build a site like yours</h2>
      <p className="lead">Pick the closest match for each question, or "Not sure". The defaults describe a typical site that has not yet segmented its network.</p>
      <div className="br-group">
        <h3>What do you operate?</h3>
        <div className="br-q">
          <div className="br-q-head">
            <b>Your sector</b>
            <span>We use your sector's names on the site map and show its case studies first.</span>
          </div>
          <div className="br-opts" role="radiogroup" aria-label="Your sector">
            {sectors.map((x) => (
              <button key={x.value} role="radio" aria-checked={sector === x.value} className={sector === x.value ? 'on' : ''} onClick={() => setSector(x.value)}>
                <b>{x.label}</b>
              </button>
            ))}
          </div>
        </div>
      </div>
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
                  <output>{isUnsure('vendorCount') ? '?' : inputs.vendorCount}</output>
                  <small>{C.notes.vendorRisk(inputs.vendorCount)}</small>
                  <div className="br-opts" role="radiogroup" aria-label={`${q.label}: not sure`}>
                    <NotSure k="vendorCount" />
                  </div>
                </div>
              ) : q.kind === 'yesno' ? (
                <div className="br-opts" role="radiogroup" aria-label={q.label}>
                  {[
                    [true, 'Yes'],
                    [false, 'No'],
                  ].map(([v, l]) => {
                    const on = !isUnsure(q.id) && inputs[q.id] === v
                    return (
                      <button key={String(v)} role="radio" aria-checked={on} className={on ? 'on' : ''} onClick={() => set(q.id, v as boolean)}>
                        <b>{l as string}</b>
                      </button>
                    )
                  })}
                  <NotSure k={q.id} />
                </div>
              ) : (
                <div className="br-opts" role="radiogroup" aria-label={q.label}>
                  {q.options!.map((o) => {
                    const disabled = q.id === 'itOtLink' && inputs.architecture === 'flat' && o.value !== 'direct'
                    const on = !isUnsure(q.id) && inputs[q.id] === o.value
                    return (
                      <button key={o.value} role="radio" aria-checked={on} disabled={disabled} className={on ? 'on' : ''} onClick={() => set(q.id, o.value as Inputs[keyof Inputs])}>
                        <b>{o.label}</b>
                        {o.hint && <span>{o.hint}</span>}
                      </button>
                    )
                  })}
                  <NotSure k={q.id} />
                </div>
              )}
              {isUnsure(q.id) && <p className="br-note">{C.notes.unsure}</p>}
              {q.id === 'itOtLink' && inputs.architecture === 'flat' && <p className="br-note">{C.notes.flatForcesDirect}</p>}
              {q.id === 'itOtLink' && flags.map((f) => (
                <p key={f} className="br-note br-note-warn">
                  {f}
                </p>
              ))}
            </div>
          ))}
        </div>
      ))}
      <div className="br-nav">
        <span />
        <button className="btn btn-red" onClick={next}>
          {STEPS[1]} →
        </button>
      </div>
    </div>
  )
}

/* ---------------- Step 2: results, broken into three areas ---------------- */
function Results({ data, inputs, unsure, share, capability, setCap, next, back }: { data: ReturnType<typeof worstCase>; inputs: Inputs; unsure: (keyof Inputs)[]; share: () => string; capability: Capability; setCap: (c: Capability) => void; next: () => void; back: () => void }) {
  const areas = useMemo(() => areaBreakdown(inputs, capability, data), [inputs, capability, data])
  const [view, setView] = useState<'whole' | AreaId>('whole')
  const [entry, setEntry] = useState<EntryId | null>(null)
  const area = view === 'whole' ? null : areas.find((a) => a.id === view)!
  const pool = area ? area.runs : data.runs
  const r = (entry && pool.find((x) => x.entry === entry)) || (area ? area.worst : data.worst)
  const pick = (v: 'whole' | AreaId) => {
    setView(v)
    setEntry(null)
    track('area_viewed', { area: v })
  }
  const flags = contradictions(inputs)
  const play = usePlayback(r)
  const issues = area?.findings.filter((f) => !f.good) ?? []
  const strengths = area?.findings.filter((f) => f.good) ?? []
  return (
    <div>
      <span className="eyebrow">{stepLabel(2)}</span>
      <h2>{C.results.heading}</h2>
      <AttackerPicker value={capability} onChange={setCap} />
      {(unsure.length > 0 || flags.length > 0) && (
        <div className="br-flags">
          {unsure.length > 0 && <p className="br-note">{C.notes.unsureCount(unsure.length)}</p>}
          {flags.map((f) => (
            <p key={f} className="br-note br-note-warn">
              {f}
            </p>
          ))}
        </div>
      )}
      <ShareButton share={share} />

      <h3 className="br-areas-h">{P.areaText.heading}</h3>
      <p className="br-areas-sub">{P.areaText.sub}</p>
      <div className="br-areas">
        <button className={`br-area br-area-whole${view === 'whole' ? ' on' : ''}`} onClick={() => pick('whole')}>
          <span className="br-area-top">
            <b>{P.areaText.wholeSite}</b>
            <em className={`br-area-score lvl-${areaLevelOf(data.worst.band)}`}>{data.worst.exposureScore}</em>
          </span>
          <span className={`br-level lvl-${areaLevelOf(data.worst.band)}`}>{P.areaLevel[areaLevelOf(data.worst.band)]}</span>
          <span className="br-area-q">{P.areaText.wholeSiteHint}</span>
          <small>{C.results.steps(data.worst.stepsToControl)}</small>
        </button>
        {areas.map((a) => (
          <button key={a.id} className={`br-area${view === a.id ? ' on' : ''}`} onClick={() => pick(a.id)}>
            <span className="br-area-top">
              <b>{P.areas[a.id].title}</b>
              <em className={`br-area-score lvl-${a.level}`}>{a.score}</em>
            </span>
            <span className={`br-level lvl-${a.level}`}>{P.areaLevel[a.level]}</span>
            <span className="br-area-q">{P.areas[a.id].question}</span>
            <ul>
              {a.findings
                .filter((f) => !f.good)
                .slice(0, 2)
                .map((f) => (
                  <li key={f.text}>{f.text}</li>
                ))}
            </ul>
            <small>{P.areaText.alone(data.worst.exposureScore, a.aloneScore)}</small>
          </button>
        ))}
      </div>

      <div className="br-result br-area-detail">
        <div className="br-summary">
          <h3 style={{ marginTop: 0 }}>{area ? P.areas[area.id].title : P.areaText.wholeSite}</h3>
          <p className="br-area-ways">{area ? P.areas[area.id].ways : P.areaText.wholeSiteHint}</p>
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
          <StepsToControl n={r.stepsToControl} />
          <p className="br-entry-line">
            <b>Way in:</b> {C.ENTRY_NAMES[r.entry]}. {r.entryReason}
          </p>
          <Banners r={r} />
          <OpsAtRisk inputs={inputs} r={r} />
          {area && (
            <>
              {issues.length > 0 && <h3>{P.areaText.issues}</h3>}
              <ul className="br-findings">
                {issues.map((f) => (
                  <li key={f.text}>{f.text}</li>
                ))}
              </ul>
              {strengths.length > 0 && <h3>{P.areaText.strengths}</h3>}
              <ul className="br-findings good">
                {strengths.map((f) => (
                  <li key={f.text}>{f.text}</li>
                ))}
              </ul>
            </>
          )}
          <h3>{C.results.reachHeading}</h3>
          <ReachCounts r={r} />
          <details className="br-details">
            <summary>{C.results.showPath}</summary>
            <PathList path={r.path} blocked={r.blocked} entryReason={r.entryReason} entrySucceeded={r.entrySucceeded} />
          </details>
        </div>
        <div className="br-diagram-wrap">
          <SiteDiagram
            site={r.site}
            reached={play.playing ? r.reachedAssetIds.filter((a) => play.visible.has(r.site.assets.find((x) => x.id === a)!.zone)) : r.reachedAssetIds}
            likelihood={r.assetLikelihood}
            entryZones={r.entrySucceeded ? r.entryZones : []}
            blocked={play.playing ? [] : r.blocked}
            activeZone={play.playing ? play.active : null}
          />
          <Legend />
          <button className="btn btn-line br-play" onClick={play.start} disabled={play.playing || !r.entrySucceeded}>
            {play.playing ? 'Playing the attack…' : '▶ Play the attack step by step'}
          </button>
        </div>
      </div>
      <CompliancePanel inputs={inputs} runs={data.runs} />
      <p className="fine">{C.results.likelihoodNote} {C.disclaimer}</p>
      <div className="br-nav">
        <button className="btn btn-line-b" onClick={back}>
          ← {STEPS[0]}
        </button>
        <button className="btn btn-red" onClick={next}>
          {STEPS[2]} →
        </button>
      </div>
    </div>
  )
}

/** Plays the attack path one zone at a time, the way the replay does. */
function usePlayback(r: { path: PathStep[]; entry: EntryId; capability: Capability; exposureScore: number }) {
  const order = useMemo(() => {
    const seq: ZoneId[] = []
    r.path.forEach((p) => !seq.includes(p.to) && seq.push(p.to))
    return seq
  }, [r.path])
  const [shown, setShown] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => {
    window.clearInterval(timer.current)
    setShown(null)
  }, [r.entry, r.capability, r.exposureScore])
  useEffect(() => () => window.clearInterval(timer.current), [])
  const start = () => {
    window.clearInterval(timer.current)
    track('attack_played')
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setShown(null)
    setShown(0)
    timer.current = window.setInterval(
      () =>
        setShown((n) => {
          if (n === null || n >= order.length) {
            window.clearInterval(timer.current)
            return null
          }
          return n + 1
        }),
      750,
    )
  }
  const playing = shown !== null
  return { start, playing, visible: new Set(order.slice(0, shown ?? order.length)), active: shown ? order[shown - 1] : null }
}

function ShareButton({ share }: { share: () => string }) {
  const [copied, setCopied] = useState(false)
  return (
    <p className="br-share">
      <button
        className="btn btn-line-b"
        onClick={async () => {
          const url = share()
          track('share_link_copied')
          try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2500)
          } catch {
            window.prompt('Copy this link to share your result:', url)
          }
        }}
      >
        {copied ? 'Link copied' : 'Copy a link to this result'}
      </button>
      <span>Send it to your manager. Your answers are kept in the link itself, not stored by us.</span>
    </p>
  )
}

/** Operations can stop even when OT is never touched (Colonial Pipeline, DP World). */
function OpsAtRisk({ inputs, r }: { inputs: Inputs; r: { l1Reached: boolean } }) {
  const n = normalise(inputs)
  if (!(n.architecture === 'flat' || n.itOtLink === 'direct')) return null
  return <div className="br-banner br-banner-amber">{r.l1Reached ? C.results.opsRisk : C.results.opsRiskNoControl}</div>
}

const areaLevelOf = (b: string): 'high' | 'medium' | 'low' => (b === 'Highly exposed' ? 'high' : b === 'Partly exposed' ? 'medium' : 'low')

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

function cellLabel(r: ScenarioResult) {
  return C.results.outcome.label[r.outcome]
}

function cellClass(r: ScenarioResult) {
  return r.outcome === 'succeeds' ? 'bad' : r.outcome === 'partly' ? 'warn' : 'ok'
}

/** Australian incidents first; the visitor's sector moves its own case studies to the front. */
function orderedScenarios(sector: Sector) {
  const first = SECTOR_FIRST[sector]
  return [...SCENARIOS].sort((a, b) => {
    const fa = first.indexOf(a.id)
    const fb = first.indexOf(b.id)
    if (fa !== fb) return (fa === -1 ? 99 : fa) - (fb === -1 ? 99 : fb)
    return SCENARIOS.indexOf(a) - SCENARIOS.indexOf(b)
  })
}

/** Rank fixes by how much each would likely lower the whole-site score on its own. */
function rankFixes(inputs: Inputs, capability: Capability) {
  const today = worstCase(inputs, capability).worst.exposureScore
  return FIX_ORDER.filter((f) => fixApplies(inputs, f))
    .map((fix) => ({ fix, drop: today - worstCase(applyFixes(inputs, [fix]), capability).worst.exposureScore }))
    .filter((x) => x.drop > 0)
    .sort((a, b) => b.drop - a.drop || FIX_ORDER.indexOf(a.fix) - FIX_ORDER.indexOf(b.fix))
}

function TopFixes({ ranked, today }: { ranked: { fix: FixId; drop: number }[]; today: number }) {
  if (!ranked.length) return null
  return (
    <div className="br-topfixes">
      <h3>Your top three fixes</h3>
      <p>Ranked by how much each would likely lower your score on its own. The top two are added to your plan to start with.</p>
      <ol>
        {ranked.slice(0, 3).map((x) => (
          <li key={x.fix}>
            <b>{C.fixes[x.fix]}</b>
            <span>
              Likely {today} → {today - x.drop} <em>(−{x.drop})</em>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Legend() {
  return (
    <ul className="br-legend">
      <li>
        <i className="lg-hit" /> {C.results.icon.hit} {C.results.state.hit}
      </li>
      <li>
        <i className="lg-possible" /> {C.results.icon.possible} {C.results.state.possible}
      </li>
      <li>
        <i className="lg-unlikely" /> {C.results.icon.unlikely} {C.results.state.unlikely}
      </li>
      <li>
        <i className="lg-safe" /> {C.results.icon.safe} {C.results.state.safe}
      </li>
      <li>
        <i className="lg-block" /> {C.results.icon.blocked} {C.results.state.blocked}
      </li>
      <li>
        <i className="lg-entry" /> Way in
      </li>
    </ul>
  )
}

/* ---------------- Step 3: replay ---------------- */
function Replay({ inputs, sector, next, back, latest }: { inputs: Inputs; sector: Sector; next: () => void; back: () => void; latest: () => void }) {
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
      <span className="eyebrow">{stepLabel(3)}</span>
      <h2>Replay real attacks against your site</h2>
      <p className="lead">Pick an attack. We replay how it worked against the layout you described and show the most likely outcome: likely succeeds, partly succeeds or likely stopped.</p>
      <div className="br-cards">
        {orderedScenarios(sector).map((x) => {
          const pickIt = () => {
            track('scenario_replayed', { scenario: x.id })
            setId(x.id)
          }
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
              <span>{x.facts}</span>
              <small>Target: {x.targetLabel}</small>
              <a className="br-source" href={x.source.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                Source: {x.source.label} ↗
              </a>
            </div>
          )
        })}
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
              <div className={`br-outcome ${cellClass(res)}`}>
                <b>
                  {C.results.outcome.label[res.outcome]}
                  {res.outcome === 'partly' && res.stoppedAt && `: likely stopped at ${C.ZONE_NAMES[res.stoppedAt.from]} → ${C.ZONE_NAMES[res.stoppedAt.to]}`}
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
      <p className="fine">
        {C.methodology} Attack facts and sources last reviewed {LAST_REVIEWED}.
      </p>
      <p className="fine">{C.disclaimer}</p>
      <div className="br-nav">
        <button className="btn btn-line-b" onClick={back}>
          ← {STEPS[1]}
        </button>
        <button className="btn btn-red" onClick={next}>
          {STEPS[3]} →
        </button>
      </div>
    </div>
  )
}

/* ---------------- Step 4: plan step by step ---------------- */
type R = ReturnType<typeof worstCase>['worst']
function Plan(p: { pretick: boolean; setFixes: (f: FixId[]) => void; inputs: Inputs; fixes: FixId[]; toggle: (f: FixId) => void; current: R; withFixes: R; fixedInputs: Inputs; capability: Capability; setCap: (c: Capability) => void; next: () => void; back: () => void }) {
  const [lens, setLens] = useState<P.Lens>('architect')
  const ordered = useMemo(() => planPhases(p.inputs, p.capability), [p.inputs, p.capability])
  const prog = useMemo(() => progress(p.inputs, p.capability, ordered, p.fixes), [p.inputs, p.capability, ordered, p.fixes])
  const ranked = useMemo(() => rankFixes(p.inputs, p.capability), [p.inputs, p.capability])
  const dropOf = (f: FixId) => ranked.find((x) => x.fix === f)?.drop ?? 0
  // Pre-tick the two fixes with the biggest likely drop, once, so visitors who don't click still see the improvement.
  const { pretick, setFixes, fixes } = p
  useEffect(() => {
    if (pretick && fixes.length === 0) setFixes(ranked.slice(0, 2).map((x) => x.fix))
  }, [pretick, fixes.length, ranked, setFixes])
  const T = P.planText
  return (
    <div>
      <span className="eyebrow">{stepLabel(4)}</span>
      <h2>{T.heading}</h2>
      <p className="lead">{T.lead}</p>
      <div className="br-attacker">
        <span>{T.viewAs}</span>
        <div className="br-opts" role="radiogroup" aria-label="View as">
          {P.lenses.map((l) => (
            <button key={l.value} role="radio" aria-checked={lens === l.value} className={lens === l.value ? 'on' : ''} onClick={() => setLens(l.value)}>
              <b>{l.label}</b>
              <span>{l.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <AttackerPicker value={p.capability} onChange={p.setCap} />

      <TopFixes ranked={ranked} today={p.current.exposureScore} />
      <h3 className="br-areas-h">{T.timeline}</h3>
      <ol className="br-timeline">
        <li>
          <small>{T.today}</small>
          <b className={`lvl-${areaLevelOf(p.current.band)}`}>{p.current.exposureScore}</b>
          <span>{p.current.band}</span>
        </li>
        {prog.map((x) => (
          <li key={x.phase.id}>
            <small>{T.after(ordered.indexOf(x.phase) + 1)}</small>
            <b className={`lvl-${areaLevelOf(x.band)}`}>{x.score}</b>
            <span>{x.phase.title}</span>
          </li>
        ))}
      </ol>
      {!p.fixes.length && <p className="br-note">{T.nothingYet}</p>}

      <div className="br-result">
        <div className="br-phases">
          {ordered.map((ph, k) => (
            <div key={ph.id} className="br-phase">
              <div className="br-phase-head">
                <span className="br-phase-n">Phase {k + 1}</span>
                <h3>{ph.title}</h3>
                <small>
                  {T.when}: {ph.when}
                </small>
              </div>
              <p>{ph.intro}</p>
              {ph.notes && (
                <ul className="br-findings plain">
                  {ph.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
              {ph.fixes.map((f) => {
                const applies = fixApplies(p.inputs, f)
                const on = p.fixes.includes(f)
                return (
                  <label key={f} className={`br-stepcard${on ? ' on' : ''}${applies ? '' : ' done'}`}>
                    <input type="checkbox" checked={on || !applies} disabled={!applies} onChange={() => p.toggle(f)} />
                    <span>
                      <b>{C.fixes[f]}</b>
                      {applies ? <em>{P.steps[f].lens[lens]}</em> : <em>{T.inPlace}</em>}
                      {applies && (
                        <small>
                          {dropOf(f) > 0 ? `On its own: likely −${dropOf(f)} · ` : ''}
                          {T.disruption}: {P.steps[f].disruption} · {T.helps} {FIX_ADDRESSES[f].map((g) => C.compliance.short[g]).join(', ')}
                        </small>
                      )}
                    </span>
                  </label>
                )
              })}
            </div>
          ))}
          <p className="fine">{T.orderNote}</p>
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
          <SiteDiagram site={p.withFixes.site} reached={p.withFixes.reachedAssetIds} likelihood={p.withFixes.assetLikelihood} entryZones={p.withFixes.entrySucceeded ? p.withFixes.entryZones : []} blocked={p.withFixes.blocked} />
          <Legend />
        </div>
      </div>

      {(['fix_segment_overlay', 'fix_cloak'] as FixId[]).every((f) => p.fixes.includes(f) || !fixApplies(p.inputs, f)) && (
        <div className="br-story">
          <span className="tag">{P.goodStory.tag}</span>
          <b>{P.goodStory.title}</b>
          <p>{P.goodStory.body}</p>
        </div>
      )}
      <h3 style={{ marginTop: 44 }}>Before and after</h3>
      <div className="br-beforeafter">
        <div className="br-diagram-wrap">
          <p className="br-ba-label">
            {T.today}: <b>{p.current.exposureScore}</b> {p.current.band}
          </p>
          <SiteDiagram site={p.current.site} reached={p.current.reachedAssetIds} likelihood={p.current.assetLikelihood} entryZones={p.current.entrySucceeded ? p.current.entryZones : []} blocked={p.current.blocked} />
        </div>
        <div className="br-diagram-wrap">
          <p className="br-ba-label">
            {T.withPlan}: <b>{p.withFixes.exposureScore}</b> {p.withFixes.band}
          </p>
          <SiteDiagram site={p.withFixes.site} reached={p.withFixes.reachedAssetIds} likelihood={p.withFixes.assetLikelihood} entryZones={p.withFixes.entrySucceeded ? p.withFixes.entryZones : []} blocked={p.withFixes.blocked} />
        </div>
      </div>
      <Legend />

      <h3 style={{ marginTop: 44 }}>The real attacks, today and with your plan</h3>
      <p className="br-gapcount">
        Compliance gaps: <b>{complianceGaps(p.inputs, worstCase(p.inputs, p.capability).runs).length}</b> today →{' '}
        <b>{complianceGaps(p.fixedInputs, worstCase(p.fixedInputs, p.capability).runs).length}</b> with your plan
      </p>
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
                  <td className={cellClass(a)}>{cellLabel(a)}</td>
                  <td className={cellClass(b)}>{cellLabel(b)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
          ← {STEPS[2]}
        </button>
        <button className="btn btn-red" onClick={p.next}>
          {STEPS[4]} →
        </button>
      </div>
    </div>
  )
}

/* ---------------- Step 5: offer ---------------- */
async function postForm(f: { formName: string; subject: string; name: string; email: string; message: string; location?: string }) {
  const r = await fetch(FORM_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formData: {
        websiteName: 'OT Cyber Defence',
        formName: f.formName,
        customerName: f.name,
        customerEmail: f.email,
        subject: f.subject,
        message: f.message,
        phone: '',
        location: f.location ?? '',
      },
      options: { to: REVIEW_TO, websiteName: 'OT Cyber Defence' },
    }),
  })
  if (!(r.status === 201 || r.ok)) throw new Error(String(r.status))
}

/** What OTCD receives with a board summary request: the result, not the visitor's network. */
function summaryMessage(inputs: Inputs, fixes: FixId[], current: R, withFixes: R, company: string) {
  const gaps = complianceGaps(inputs, worstCase(inputs, current.capability).runs).slice(0, 3)
  const top = rankFixes(inputs, current.capability).slice(0, 3)
  return [
    `Company: ${company}`,
    '',
    `Score today: ${current.exposureScore} (${current.band}). With their plan: ${withFixes.exposureScore} (${withFixes.band}).`,
    `Attacker: ${C.attackers.find((a) => a.value === current.capability)?.label}. Worst way in: ${C.ENTRY_NAMES[current.entry]}.`,
    '',
    'Top compliance gaps:',
    ...(gaps.length ? gaps.map((g) => `- ${g.title} (CIRMP: ${g.cirmp})`) : ['- None listed']),
    '',
    'Top fixes:',
    ...(top.length ? top.map((x) => `- ${C.fixes[x.fix]} (likely -${x.drop})`) : ['- None listed']),
    '',
    `Plan steps chosen: ${fixes.length ? fixes.map((f) => C.fixes[f]).join('; ') : 'none'}`,
    '',
    'Blast Radius settings:',
    JSON.stringify(inputs, null, 2),
  ].join('\n')
}

function SummaryCard({ inputs, fixes, current, withFixes }: { inputs: Inputs; fixes: FixId[]; current: R; withFixes: R }) {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
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
        formName: 'OT Blast Radius board summary',
        subject: `Board summary downloaded: ${v('company')}`,
        name: v('name'),
        email: v('email'),
        message: summaryMessage(inputs, fixes, current, withFixes, v('company')),
      })
      track('summary_requested')
    } catch {
      // Never hold the visitor's summary hostage to a network error.
      track('summary_request_failed')
    } finally {
      setBusy(false)
    }
    setDone(true)
    track('pdf_downloaded')
    window.print()
  }
  return (
    <div className="card">
      <h3>{C.summary.title}</h3>
      <p>{C.summary.sub}</p>
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
          <p>{C.summary.thanks}</p>
          <button
            className="btn btn-blue"
            onClick={() => {
              track('pdf_downloaded')
              window.print()
            }}
          >
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
            {C.summary.consent}{' '}
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
      <p className="fine">{C.summary.howto}</p>
    </div>
  )
}

function Offer({ sector, inputs, fixes, current, withFixes, wantLatest, back }: { sector: Sector; inputs: Inputs; fixes: FixId[]; current: R; withFixes: R; wantLatest: boolean; back: () => void }) {
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
      await postForm({
        formName: 'OT Blast Radius review request',
        subject: `Architecture review request: ${v('company')}`,
        name: v('name'),
        email: v('email'),
        message,
        location: v('state'),
      })
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
      <span className="eyebrow">{stepLabel(5)}</span>
      <h2>Your board summary and a free review</h2>
      <div className="br-offer">
        <SummaryCard inputs={inputs} fixes={fixes} current={current} withFixes={withFixes} />
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
                <select name="sector" required defaultValue={sector === 'other' ? '' : (sectors.find((x) => x.value === sector)?.formLabel ?? '')}>
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
              {busy ? 'Sending…' : 'Book my free review'}
            </button>
          </form>
        )}
      </div>
      <p className="fine">{C.disclaimer}</p>
      <div className="br-nav">
        <button className="btn btn-line-b" onClick={back}>
          ← {STEPS[3]}
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
      <h1>OT Blast Radius board summary</h1>
      <p>Prepared {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <h2>Your score</h2>
      <p>Attacker: {C.attackers.find((a) => a.value === current.capability)?.label} · {C.results.steps(current.stepsToControl)}</p>
      <p>
        Today: <b>{current.exposureScore}</b> ({current.band}) · With your plan: <b>{withFixes.exposureScore}</b> ({withFixes.band})
      </p>
      {current.sisLogicChangeable ? <p>{C.results.sisBanner}</p> : current.sisReached ? <p>{C.results.sisNetworkOnly}</p> : null}
      {current.l1Reached && <p>{current.zoneLikelihood.L1 === 'unlikely' ? C.results.l1Unlikely : C.results.l1Banner}</p>}
      <p>{C.results.likelihoodNote}</p>
      <h2>Your three areas</h2>
      <ul>
        {areaBreakdown(inputs, current.capability).map((a) => (
          <li key={a.id}>
            <b>
              {P.areas[a.id].title}: {a.score} ({P.areaLevel[a.level]}).
            </b>{' '}
            {a.findings
              .filter((f) => !f.good)
              .map((f) => f.text)
              .join(' ')}
          </li>
        ))}
      </ul>
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
      <h2>Top compliance gaps</h2>
      <ul>
        {complianceGaps(inputs, worstCase(inputs, current.capability).runs).slice(0, 3).map((g) => (
          <li key={g.id}>
            <b>{g.title}</b> (CIRMP: {g.cirmp}). {g.refs.join(' · ')}
          </li>
        ))}
      </ul>
      <p>{C.compliance.reporting}</p>
      <h2>Your top three fixes</h2>
      <ol>
        {rankFixes(inputs, current.capability)
          .slice(0, 3)
          .map((x) => (
            <li key={x.fix}>
              {C.fixes[x.fix]}: likely {current.exposureScore} → {current.exposureScore - x.drop}
            </li>
          ))}
      </ol>
      <h2>Your plan, step by step</h2>
      {planPhases(inputs, current.capability).map((ph, k) => {
        const chosen = ph.fixes.filter((f) => fixes.includes(f))
        return (
          <p key={ph.id}>
            <b>
              Phase {k + 1}: {ph.title}
            </b>{' '}
            ({ph.when}).{' '}
            {ph.notes ? ph.notes.join('. ') + '.' : chosen.length ? chosen.map((f) => C.fixes[f]).join(' · ') : 'No steps chosen yet.'}
          </p>
        )
      })}
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
