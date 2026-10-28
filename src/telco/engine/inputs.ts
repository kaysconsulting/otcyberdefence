import type { Inputs } from './types.ts'

/** A typical carrier that has not yet separated or segmented its management network. */
export const DEFAULT_INPUTS: Inputs = {
  mgmtSeparation: 'firewalled',
  mgmtSegmentation: 'flat',
  liIsolation: 'separate',
  siteOt: 'on_corporate',
  privilegedAuth: 'mfa_app',
  vendorAccess: 'always_on',
  vendorCount: 12,
  sharedAccounts: true,
  edgePatching: 'mostly',
  apiExposure: 'inventoried',
  inventory: 'mostly',
  logging: 'central',
  irPlan: 'it_only',
  changeProcess: 'informal',
}

/** "Not sure" is scored as the riskier answer. */
export const RISKIER: Inputs = {
  mgmtSeparation: 'shared',
  mgmtSegmentation: 'flat',
  liIsolation: 'shared',
  siteOt: 'on_corporate',
  privilegedAuth: 'password',
  vendorAccess: 'always_on',
  vendorCount: 26,
  sharedAccounts: true,
  edgePatching: 'behind',
  apiExposure: 'unknown',
  inventory: 'partial',
  logging: 'limited',
  irPlan: 'none',
  changeProcess: 'none',
}

/** The answers the engine uses: each "Not sure" replaced with the riskier answer. */
export function effective(inputs: Inputs, unsure: (keyof Inputs)[]): Inputs {
  const out = { ...inputs } as Record<keyof Inputs, Inputs[keyof Inputs]>
  for (const k of unsure) out[k] = RISKIER[k]
  return out as Inputs
}
