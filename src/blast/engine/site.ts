import type { AssetGroup, Conduit, Inputs, Site, Strength, ZoneId } from './types.ts'

export const CRITICALITY: Record<ZoneId, number> = { L4: 1, L35: 2, L3: 3, L2: 4, L1: 5, SIS: 6 }

// Fixed asset groups so diagrams are stable.
const ASSETS: Record<ZoneId, [string, string][]> = {
  L4: [['L4-pcs', 'Corporate PCs'], ['L4-email', 'Email'], ['L4-erp', 'ERP']],
  L35: [['L35-patch', 'Patch server'], ['L35-hist', 'Historian replica'], ['L35-ra', 'Remote access gateway']],
  L3: [['L3-scada', 'SCADA servers'], ['L3-hist', 'Historian'], ['L3-ews', 'Engineering workstation']],
  L2: [['L2-hmi1', 'HMI group 1'], ['L2-hmi2', 'HMI group 2'], ['L2-ops', 'Operator stations']],
  L1: [1, 2, 3, 4, 5, 6].map((n) => [`L1-plc${n}`, n <= 4 ? `PLC group ${n}` : `RTU group ${n - 4}`]),
  SIS: [['SIS-1', 'Safety controller 1'], ['SIS-2', 'Safety controller 2']],
}

export const hasDmz = (i: Inputs) => i.architecture === 'purdue_dmz' || i.architecture === 'microsegmented'

const pick = <T,>(i: Inputs, m: Record<Inputs['architecture'], T>) => m[i.architecture]

export function buildSite(inputs: Inputs): Site {
  const dmz = hasDmz(inputs)
  const zones: ZoneId[] = dmz ? ['L4', 'L35', 'L3', 'L2', 'L1', 'SIS'] : ['L4', 'L3', 'L2', 'L1', 'SIS']

  const assets: AssetGroup[] = []
  for (const z of zones) {
    const list = ASSETS[z]
    const legacyCount =
      z === 'L1' || z === 'L2' ? (inputs.legacy === 'many' ? list.length : inputs.legacy === 'some' ? Math.ceil(list.length / 2) : 0) : 0
    list.forEach(([id, label], idx) => assets.push({ id, zone: z, label, criticality: CRITICALITY[z], legacy: idx < legacyCount }))
  }

  const conduits: Conduit[] = []
  const add = (a: ZoneId, b: ZoneId, s: Strength, allowedFlow?: string) => {
    conduits.push({ from: a, to: b, strength: s, allowedFlow }, { from: b, to: a, strength: s, allowedFlow })
  }

  if (dmz) {
    add('L4', 'L35', 2)
    add('L35', 'L3', 2)
    // A direct IT/OT firewall path bypassing the DMZ is only "filtered"; otherwise traffic must go via the DMZ.
    add('L4', 'L3', inputs.itOtLink === 'direct' ? 1 : 3)
  } else {
    add('L4', 'L3', pick<Strength>(inputs, { flat: 0, vlans: 1, purdue_dmz: 3, microsegmented: 3 }))
  }
  add('L3', 'L2', pick<Strength>(inputs, { flat: 0, vlans: 0, purdue_dmz: 1, microsegmented: 2 }))
  add('L2', 'L1', pick<Strength>(inputs, { flat: 0, vlans: 0, purdue_dmz: 0, microsegmented: 2 }))
  add(
    'L3',
    'L1',
    pick<Strength>(inputs, { flat: 0, vlans: 0, purdue_dmz: 1, microsegmented: 2 }),
    dmz ? 'EWS programming traffic' : undefined,
  )
  let sis = pick<Strength>(inputs, { flat: 0, vlans: 0, purdue_dmz: 1, microsegmented: 2 })
  if (inputs.sisZone === 'dedicated') sis = (dmz ? 3 : Math.max(sis, 2)) as Strength
  for (const z of ['L3', 'L2', 'L1'] as ZoneId[]) add(z, 'SIS', sis)

  const restricted = inputs.architecture === 'microsegmented'
  const intraSpread = Object.fromEntries(
    (['L4', 'L35', 'L3', 'L2', 'L1', 'SIS'] as ZoneId[]).map((z) => {
      const cloakedZone = inputs.visibility === 'cloaked' && (z === 'L2' || z === 'L1' || z === 'SIS')
      return [z, restricted || cloakedZone ? 'restricted' : 'open']
    }),
  ) as Site['intraSpread']

  return { zones, assets, conduits, intraSpread }
}
