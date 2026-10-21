import type { FixId, Inputs } from './types.ts'
import { normalise } from './inputs.ts'

/** Spec 9: each fix maps to input changes, so the engine simply re-runs. Some depend on the site as it stands. */
export const FIX_CHANGES: Record<FixId, Partial<Inputs> | ((i: Inputs) => Partial<Inputs>)> = {
  fix_accounts: { sharedAccounts: false, dormantAccounts: 'regularly' },
  fix_keyswitch: { sisKeySwitch: 'run' },
  fix_media: { removableMedia: 'controlled' },
  fix_remote: { remoteAccess: 'zero_trust_biometric' },
  // First segmentation stage: a real boundary between IT and OT, through an industrial DMZ.
  fix_itot_dmz: (i) => (i.architecture === 'flat' || i.architecture === 'vlans' ? { architecture: 'purdue_dmz', itOtLink: 'via_dmz' } : { itOtLink: 'via_dmz' }),
  fix_sis_zone: { sisZone: 'dedicated' },
  fix_segment_overlay: { architecture: 'microsegmented', sisZone: 'dedicated', itOtLink: 'via_dmz' },
  fix_cloak: { visibility: 'cloaked' },
}

/** Order changes are applied in (later stages build on earlier ones). */
export const FIX_ORDER: FixId[] = ['fix_accounts', 'fix_keyswitch', 'fix_media', 'fix_remote', 'fix_itot_dmz', 'fix_sis_zone', 'fix_segment_overlay', 'fix_cloak']

export const changesFor = (f: FixId, i: Inputs): Partial<Inputs> => {
  const c = FIX_CHANGES[f]
  return typeof c === 'function' ? c(i) : c
}

export function applyFixes(inputs: Inputs, fixes: FixId[]): Inputs {
  return normalise(FIX_ORDER.filter((f) => fixes.includes(f)).reduce((i, f) => ({ ...i, ...changesFor(f, i) }), inputs))
}

/** True when the fix would change something on this site (it is not already in place). */
export function fixApplies(inputs: Inputs, f: FixId): boolean {
  const c = changesFor(f, inputs)
  return (Object.keys(c) as (keyof Inputs)[]).some((k) => c[k] !== inputs[k])
}
