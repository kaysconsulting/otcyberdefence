// Copy for the three areas and the step-by-step plan. Same rules as copy.ts:
// probabilistic wording, Australian English, no em dashes, no partner names, "network segmentation".
import type { AreaId, FixId } from '../engine/types.ts'

export type Lens = 'engineer' | 'architect' | 'security'

/** "What good looks like": shown once a plan includes network segmentation and cloaking. Figures as published; source deliberately unnamed. */
export const goodStory = {
  tag: 'What good looks like',
  title: 'One segmented, cloaked line kept running',
  body: 'In a published manufacturing case study, an attack halted a plant for over two days and cost US$4.8 million. The one line that was segmented and cloaked kept running with no downtime.',
}

export const lenses: { value: Lens; label: string; hint: string }[] = [
  { value: 'engineer', label: 'OT engineer', hint: 'Uptime, plant safety, outages and testing' },
  { value: 'architect', label: 'Head architect', hint: 'Zones, conduits, design and sequencing' },
  { value: 'security', label: 'Security lead', hint: 'Risk, compliance, monitoring and evidence' },
]

export const areas: Record<AreaId, { title: string; question: string; ways: string }> = {
  network: {
    title: 'Network layout',
    question: 'Once inside, how far could an attacker likely spread?',
    ways: 'Tested with a phished IT login and a poisoned software update.',
  },
  remote: {
    title: 'Remote access',
    question: 'How easily could someone likely log in from outside?',
    ways: 'Tested with a stolen remote access login and a compromised vendor account.',
  },
  devices: {
    title: 'Devices and media',
    question: 'What could likely be carried in, or changed once inside?',
    ways: 'Tested with an infected USB stick or visiting laptop.',
  },
}

export const areaLevel = {
  high: 'Likely large attack surface',
  medium: 'Likely moderate attack surface',
  low: 'Likely small attack surface',
}

export const areaText = {
  heading: 'Your site in three areas',
  sub: 'No site fixes everything at once. Each area below shows its likely attack surface on its own, so you can see where to start.',
  wholeSite: 'Whole site',
  wholeSiteHint: 'Worst case across every way in',
  issues: 'What is likely driving it',
  strengths: 'What is likely helping',
  alone: (from: number, to: number) =>
    to < from ? `Improving only this area would likely take the whole site from ${from} to ${to}` : `Improving only this area is unlikely to lower the whole site (${from}), because other ways in would still spread.`,
  showArea: 'Show detail',
  surface: 'Area score',
}

/** The sentence shown for each answer (Ronald's answer table). `good` marks answers that are helping. */
export const answerText = {
  architecture: {
    flat: 'Your IT and OT share one network, so an attacker who gets in anywhere can likely reach everything, including control systems.',
    vlans: 'VLANs separate traffic, but broad firewall rules usually let an attacker move between them with little resistance.',
    purdue_dmz: 'Purdue levels and a DMZ slow an attacker down, but once inside a level they can usually reach every device in it.',
    microsegmented: 'Each asset sits in its own segment, so one compromised device is unlikely to lead to the next.',
  },
  itOtLink: {
    direct: 'IT can route straight into OT, so a phished office login is likely to become an OT incident.',
    via_dmz: 'Traffic between IT and OT has to pass through a DMZ, which is the right design. Its strength depends on its firewall rules.',
    airgap_claimed: 'No network link to IT protects you from network attacks, but USB drives and visiting laptops can still cross the gap.',
  },
  sisZone: {
    shared: 'Your safety systems share a network with control, so an attacker who reaches control can likely reach the systems that protect people and plant.',
    dedicated: 'Safety systems sit in their own zone, which keeps them out of reach of most attacks on control.',
  },
  visibility: {
    visible: 'Your PLCs, HMIs and SCADA answer a network scan, so an attacker on the network can likely map and target them quickly.',
    cloaked: 'Your OT devices are hidden from scanning, so an attacker is unlikely to find much to target.',
  },
  remoteAccess: {
    none: 'Nobody connects from outside, so there is no remote login to steal.',
    vpn_password: 'A single stolen password is likely enough to get into your OT network. This was the way in at Colonial Pipeline.',
    vpn_mfa: 'MFA helps, but app and SMS codes can be phished or approved by mistake (MFA fatigue).',
    jumpbox: 'A jump box limits where sessions land, but anyone who reaches it can usually reach everything it connects to.',
    zero_trust_biometric: 'Passwordless, per-asset access means a stolen login is very unlikely to work, and a session can only reach the asset it was approved for.',
  },
  vendors: (n: number) =>
    n >= 26
      ? 'This many vendor accounts make a vendor compromise one of your most likely ways in.'
      : n >= 11
        ? 'With this many vendor accounts, it is likely at least one could be compromised.'
        : n >= 3
          ? 'Each vendor account is another login that could be stolen.'
          : 'A small number of vendors with remote access keeps this risk manageable.',
  sharedAccounts: {
    yes: 'Shared logins make it hard to know who did what, and one leaked password opens access for everyone using it.',
    no: 'Personal logins mean every action can be traced to one person.',
  },
  dormantAccounts: {
    rarely: 'Forgotten accounts from past staff and vendors are a common way in.',
    regularly: 'Regular reviews close forgotten ways in.',
  },
  legacy: {
    none: 'Patched devices make it harder to move from one device to the next.',
    some: "Some devices can't be patched, so an attacker who reaches them can likely exploit known weaknesses.",
    many: 'Many unpatchable devices mean known exploits will likely work across much of your site.',
  },
  sisKeySwitch: {
    program:
      "Safety controller logic could be changed remotely if an attacker reaches it. Triton's investigators advise never leaving the key in program mode outside planned changes.",
    run: "Keeping the key in run means safety logic is unlikely to be changed over the network, even if an attacker reaches it.",
  },
  removableMedia: {
    uncontrolled: 'Nothing checks USB drives or visiting laptops, so malware can likely be carried straight onto engineering workstations. This was the Stuxnet lesson.',
    controlled: 'Scanning USB drives and visiting laptops before they connect closes a common way across air gaps.',
  },
}

export type Phase = {
  id: string
  title: string
  when: string
  intro: string
  fixes: FixId[]
  /** Informational phases have no on/off steps. */
  notes?: string[]
}

export const planText = {
  heading: 'Plan it step by step',
  lead: 'Real programs run over months, not clicks. This is the order an experienced OT team would likely take, with your site in mind. Add steps to your plan one at a time and watch the likely result change.',
  viewAs: 'View as:',
  timeline: 'Your likely progress',
  today: 'Today',
  after: (n: number) => `After phase ${n}`,
  add: 'Add to my plan',
  added: 'In my plan',
  inPlace: 'Already in place on your site',
  disruption: 'Disruption',
  when: 'Typical timeframe (indicative)',
  helps: 'Helps with:',
  nothingYet: 'Add steps to see how the likely result changes.',
  withPlan: 'With your plan',
  orderNote:
    'Remote access and network segmentation are ordered by which is likely to lower your worst case more. Timeframes are indicative and depend on outage windows, approvals and the size of the site.',
}

export const phases: Phase[] = [
  {
    id: 'know',
    title: 'Know what you have',
    when: 'Often the first 4 to 8 weeks',
    intro: 'Every good program starts by confirming what is really there. Plans built on an old diagram usually miss a path.',
    fixes: [],
    notes: [
      'Confirm the asset inventory, including devices that cannot be patched',
      'Map every conduit and every way in: remote access, vendors, software updates, USB and visiting laptops',
      'Agree the risk picture with operations and record it against your CIRMP',
    ],
  },
  {
    id: 'quick',
    title: 'Quick wins with little or no downtime',
    when: 'Often within the first 1 to 3 months',
    intro: 'Changes to accounts and procedures usually need no outage and can start straight away.',
    fixes: ['fix_accounts', 'fix_keyswitch', 'fix_media'],
  },
  {
    id: 'remote',
    title: 'Secure remote and vendor access',
    when: 'Often 2 to 4 months',
    intro: 'Remote access is one of the most common ways into OT. Closing it down is usually a contained project.',
    fixes: ['fix_remote'],
  },
  {
    id: 'segment',
    title: 'Network segmentation, zone by zone',
    when: 'Often 3 to 12 months, staged through outage windows',
    intro: 'Segmentation is usually done in stages, starting with the boundary and the highest-consequence zones.',
    fixes: ['fix_itot_dmz', 'fix_sis_zone', 'fix_segment_overlay', 'fix_cloak'],
  },
  {
    id: 'keep',
    title: 'Keep it working',
    when: 'Ongoing',
    intro: 'Controls drift over time. Keeping them effective is part of the program, not an afterthought.',
    fixes: [],
    notes: [
      'Monitor OT traffic so unusual movement between zones is likely to be noticed',
      'Review accounts, vendor access and firewall or segmentation policy on a schedule',
      'Re-run this check after major changes, and keep evidence for your annual CIRMP attestation',
    ],
  },
]

export const steps: Record<FixId, { disruption: 'None expected' | 'Low' | 'Planned outage windows likely'; lens: Record<Lens, string> }> = {
  fix_accounts: {
    disruption: 'None expected',
    lens: {
      engineer: 'Give each person and vendor their own login. Agree a fallback for night shift and call-outs first, so nobody is locked out.',
      architect: 'Tie accounts to roles and the assets each role needs. This sets up per-asset access later.',
      security: 'Personal, reviewed accounts give an audit trail and remove old access attackers often reuse.',
    },
  },
  fix_keyswitch: {
    disruption: 'None expected',
    lens: {
      engineer: 'Keep safety controllers in run, and move to program only under a permit to work. It is a procedure change, not a network change.',
      architect: 'A physical control that holds even if the safety network is reached. Cheap insurance while segmentation is in progress.',
      security: 'Likely to stop safety logic being changed remotely, the outcome Triton was built for.',
    },
  },
  fix_media: {
    disruption: 'Low',
    lens: {
      engineer: 'Set up a scanning station and approved drives. Plan how vendors bring in laptops before enforcing it.',
      architect: 'Covers the way in that network controls do not see.',
      security: 'Stuxnet crossed an air gap on removable media. Control here is likely to close that path.',
    },
  },
  fix_remote: {
    disruption: 'Low',
    lens: {
      engineer: 'Move vendors and staff one at a time, keeping the old path until each one is confirmed working.',
      architect: 'Replace broad VPN access with per-person, per-asset sessions. Remote access then lands on one asset, not a network.',
      security: 'Passwordless biometric MFA is likely to stop stolen and phished logins, the way in behind Colonial Pipeline.',
    },
  },
  fix_itot_dmz: {
    disruption: 'Planned outage windows likely',
    lens: {
      engineer: 'Moving data flows like historians and patching into a DMZ usually needs testing and a few short outages.',
      architect: 'The first real boundary: nothing routes straight from IT to OT. Everything goes through the DMZ.',
      security: 'Likely to keep an IT incident, like ransomware, out of operations.',
    },
  },
  fix_sis_zone: {
    disruption: 'Planned outage windows likely',
    lens: {
      engineer: 'Safety systems are usually changed only at planned shutdowns. Line this up with the next one.',
      architect: 'Give the highest-consequence systems their own zone, with only the flows they need.',
      security: 'Puts a strong control in front of the systems that protect people and plant.',
    },
  },
  fix_segment_overlay: {
    disruption: 'Low',
    lens: {
      engineer: 'An overlay is designed to avoid re-IP and PLC changes. Start with the highest-risk cell, prove it, then roll out.',
      architect: 'Per-asset network segmentation across supervisory and control, so one compromised device stays one device.',
      security: 'Likely to stop spread inside zones, and protects devices that cannot be patched.',
    },
  },
  fix_cloak: {
    disruption: 'Low',
    lens: {
      engineer: 'Hidden devices still talk to the systems they should. Confirm vendor tools are on the allowed list first.',
      architect: 'Removes devices from view, so an attacker likely cannot map what is there.',
      security: 'Makes reconnaissance much harder and is likely to slow a capable attacker down.',
    },
  },
}
