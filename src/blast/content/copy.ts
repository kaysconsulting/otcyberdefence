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
    'See how far an attacker gets, step by step, with the reason for each step',
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

// Entry reasons
export const entryReason = {
  phished: 'A phishing email worked and the attacker is logged in as an IT user.',
  remotePassword: 'The VPN only needs a password, so a stolen password is enough to get in.',
  remoteMfaShared: 'VPN credential worked: the account is shared, so MFA was approved by someone else.',
  remoteMfaDormant: 'VPN credential worked: an old account that nobody reviews was still active.',
  remoteMfaFail: 'The stolen VPN password was not enough: MFA blocked the login and accounts are personal and reviewed.',
  jumpboxShared: 'The jump box login is shared, so a stolen password opens it.',
  jumpboxFail: 'The jump box needs a personal login, so the stolen credential did not work.',
  zeroTrustFail: 'There is no password to steal: zero trust remote access uses passwordless biometric MFA tied to one person and one asset.',
  usbIn: 'Nothing checks USB drives or visiting laptops, so the malware reached the engineering workstation.',
  usbBlocked: 'USB drives and visiting laptops are controlled, so the infected media never reached the plant.',
  update: 'A trusted software update carried the malware in. Supply chain attacks land wherever the software is installed.',
  remoteLandsL3: 'The VPN puts the session on the site network, where it can see everything the VPN routes to.',
  remoteLandsL35: 'The jump box sits in the industrial DMZ, so the session starts there.',
  jumpboxNoDmz: 'Without an industrial DMZ, the jump box sits on the site network itself.',
}

const S = STRENGTH_NAMES
export const crossReason = (from: ZoneId, to: ZoneId, strength: number, why: string) =>
  `Crossed from ${ZONE_NAMES[from].toLowerCase()} to ${ZONE_NAMES[to].toLowerCase()}: ${why} (${S[strength]} conduit).`
export const blockReason = (from: ZoneId, to: ZoneId, why: string) =>
  `Stopped between ${ZONE_NAMES[from].toLowerCase()} and ${ZONE_NAMES[to].toLowerCase()}: ${why}`

export const why = {
  open: 'nothing separates them, so traffic flows freely',
  vlanBroad: 'VLAN rules allow broad traffic between them',
  filteredWeak: 'the firewall rules leave paths a capable attacker can use',
  controlledBeaten: 'a nation-state level attacker found a way through the controls',
  legacy: 'unpatched services on a legacy device made the pivot easier',
  allowedFlow: 'the engineering workstation is allowed to program the PLCs, and the attacker rode that trusted traffic',
  blocked: 'there is no network path between these zones.',
  controlled: 'the conduit only allows specific, authorised traffic.',
  sisDedicated: 'safety systems sit in their own zone with no routed path in.',
  airgap: 'the IT side has no network path into OT, so network-based attacks stop here.',
  cloaked: 'the OT devices are cloaked, so the attacker cannot find anything to connect to.',
  filtered: 'the firewall rules held against this attacker.',
}

export const spreadReason = {
  open: (z: ZoneId) => `Spread across ${ZONE_NAMES[z].toLowerCase()}: nothing separates the devices inside this zone.`,
  restricted: (z: ZoneId) => `Held to one device in ${ZONE_NAMES[z].toLowerCase()}: network segmentation separates each asset.`,
}

export const scenarioReason = {
  intertwined: 'IT and OT are too intertwined to isolate one without stopping the other.',
  separable: 'IT and OT can be separated, so operations could keep running while IT recovered.',
  reached: (z: ZoneId) => `The attacker reached ${ZONE_NAMES[z].toLowerCase()}.`,
  spread: 'The malware spread beyond where it landed.',
  contained: 'The malware stayed where it landed and could not spread.',
}

export const results = {
  eyebrow: 'Your blast radius',
  bands: {
    Contained: 'An attacker gets a foothold but cannot go far.',
    'Partly exposed': 'An attacker reaches part of operations before being stopped.',
    'Highly exposed': 'An attacker can reach most of operations, including control systems.',
  },
  sisBanner: 'Safety systems reached. An attacker could interfere with the systems that protect people and plant.',
  l1Banner: 'An attacker could change control logic.',
  showPath: 'Show the attack path',
  worstCase: 'Worst case across all entry points',
}

export const fixes = {
  fix_remote: 'Replace VPNs with zero trust secure remote access',
  fix_segment_overlay: 'Network segmentation as an overlay (OTCD)',
  fix_cloak: 'Cloak OT devices from scanning',
  fix_media: 'Control USB drives and visiting laptops',
  fix_accounts: 'Remove shared and dormant accounts',
}

export const tradeoffs: [string, string, string][] = [
  ['Planned downtime', 'Usually needs outage windows', 'Designed to deploy without downtime'],
  ['Re-IP of devices', 'Often required', 'Not required'],
  ['Changes to PLC/HMI config', 'Sometimes', 'None expected'],
  ['Time to first protected zone', 'Longer (design, change approvals, outages)', 'Shorter (start with highest-risk assets)'],
  ['Protects legacy devices', 'Only if they can be moved or patched', 'Yes, wraps unpatchable devices'],
  ['Ongoing effort', 'Firewall rule management', 'Policy managed centrally'],
  ['Honest downsides', 'Proven, familiar to IT teams', 'New platform for the team to learn; needs OT-aware design to get policies right'],
]

export const offer = {
  title: 'Book a free 30-minute architecture review',
  sub: 'An OTCD engineer will walk through your result with you and talk through practical first steps. No obligation.',
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
  'OT Blast Radius is an illustrative planning tool. It uses simplified, generic models and is not a security assessment of your site. Real exposure depends on your specific architecture, configuration and controls. For an assessment of your environment, talk to OT Cyber Defence.'
