// All user-facing text for OT Blast Radius, in one place so wording can be reviewed without touching logic.
// House rules: no partner names, no "demo", always "network segmentation", Australian English, no em dashes.
import type { EntryId, Inputs, ZoneId } from '../engine/types.ts'

export const ZONE_NAMES: Record<ZoneId, string> = {
  L4: 'Enterprise IT',
  L35: 'Industrial DMZ',
  L3: 'Site operations',
  L2: 'Supervisory control',
  L1: 'Control',
  SIS: 'Safety systems',
}

export const ZONE_SHORT: Record<ZoneId, string> = {
  L4: 'Level 4',
  L35: 'Level 3.5',
  L3: 'Level 3',
  L2: 'Level 2',
  L1: 'Level 1',
  SIS: 'Safety',
}

export const ENTRY_NAMES: Record<EntryId, string> = {
  phished_login: 'A phished IT user login',
  stolen_remote_cred: 'A stolen remote access login',
  infected_usb: 'An infected USB stick or visiting laptop',
  poisoned_update: 'A malicious software update',
  vendor_account: "A vendor's compromised account",
}

export const STRENGTH_NAMES = ['open', 'filtered', 'controlled', 'blocked'] as const

export const landing = {
  eyebrow: 'Free tool · OT Blast Radius',
  title: 'How far would one stolen login get on your site?',
  sub: 'Build a site like yours in two minutes. Replay real OT attacks against it. No sign-up, and we never ask for real network details.',
  cta: 'Build my site',
  points: [
    'Describe a site like yours with simple, generic options',
    'See how far an attacker could likely get, step by step, with the reasoning for each step',
    'Replay six real attacks and compare the fixes that would stop them',
  ],
}

type Opt<T extends string> = { value: T; label: string; hint?: string }
export type Question = {
  id: keyof Inputs
  label: string
  helper: string
  options?: Opt<string>[]
  kind?: 'slider' | 'yesno'
}

export const groups: { title: string; questions: Question[] }[] = [
  {
    title: 'Network layout',
    questions: [
      {
        id: 'architecture',
        label: 'How is your OT network laid out?',
        helper: 'Pick the closest match. Most sites sit somewhere between two of these.',
        options: [
          { value: 'flat', label: 'Flat', hint: 'One network for IT and OT' },
          { value: 'vlans', label: 'VLANs', hint: 'VLANs with broad firewall rules' },
          { value: 'purdue_dmz', label: 'Purdue with DMZ', hint: 'Purdue levels with an industrial DMZ' },
          { value: 'microsegmented', label: 'Per-asset', hint: 'Per-asset network segmentation' },
        ],
      },
      {
        id: 'itOtLink',
        label: 'How do IT and OT connect?',
        helper: 'An air gap claim is tested against USB sticks and visiting laptops too.',
        options: [
          { value: 'direct', label: 'Direct', hint: 'IT can route straight to OT' },
          { value: 'via_dmz', label: 'Through a DMZ', hint: 'Only via an industrial DMZ' },
          { value: 'airgap_claimed', label: "We're air-gapped", hint: 'No network link to IT' },
        ],
      },
      {
        id: 'sisZone',
        label: 'Are safety systems in their own zone?',
        helper: 'Safety instrumented systems (SIS) protect people and plant when control fails.',
        options: [
          { value: 'shared', label: 'Shared', hint: 'On the same network as control' },
          { value: 'dedicated', label: 'Dedicated', hint: 'In their own zone' },
        ],
      },
      {
        id: 'visibility',
        label: 'Can PLCs, HMIs and SCADA be seen by a network scan?',
        helper: 'If a scan can find them, an attacker on the network can too.',
        options: [
          { value: 'visible', label: 'Visible', hint: 'They answer a network scan' },
          { value: 'cloaked', label: 'Cloaked', hint: 'Hidden from scanning' },
        ],
      },
    ],
  },
  {
    title: 'Remote access',
    questions: [
      {
        id: 'remoteAccess',
        label: 'How do engineers and vendors connect remotely?',
        helper: 'Where a remote session lands decides how much of the site it can see.',
        options: [
          { value: 'vpn_password', label: 'VPN, password only' },
          { value: 'vpn_mfa', label: 'VPN with MFA', hint: 'App or SMS codes' },
          { value: 'jumpbox', label: 'Jump box', hint: 'A jump box in the DMZ' },
          { value: 'zero_trust_biometric', label: 'Zero trust', hint: 'Passwordless biometric MFA, per-asset access' },
        ],
      },
      { id: 'vendorCount', label: 'Roughly how many vendors have remote access?', helper: 'Each vendor account is another way in.', kind: 'slider' },
      { id: 'sharedAccounts', label: 'Do any vendors or teams share logins?', helper: 'Shared logins make it hard to know who approved an MFA prompt.', kind: 'yesno' },
      {
        id: 'dormantAccounts',
        label: 'Are old remote access accounts reviewed and removed?',
        helper: 'Forgotten accounts are a common way in.',
        options: [
          { value: 'rarely', label: 'Rarely' },
          { value: 'regularly', label: 'Regularly' },
        ],
      },
    ],
  },
  {
    title: 'Devices and media',
    questions: [
      {
        id: 'legacy',
        label: "How many devices can't be patched?",
        helper: 'Unpatched services make it easier to move from one device to the next.',
        options: [
          { value: 'none', label: 'None' },
          { value: 'some', label: 'Some' },
          { value: 'many', label: 'Many' },
        ],
      },
      {
        id: 'sisKeySwitch',
        label: 'Are safety controller key switches left in program mode?',
        helper: 'Many safety controllers only accept new logic when a physical key switch is in program mode.',
        options: [
          { value: 'program', label: 'Program, or not sure', hint: 'Left where logic can be changed' },
          { value: 'run', label: 'Kept in run', hint: 'Moved to program only under a permit' },
        ],
      },
      {
        id: 'removableMedia',
        label: 'Are USB drives and visiting laptops controlled?',
        helper: 'Removable media crosses air gaps. This was the Stuxnet lesson.',
        options: [
          { value: 'uncontrolled', label: 'Uncontrolled' },
          { value: 'controlled', label: 'Controlled' },
        ],
      },
    ],
  },
]

export const notes = {
  flatForcesDirect: 'A flat network has no separation between IT and OT, so IT and OT connect directly.',
  vendorRisk: (n: number) =>
    n >= 20
      ? `With ${n} vendors holding remote access, a compromised vendor account is a realistic way in.`
      : n > 0
        ? `${n} vendors hold remote access. Each one is another account that can be lost or stolen.`
        : 'No vendors hold remote access.',
}

// Entry reasons. Wording is probabilistic on purpose: the model shows likely outcomes, not certainties.
export const entryReason = {
  phished: 'A phishing email is likely to work at some point, giving the attacker an IT user login.',
  remotePassword: 'The VPN only needs a password, so a stolen password would most likely be enough to get in.',
  remoteMfaShared: 'A stolen VPN login would likely work: the account is shared, so an MFA prompt could be approved by someone else.',
  remoteMfaDormant: 'A stolen VPN login would likely work: old accounts that are rarely reviewed often stay active.',
  remoteMfaFail: 'A stolen VPN password alone is unlikely to be enough: MFA should block the login, and accounts are personal and reviewed.',
  jumpboxShared: 'The jump box login is shared, so a stolen password would likely open it.',
  jumpboxFail: 'The jump box needs a personal login, so a stolen credential is unlikely to work.',
  zeroTrustFail: 'There is no password to steal: zero trust remote access uses passwordless biometric MFA tied to one person and one asset, so this way in is very unlikely to work.',
  usbIn: 'Nothing checks USB drives or visiting laptops, so malware could quite easily reach the engineering workstation.',
  usbBlocked: 'USB drives and visiting laptops are controlled, so infected media is unlikely to reach the plant.',
  update: 'A trusted software update can carry malware in. Supply chain attacks tend to land wherever the software is installed.',
  remoteLandsL3: 'The VPN would likely put the session on the site network, where it could see much of what the VPN routes to.',
  remoteLandsDmz: 'Remote access should end in the industrial DMZ, so the session would most likely start at the remote access gateway.',
  notAirgapped: 'A site with remote access is, in practice, not air-gapped.',
  vendorMfaGap: (n: number) =>
    `With ${n} vendors holding access, MFA exceptions, shared vendor logins and vendors' own remote tools become likely, so a compromised vendor account could well get in.`,
  noVendors: 'No vendors hold remote access, so there is no vendor account to compromise.',
  updateIt: 'A trusted IT software update could carry the malware onto corporate PCs.',
  updateOtDmz: 'OT vendor updates are staged on the DMZ patch server, so a poisoned update would most likely land there first.',
  updateOtDirect: 'With no DMZ to stage it, an OT vendor update would likely install straight onto site operations servers.',
  remoteLandsL35: 'The jump box sits in the industrial DMZ, so the session would most likely start there.',
  jumpboxNoDmz: 'Without an industrial DMZ, the jump box likely sits on the site network itself.',
}

const S = STRENGTH_NAMES
const CROSS_PREFIX = { likely: 'Likely to cross', possible: 'Could cross', unlikely: 'Unlikely, but possible, to cross' } as const
export const crossReason = (from: ZoneId, to: ZoneId, strength: number, why: string, lik: keyof typeof CROSS_PREFIX = 'likely') =>
  `${CROSS_PREFIX[lik]} from ${ZONE_NAMES[from].toLowerCase()} to ${ZONE_NAMES[to].toLowerCase()}: ${why} (${S[strength]} conduit).`
export const blockReason = (from: ZoneId, to: ZoneId, why: string) =>
  `Likely to stop between ${ZONE_NAMES[from].toLowerCase()} and ${ZONE_NAMES[to].toLowerCase()}: ${why}`

export const why = {
  open: 'nothing separates them, so traffic is likely to flow freely',
  vlanBroad: 'broad VLAN rules usually allow plenty of traffic between them',
  filteredWeak: 'filtered firewall rules often leave paths a capable attacker can use',
  controlledBeaten: 'a highly capable attacker may find and exploit a weakness in the controls',
  legacy: 'unpatched services on a legacy device would likely make the pivot easier',
  allowedFlow: 'the engineering workstation is allowed to program the PLCs, and an attacker could ride that trusted traffic',
  credential: 'the stolen login is likely authorised to use this remote access route, so no firewall would need to be beaten',
  blocked: 'there appears to be no network path between these zones.',
  commodityNoLogic:
    'commodity attackers tend to encrypt Windows systems and rarely have the know-how to change PLC or safety controller logic.',
  controlled: 'the conduit should only allow specific, authorised traffic.',
  sisDedicated: 'safety systems sit in their own zone with no routed path in.',
  airgap: 'with no network path from IT into OT, network-based attacks would most likely stop here.',
  cloaked: 'the OT devices are cloaked, so an attacker would be unlikely to find anything to connect to.',
  filtered: 'the firewall rules would likely hold against this attacker.',
}

export const spreadReason = {
  open: (z: ZoneId) => `Likely to spread across ${ZONE_NAMES[z].toLowerCase()}: little separates the devices inside this zone.`,
  restricted: (z: ZoneId) => `Likely held to one device in ${ZONE_NAMES[z].toLowerCase()}: network segmentation separates each asset.`,
}

export const scenarioReason = {
  intertwined: 'IT and OT appear too intertwined to isolate one without stopping the other, so an operational shutdown is likely.',
  separable: 'IT and OT can likely be separated, so operations could probably keep running while IT recovered.',
  reached: (z: ZoneId) => `The attacker could likely reach ${ZONE_NAMES[z].toLowerCase()}.`,
  spread: 'The malware would likely spread beyond where it landed.',
  contained: 'The malware would most likely stay where it landed.',
  intoOps: 'The malware would likely spread into operations.',
  keptOutOfOps: 'The malware would most likely be kept out of operations.',
  sisKeySwitch:
    "The attacker could likely reach the safety network, but with the controllers' key switches in run, changing their logic remotely is unlikely.",
}

export const results = {
  eyebrow: 'Your blast radius',
  heading: 'How far one way in could likely get on your site',
  reachHeading: 'What an attacker could likely reach',
  bands: {
    Contained: 'An attacker would likely gain a foothold, but is unlikely to get far.',
    'Partly exposed': 'An attacker could likely reach part of operations before being stopped.',
    'Highly exposed': 'An attacker could likely reach most of operations, including control systems.',
  },
  sisBanner: 'Safety systems are likely within reach. An attacker could potentially change the logic of the systems that protect people and plant.',
  sisNetworkOnly:
    'The safety network is likely within reach, but with key switches in run, safety logic is better protected. The controllers could still be disrupted.',
  l1Banner: 'An attacker could potentially change control logic.',
  sisUnlikely:
    'Reaching the safety systems is unlikely, but a highly capable attacker could possibly get there. Their logic could then potentially be changed.',
  l1Unlikely: 'Reaching control systems is unlikely, but possible for a highly capable attacker.',
  likelihoodNote:
    'The score weights each asset group by how likely it is to be reached: likely counts fully, possible about 60% and unlikely about 30%.',
  showPath: 'Show the likely attack path',
  worstCase: 'Worst case across all entry points',
  steps: (n: number | null) =>
    n === null ? 'Control unlikely to be reached' : n === 0 ? 'Likely lands in control directly' : `Likely ${n} ${n === 1 ? 'step' : 'steps'} to reach control`,
  stepsHelp:
    'Roughly how many moves between zones an attacker would need before they could change control logic. Fewer steps usually means less chance to detect and stop them.',
  state: { hit: 'Likely reached', possible: 'Possibly reached', unlikely: 'Unlikely, but possible', safe: 'Likely safe', blocked: 'Likely blocked' },
  tags: { entry: 'Way in', cross: 'Likely crosses', possible: 'Could cross', unlikely: 'Unlikely, possible', spread: 'Inside zone', stopped: 'Likely stopped', entryFailed: 'Way in unlikely' },
  outcome: {
    succeed: 'Likely to succeed',
    possible: 'Could succeed',
    unlikely: 'Unlikely, but possible',
    stoppedAt: (a: string, b: string) => `Likely stopped at: ${a} → ${b}`,
    stopped: 'Likely stopped',
    replaying: 'Replaying…',
    cell: { succeed: 'Likely succeeds', possible: 'Could succeed', unlikely: 'Unlikely, but possible', stopped: 'Likely stopped' },
  },
}

export const attackers = [
  { value: 1, label: 'Commodity', hint: 'Ransomware crews. The most likely attacker.' },
  { value: 2, label: 'Targeted', hint: 'Organised groups who study your sector.' },
  { value: 3, label: 'Nation-state', hint: 'Well-funded, patient and highly capable.' },
] as const

export const fixes = {
  fix_remote: 'Replace VPNs with zero trust secure remote access',
  fix_segment_overlay: 'Network segmentation as an overlay (OTCD)',
  fix_cloak: 'Cloak OT devices from scanning',
  fix_media: 'Control USB drives and visiting laptops',
  fix_accounts: 'Remove shared and dormant accounts',
}

export const tradeoffs: [string, string, string][] = [
  ['Planned downtime', 'Usually needs outage windows', 'Designed to deploy without downtime'],
  ['Re-IP of devices', 'Often required', 'Not usually required'],
  ['Changes to PLC/HMI config', 'Sometimes', 'None expected'],
  ['Time to first protected zone', 'Longer (design, change approvals, outages)', 'Shorter (start with highest-risk assets)'],
  ['Protects legacy devices', 'Only if they can be moved or patched', 'Yes, designed to wrap unpatchable devices'],
  ['Ongoing effort', 'Firewall rule management', 'Policy managed centrally'],
  ['Honest downsides', 'Proven, familiar to IT teams', 'New platform for the team to learn; needs OT-aware design to get policies right'],
]

export const offer = {
  title: 'Book a free 30-minute architecture review',
  sub: 'An OTCD engineer will walk through your result with you, map it to your CIRMP and IEC 62443 obligations, and talk through practical first steps. No obligation.',
  includeSettings: 'Include my Blast Radius settings so OTCD can prepare for the review.',
  consent:
    'By sending this form you agree that OT Cyber Defence may contact you about your request. We handle your details in line with the Australian Privacy Principles.',
  privacy:
    'We collect anonymous usage events to improve this tool. Your settings are never stored unless you choose to share them.',
  thanks: 'Thanks. An OTCD engineer will be in touch within one business day to arrange your review.',
  roles: ['OT engineer', 'OT or site manager', 'Security', 'Executive', 'Other'],
  sectors: ['Energy', 'Water', 'Rail and transport', 'Ports', 'Mining', 'Oil and gas', 'Manufacturing', 'Government and defence', 'Other'],
  states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
}

export const disclaimer =
  'OT Blast Radius is an illustrative planning tool. It shows likely outcomes based on simplified, generic models, not certainties, and it is not a security assessment of your site. Real exposure depends on your specific architecture, configuration and controls. For an assessment of your environment, talk to OT Cyber Defence.'

// Compliance layer. Areas and references are kept general on purpose: this is a planning aid, not a compliance assessment.
const CIRMP_CYBER = 'Cyber and information security hazards'
const CIRMP_SUPPLY = 'Supply chain hazards'
export const compliance = {
  eyebrow: 'What this means for compliance',
  intro:
    'Under the SOCI Act, responsible entities must keep a Critical Infrastructure Risk Management Program (CIRMP) that minimises or eliminates material risks, and their board approves an annual report on it. These are the areas your result is most likely to touch.',
  none: 'No obvious gaps for this layout and attacker. Keep the evidence: your board attests to the CIRMP every year.',
  count: (n: number) => (n === 0 ? 'No obvious compliance gaps' : `${n} likely compliance ${n === 1 ? 'gap' : 'gaps'} to review`),
  reporting:
    'A real incident like this may need to be reported to the ACSC under the SOCI Act: within 12 hours if it has a significant impact on your asset, or 72 hours if it has a relevant impact.',
  board: 'Your board approves the CIRMP annual report. A result like this is likely something it would want to know about.',
  addresses: 'Helps with:',
  short: {
    remote: 'Remote access',
    supply: 'Supply chain',
    segmentation: 'Zones and conduits',
    safety: 'Safety systems',
    legacy: 'Unpatchable devices',
    media: 'Removable media',
    accounts: 'Accounts',
  } as Record<string, string>,
  remote: {
    cirmp: CIRMP_CYBER,
    title: 'Remote access could likely be used with a stolen login',
    detail: 'Remote access is likely a material cyber risk to operations. Logins are best kept personal, phishing-resistant and limited to the assets each person needs.',
    refs: ['SOCI Act: CIRMP', 'IEC 62443-3-3 FR1 Identification and authentication', 'Essential Eight: Multi-factor authentication', 'AESCSF: Identity and access management'],
  },
  supply: {
    cirmp: CIRMP_SUPPLY,
    title: 'Vendors and software updates could carry an attacker into operations',
    detail: 'The CIRMP must address supply chain hazards, including third-party access and the software you install.',
    refs: ['SOCI Act: CIRMP (supply chain hazards)', 'IEC 62443-2-4 Service provider requirements', 'AESCSF: Third-party risk management'],
  },
  segmentation: {
    cirmp: CIRMP_CYBER,
    title: 'Zones and conduits may not stop an attacker reaching control systems',
    detail: 'Control systems are best placed in zones whose conduits only allow the traffic they need, so one compromise is less likely to spread to the PLCs.',
    refs: ['IEC 62443-3-2 Zones and conduits', 'IEC 62443-3-3 FR5 Restricted data flow', 'AESCSF: Cybersecurity architecture'],
  },
  safety: {
    cirmp: CIRMP_CYBER,
    title: 'Safety system logic may be changeable over the network',
    detail: 'Safety instrumented systems need their own security risk assessment, and protection that keeps their logic out of reach.',
    refs: ['IEC 61511-1 SIS security risk assessment', 'IEC 62443-3-2 Zones and conduits'],
  },
  legacy: {
    cirmp: CIRMP_CYBER,
    title: 'Unpatchable devices are likely within an attacker’s reach',
    detail: 'Where devices cannot be patched, compensating controls such as network segmentation or cloaking can reduce the risk.',
    refs: ['IEC 62443-2-3 Patch management', 'IEC 62443-3-3 FR5 Restricted data flow', 'Essential Eight: Patch operating systems'],
  },
  media: {
    cirmp: CIRMP_CYBER,
    title: 'USB drives and visiting laptops could bring malware in',
    detail: 'Removable media and transient devices are a known way across air gaps, and are best controlled before they connect.',
    refs: ['IEC 62443-3-3 SR 3.2 Malicious code protection', 'SOCI Act: CIRMP'],
  },
  accounts: {
    cirmp: CIRMP_CYBER,
    title: 'Shared or unreviewed accounts weaken accountability',
    detail: 'Each person should have their own login, and old access should be removed, so you know who did what.',
    refs: ['IEC 62443-3-3 SR 1.1 Human user identification and authentication', 'AESCSF: Identity and access management'],
  },
}

export const latest = {
  tag: 'Newer attacks',
  title: 'What about the latest attacks?',
  body: 'OT threats change every month. In your free architecture review, we replay the newest OT attacks we are tracking against a site like yours, and talk through what would most likely stop them.',
  cta: 'Ask us to replay the latest attacks',
  checkbox: 'Replay the latest OT attacks against my site in the review.',
}
