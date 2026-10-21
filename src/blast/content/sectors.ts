// "What do you operate?" Renames the diagram's asset groups and puts that sector's case studies first.
import type { ScenarioId } from '../engine/types.ts'

export type Sector = 'water' | 'energy' | 'rail' | 'ports' | 'mining' | 'manufacturing' | 'other'

export const sectors: { value: Sector; label: string; formLabel: string }[] = [
  { value: 'water', label: 'Water', formLabel: 'Water' },
  { value: 'energy', label: 'Energy', formLabel: 'Energy' },
  { value: 'rail', label: 'Rail', formLabel: 'Rail and transport' },
  { value: 'ports', label: 'Ports', formLabel: 'Ports' },
  { value: 'mining', label: 'Mining', formLabel: 'Mining' },
  { value: 'manufacturing', label: 'Manufacturing', formLabel: 'Manufacturing' },
  { value: 'other', label: 'Something else', formLabel: 'Other' },
]

type Names = { plc: string; rtu: string; hmi: string; sis: string }
const NAMES: Record<Sector, Names> = {
  water: { plc: 'Pump station PLC', rtu: 'Telemetry RTU', hmi: 'SCADA HMI group', sis: 'Dosing safety system' },
  energy: { plc: 'Substation controller', rtu: 'Protection relay group', hmi: 'Control room HMI group', sis: 'Safety controller' },
  rail: { plc: 'Signalling controller', rtu: 'Trackside RTU', hmi: 'Control centre HMI group', sis: 'Train protection system' },
  ports: { plc: 'Crane PLC', rtu: 'Gate and yard RTU', hmi: 'Terminal HMI group', sis: 'Crane safety system' },
  mining: { plc: 'Conveyor PLC', rtu: 'Remote site RTU', hmi: 'Control room HMI group', sis: 'Safety controller' },
  manufacturing: { plc: 'Line PLC', rtu: 'Utility RTU', hmi: 'Line HMI group', sis: 'Machine safety controller' },
  other: { plc: 'PLC group', rtu: 'RTU group', hmi: 'HMI group', sis: 'Safety controller' },
}

/** The label to show for an asset group in this sector. */
export function assetLabel(id: string, fallback: string, sector: Sector): string {
  const n = NAMES[sector]
  let m = id.match(/^L1-plc(\d)$/)
  if (m) return Number(m[1]) <= 4 ? `${n.plc} ${m[1]}` : `${n.rtu} ${Number(m[1]) - 4}`
  m = id.match(/^L2-hmi(\d)$/)
  if (m) return `${n.hmi} ${m[1]}`
  m = id.match(/^SIS-(\d)$/)
  if (m) return `${n.sis} ${m[1]}`
  return fallback
}

/** Case studies most relevant to each sector, shown first. */
export const SECTOR_FIRST: Record<Sector, ScenarioId[]> = {
  water: ['maroochy', 'cyberav3ngers'],
  energy: ['ukraine2015', 'frostygoop', 'colonial'],
  rail: ['dpworld', 'notpetya'],
  ports: ['dpworld', 'notpetya'],
  mining: ['triton', 'notpetya'],
  manufacturing: ['notpetya', 'stuxnet'],
  other: [],
}
