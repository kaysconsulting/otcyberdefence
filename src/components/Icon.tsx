import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Cable,
  ClipboardCheck,
  EyeOff,
  FileSearch,
  Fingerprint,
  Gauge,
  HardHat,
  LayoutGrid,
  Network,
  Presentation,
  ScreenShare,
  ShieldCheck,
  Siren,
  TrainFront,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { IconName } from '../content.ts'

// One icon family (Lucide): 24px grid, identical stroke weight and round caps everywhere.
const STROKE = 1.75

const map: Record<IconName, LucideIcon> = {
  shieldCheck: ShieldCheck,
  gauge: Gauge,
  activity: Activity,
  network: Network,
  presentation: Presentation,
  siren: Siren,
  eyeOff: EyeOff,
  fingerprint: Fingerprint,
  layoutGrid: LayoutGrid,
  screenShare: ScreenShare,
  train: TrainFront,
  hardHat: HardHat,
  clipboardCheck: ClipboardCheck,
  fileSearch: FileSearch,
  wrench: Wrench,
  cable: Cable,
}

/** Feature icon in a centred tile. */
export default function Icon({ name }: { name: IconName }) {
  const Glyph = map[name]
  return (
    <span className="ico" aria-hidden="true">
      <Glyph size={22} strokeWidth={STROKE} />
    </span>
  )
}

/** Inline arrow for buttons and text links. */
export function Arrow() {
  return <ArrowRight className="arrow" size={16} strokeWidth={2} aria-hidden="true" />
}

/** External-link arrow. */
export function External() {
  return <ArrowUpRight className="ext" size={14} strokeWidth={2} aria-hidden="true" />
}

/** Circular arrow button used on cards. */
export function ArrowCircle({ sm }: { sm?: boolean }) {
  return (
    <span className={`arrow-circle${sm ? ' sm' : ''}`} aria-hidden="true">
      <ArrowRight size={sm ? 15 : 17} strokeWidth={2} />
    </span>
  )
}
