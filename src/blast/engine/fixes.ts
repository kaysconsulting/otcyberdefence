import type { FixId, Inputs } from './types.ts'
import { normalise } from './inputs.ts'

/** Spec 9: each fix maps to input changes, so the engine simply re-runs. */
export const FIX_CHANGES: Record<FixId, Partial<Inputs>> = {
  fix_remote: { remoteAccess: 'zero_trust_biometric' },
  fix_segment_overlay: { architecture: 'microsegmented', sisZone: 'dedicated', itOtLink: 'via_dmz' },
  fix_cloak: { visibility: 'cloaked' },
  fix_media: { removableMedia: 'controlled' },
  fix_accounts: { sharedAccounts: false, dormantAccounts: 'regularly' },
}

export const FIX_ORDER: FixId[] = ['fix_remote', 'fix_segment_overlay', 'fix_cloak', 'fix_media', 'fix_accounts']

export function applyFixes(inputs: Inputs, fixes: FixId[]): Inputs {
  return normalise(FIX_ORDER.filter((f) => fixes.includes(f)).reduce((i, f) => ({ ...i, ...FIX_CHANGES[f] }), inputs))
}
