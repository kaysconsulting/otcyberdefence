import type { Capability, FixId, Inputs, ObligationId, Readiness } from './types.ts'
import { worstCase } from './model.ts'
import { obligationText as T } from '../content/copy.ts'

export interface ObligationResult {
  id: ObligationId
  group: 'all' | 'enhanced' | 'direction'
  status: Readiness
  why: string
}

export const OBLIGATION_ORDER: ObligationId[] = ['security', 'notification', 'register', 'reporting', 'riskProgram', 'maturity', 'irPlan', 'exercises', 'vulnAssess', 'sysInfo', 'phishingMfa', 'segregation', 'legacyRisk', 'logging']
export const ENHANCED: ObligationId[] = ['irPlan', 'exercises', 'vulnAssess', 'sysInfo']
/** Enhanced CIRMP Rules 2026: not applied to telecommunications assets, but a likely guide to where expectations are heading. */
export const DIRECTION: ObligationId[] = ['phishingMfa', 'segregation', 'legacyRisk', 'logging']

/** The plan steps that move each obligation forward. */
export const OBLIGATION_FIXES: Record<ObligationId, FixId[]> = {
  security: ['fix_privileged', 'fix_vendor', 'fix_edge', 'fix_api', 'fix_mgmt_sep', 'fix_segment', 'fix_li', 'fix_site'],
  notification: ['fix_change'],
  register: [],
  reporting: ['fix_monitor', 'fix_ir'],
  riskProgram: ['fix_inventory', 'fix_change'],
  maturity: [],
  irPlan: ['fix_ir'],
  exercises: ['fix_ir'],
  vulnAssess: ['fix_edge', 'fix_api', 'fix_inventory'],
  sysInfo: ['fix_monitor', 'fix_inventory'],
  phishingMfa: ['fix_privileged'],
  segregation: ['fix_mgmt_sep', 'fix_li', 'fix_site'],
  legacyRisk: ['fix_edge', 'fix_inventory'],
  logging: ['fix_monitor'],
}

function grade(id: ObligationId, i: Inputs, cap: Capability): { status: Readiness; why: string } {
  const t = T[id].status as Record<Readiness, string>
  switch (id) {
    case 'security': {
      const band = worstCase(i, cap).worst.band
      return band === 'Contained' ? { status: 'ready', why: t.ready } : band === 'Partly exposed' ? { status: 'partly', why: t.partly } : { status: 'gap', why: t.gap }
    }
    case 'notification':
      return i.changeProcess === 'formal' ? { status: 'ready', why: t.ready } : i.changeProcess === 'informal' ? { status: 'partly', why: t.partly } : { status: 'gap', why: t.gap }
    case 'register':
    case 'maturity':
      return { status: 'check', why: t.check }
    case 'reporting':
      if (i.logging === 'limited' || i.irPlan === 'none') return { status: 'gap', why: t.gap }
      return i.logging === 'monitored' ? { status: 'ready', why: t.ready } : { status: 'partly', why: t.partly }
    case 'riskProgram':
      if (i.inventory === 'partial') return { status: 'gap', why: t.gap }
      return i.inventory === 'complete' && i.changeProcess === 'formal' ? { status: 'ready', why: t.ready } : { status: 'partly', why: t.partly }
    case 'irPlan':
      return i.irPlan === 'tested' ? { status: 'ready', why: t.ready } : i.irPlan === 'it_only' ? { status: 'partly', why: t.partly } : { status: 'gap', why: t.gap }
    case 'exercises':
      return i.irPlan === 'tested' ? { status: 'ready', why: t.ready } : { status: 'gap', why: t.gap }
    case 'vulnAssess':
      if (i.edgePatching === 'behind' || i.apiExposure === 'unknown' || i.inventory === 'partial') return { status: 'gap', why: t.gap }
      return i.edgePatching === 'current' && i.apiExposure === 'tested' && i.inventory === 'complete' ? { status: 'ready', why: t.ready } : { status: 'partly', why: t.partly }
    case 'sysInfo':
      if (i.logging === 'limited' || i.inventory === 'partial') return { status: 'gap', why: t.gap }
      return i.logging === 'monitored' && i.inventory === 'complete' ? { status: 'ready', why: t.ready } : { status: 'partly', why: t.partly }
    case 'phishingMfa':
      return i.privilegedAuth === 'phishing_resistant' ? { status: 'ready', why: t.ready } : i.privilegedAuth === 'mfa_app' ? { status: 'partly', why: t.partly } : { status: 'gap', why: t.gap }
    case 'segregation': {
      if (i.mgmtSeparation === 'shared' || i.siteOt === 'on_corporate' || i.liIsolation === 'shared') return { status: 'gap', why: t.gap }
      return i.mgmtSeparation === 'dedicated_oob' && i.siteOt === 'isolated' ? { status: 'ready', why: t.ready } : { status: 'partly', why: t.partly }
    }
    case 'legacyRisk':
      if (i.edgePatching === 'behind' || i.inventory === 'partial') return { status: 'gap', why: t.gap }
      return i.edgePatching === 'current' && i.inventory === 'complete' ? { status: 'ready', why: t.ready } : { status: 'partly', why: t.partly }
    case 'logging':
      return i.logging === 'monitored' ? { status: 'ready', why: t.ready } : i.logging === 'central' ? { status: 'partly', why: t.partly } : { status: 'gap', why: t.gap }
  }
}

export function obligations(i: Inputs, cap: Capability): ObligationResult[] {
  return OBLIGATION_ORDER.map((id) => ({ id, group: ENHANCED.includes(id) ? 'enhanced' : DIRECTION.includes(id) ? 'direction' : 'all', ...grade(id, i, cap) }))
}

/** How many SOCI obligations look ready, out of those this tool can assess (the direction of travel is shown, not counted). */
export function readyCount(rs: ObligationResult[]) {
  const assessed = rs.filter((r) => r.status !== 'check' && r.group !== 'direction')
  return { ready: assessed.filter((r) => r.status === 'ready').length, of: assessed.length }
}
