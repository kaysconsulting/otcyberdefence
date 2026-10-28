// All words for Telco SOCI Readiness. Rules: probabilistic wording, Australian English, no em dashes,
// no partner names, "network segmentation", no invented statistics. Legal references to be confirmed by OTCD.
import type { Band, EntryId, FixId, Inputs, Likelihood, ObligationId, ZoneId } from '../engine/types.ts'
import type { PhaseId } from '../engine/fixes.ts'

export const STEP_NAMES = ['Describe your network', 'See your exposure', 'Run an exercise', 'Check your obligations', 'Plan and summary'] as const

export const ZONE_NAMES: Record<ZoneId, string> = {
  corp: 'Corporate and customer systems',
  mgmt: 'Network management',
  core: 'Core network',
  transport: 'Transmission and backbone',
  access: 'Mobile and fixed access',
  li: 'Lawful intercept',
  site: 'Site power and cooling',
}

export const ZONE_SHORT: Record<ZoneId, string> = {
  corp: 'IT',
  mgmt: 'MGMT',
  core: 'CORE',
  transport: 'TRANSPORT',
  access: 'ACCESS',
  li: 'LI',
  site: 'SITE OT',
}

export const ENTRY_NAMES: Record<EntryId, string> = {
  phished_staff: 'A phished or stolen staff login',
  vendor_access: 'A compromised vendor or managed service login',
  edge_exploit: 'An unpatched edge router or VPN appliance',
  exposed_api: 'An exposed customer API or portal',
  site_visit: 'Someone with physical access to a site',
}

export const landing = {
  eyebrow: 'Telco SOCI Readiness',
  title: 'How far could an attack spread through your network, and are you ready for SOCI?',
  sub: 'For carriers and carriage service providers. About five minutes, no network details needed.',
  intro: 'We test five likely ways in: a phished or stolen staff login, a compromised vendor or managed service login, an unpatched edge router or VPN appliance, an exposed customer API or portal, and someone with physical access to a site. Then we show how far each would likely spread, run a real attack as an exercise, and check your answers against SOCI.',
  points: [
    { title: STEP_NAMES[0], text: '14 plain questions, one at a time, about how your network is managed and accessed. No IP addresses or hostnames.', get: 'A model of your network in seven zones' },
    { title: STEP_NAMES[1], text: 'See how far each way in is likely to spread, from customer systems to the core, lawful intercept and site power.', get: 'An exposure score and the likely attack path' },
    { title: STEP_NAMES[2], text: 'Pick a real telco attack and walk through it as a tabletop exercise: the way in, the spread, detection and the reporting clock.', get: 'Questions to run with your team' },
    { title: STEP_NAMES[3], text: 'See which SOCI obligations your answers are likely ready for, including the TSRMP maturity deadlines and the enhanced obligations.', get: 'A readiness view, obligation by obligation' },
    { title: STEP_NAMES[4], text: 'Build a phased plan and download a board summary to share.', get: 'A board summary (PDF) and a free review' },
  ],
  cta: 'Start: describe your network',
}

export const privacyPromise = 'Your answers stay in your browser. Nothing is sent to us unless you ask for the board summary or a review.'
export const disclaimer =
  'This is an indicative model, not an assessment, an exercise or legal advice. Completing it does not meet any SOCI obligation. Results show likely outcomes, not certainties. Confirm which obligations apply to your assets with your advisers and the Cyber and Infrastructure Security Centre.'
export const methodology =
  'Each replay uses the attack\'s known way in and attacker type against the layout you described. The outcome is the likely reach of the attack\'s target, so it changes with your answers.'

type Opt<K extends keyof Inputs> = { value: Inputs[K]; label: string; hint?: string }
export type Question =
  | { id: keyof Inputs; kind: 'choice'; label: string; helper: string; options: Opt<keyof Inputs>[] }
  | { id: 'vendorCount'; kind: 'slider'; label: string; helper: string }
  | { id: 'sharedAccounts'; kind: 'yesno'; label: string; helper: string }

export const groups: { title: string; questions: Question[] }[] = [
  {
    title: 'How your network is laid out',
    questions: [
      { id: 'mgmtSeparation', kind: 'choice', label: 'How is network management separated from corporate IT?', helper: 'Where your OSS, NOC tools and jump hosts sit.', options: [
        { value: 'shared', label: 'Shared', hint: 'Reachable from the corporate network' },
        { value: 'firewalled', label: 'Firewalled', hint: 'Separate network, broad firewall rules' },
        { value: 'dedicated_oob', label: 'Dedicated out-of-band', hint: 'Own network, admins use dedicated workstations' },
      ] },
      { id: 'mgmtSegmentation', kind: 'choice', label: 'Once on the management network, what can an admin session reach?', helper: 'Core, transmission and access equipment.', options: [
        { value: 'flat', label: 'Everything', hint: 'One management network reaches all devices' },
        { value: 'by_domain', label: 'One domain', hint: 'Core, transmission and access are separated' },
        { value: 'per_asset', label: 'Only what is approved', hint: 'Network segmentation per asset' },
      ] },
      { id: 'liIsolation', kind: 'choice', label: 'Where do lawful intercept systems sit?', helper: 'The systems that support interception warrants.', options: [
        { value: 'shared', label: 'On the management network' },
        { value: 'separate', label: 'In their own zone', hint: 'Strict access and alerting' },
      ] },
      { id: 'siteOt', kind: 'choice', label: 'Where do site power, batteries, cooling and building management connect?', helper: 'The operational technology at exchanges, data centres and towers.', options: [
        { value: 'on_corporate', label: 'Corporate network' },
        { value: 'on_management', label: 'Management network' },
        { value: 'isolated', label: 'Their own segment' },
      ] },
    ],
  },
  {
    title: 'Who can log in, and how',
    questions: [
      { id: 'privilegedAuth', kind: 'choice', label: 'How do people sign in, especially admins and vendors?', helper: 'Staff, privileged access to management and network equipment.', options: [
        { value: 'password', label: 'Password only' },
        { value: 'mfa_app', label: 'Password and app or SMS code', hint: 'Can be phished or approved by mistake' },
        { value: 'phishing_resistant', label: 'Phishing-resistant', hint: 'Passwordless, security keys or biometric' },
      ] },
      { id: 'vendorAccess', kind: 'choice', label: 'How do equipment vendors and managed service providers connect?', helper: 'Remote support and outsourced operations.', options: [
        { value: 'always_on', label: 'Always-on access' },
        { value: 'on_request', label: 'On request', hint: 'Approved and time-limited' },
        { value: 'brokered', label: 'Brokered sessions', hint: 'Per session, per asset, recorded' },
      ] },
      { id: 'vendorCount', kind: 'slider', label: 'How many vendors or service providers have remote access?', helper: 'A rough count is fine.' },
      { id: 'sharedAccounts', kind: 'yesno', label: 'Are any admin accounts shared between people?', helper: 'For example, one admin login used by a team or a vendor.' },
    ],
  },
  {
    title: 'What faces the internet',
    questions: [
      { id: 'edgePatching', kind: 'choice', label: 'How up to date are edge routers, firewalls and VPN appliances?', helper: 'Internet-facing network devices.', options: [
        { value: 'behind', label: 'Months behind', hint: 'Or some are end of life' },
        { value: 'mostly', label: 'Mostly patched' },
        { value: 'current', label: 'Patched within weeks', hint: 'Management interfaces not internet-facing' },
      ] },
      { id: 'apiExposure', kind: 'choice', label: 'Do you know every customer API and portal that faces the internet?', helper: 'Including old and test endpoints.', options: [
        { value: 'unknown', label: 'Not fully' },
        { value: 'inventoried', label: 'Listed', hint: 'But not regularly tested' },
        { value: 'tested', label: 'Listed and tested', hint: 'Authentication checked regularly' },
      ] },
    ],
  },
  {
    title: 'How ready your team is',
    questions: [
      { id: 'inventory', kind: 'choice', label: 'How complete is your asset inventory?', helper: 'Network equipment, systems and site OT.', options: [
        { value: 'partial', label: 'Partial' },
        { value: 'mostly', label: 'Mostly complete' },
        { value: 'complete', label: 'Complete and current' },
      ] },
      { id: 'logging', kind: 'choice', label: 'How would you notice unusual activity?', helper: 'Logs and monitoring across IT and the network.', options: [
        { value: 'limited', label: 'Limited logging' },
        { value: 'central', label: 'Central logs', hint: 'Reviewed when something happens' },
        { value: 'monitored', label: 'Monitored around the clock', hint: 'Including network traffic' },
      ] },
      { id: 'irPlan', kind: 'choice', label: 'Do you have a cyber incident response plan for the network?', helper: 'Who decides, who reports, who calls vendors.', options: [
        { value: 'none', label: 'No plan' },
        { value: 'it_only', label: 'An IT plan', hint: 'Not specific to the network, not recently tested' },
        { value: 'tested', label: 'A network plan, tested', hint: 'Exercised in the last 12 months' },
      ] },
      { id: 'changeProcess', kind: 'choice', label: 'Before a major change, such as a new vendor or outsourcing, how do you check whether to notify government?', helper: 'Changes that could affect your security.', options: [
        { value: 'none', label: 'We do not check' },
        { value: 'informal', label: 'Case by case' },
        { value: 'formal', label: 'A set process', hint: 'Part of change approval' },
      ] },
    ],
  },
]

export const notes = {
  unsure: 'Scored as the riskier answer. Finding out is often a quick first step.',
  unsureCount: (n: number) => `${n} answer${n === 1 ? ' is' : 's are'} marked "Not sure" and scored as the riskier option.`,
  vendorRisk: (n: number) => (n === 0 ? 'No vendor remote access' : n >= 26 ? 'A large vendor population' : n >= 11 ? 'Enough that one is likely to be compromised' : 'Each one is another login'),
}

export const attackers = [
  { value: 1 as const, label: 'Criminal gang', hint: 'After data and ransom' },
  { value: 2 as const, label: 'Targeted crew', hint: 'Researches your network' },
  { value: 3 as const, label: 'Nation-state', hint: 'Patient, well resourced' },
]

export const entryText = {
  phished: 'Phishing and stolen passwords are among the most common ways in, so this is likely to work.',
  phishedResistant: 'Phishing-resistant sign-in makes a stolen password far less useful, but a stolen session is still possible.',
  noVendors: 'No vendors connect remotely, so there is no vendor login to steal.',
  vendorBlocked: 'Brokered, phishing-resistant vendor sessions mean a stolen vendor login is very unlikely to work.',
  vendor: (a: Inputs['vendorAccess'], n: number) =>
    a === 'brokered'
      ? 'Brokered sessions limit what a stolen vendor login can do, but a session could still be misused.'
      : `${a === 'always_on' ? 'Always-on' : 'On-request'} vendor access${n >= 11 ? ' across this many vendors' : ''} gives an attacker a login that management trusts.`,
  edgeBehind: 'Edge devices months behind on patches are likely to have known flaws that attackers actively use.',
  edgeMostly: 'Mostly patched edge devices still leave a window, which a targeted attacker could possibly use.',
  edgeCurrentNation: 'Well-patched edge devices leave little to exploit, but a nation-state could use an unknown flaw.',
  edgeCurrent: 'Well-patched edge devices leave this attacker little to exploit.',
  api: {
    unknown: 'An API or portal nobody has listed is unlikely to be tested, so a weakness is likely to be found.',
    inventoried: 'Listed APIs that are not regularly tested could possibly have a weakness.',
    tested: 'Listed and tested APIs make an easy weakness unlikely.',
  } as Record<Inputs['apiExposure'], string>,
  site: 'Unstaffed exchanges and towers are hard to watch, so physical access is possible.',
}

export const why = {
  open: 'nothing separates them',
  filtered: 'broad firewall rules leave paths through',
  controlled: 'a capable attacker could get past this control',
  adminLogin: 'a stolen admin login is accepted here',
  sharedLogin: 'shared admin accounts mean one stolen password works across devices',
  vendorLogin: "the vendor's login is trusted on the equipment it supports",
  oob: 'management sits on a separate out-of-band network',
  liSeparate: 'lawful intercept sits in its own zone',
  siteIsolated: 'site power and cooling sit on their own segment',
  blocked: 'there is no path between them',
  controlledStop: 'a controlled link stops this attacker',
  filteredStop: 'firewall rules stop this attacker',
}

const verb: Record<Likelihood, string> = { likely: 'Likely gets', possible: 'Could possibly get', unlikely: 'Unlikely, but possible, to get' }
export const crossText = (from: ZoneId, to: ZoneId, w: string, l: Likelihood) => `${verb[l]} from ${ZONE_NAMES[from].toLowerCase()} into ${ZONE_NAMES[to].toLowerCase()}, because ${w}.`
export const blockText = (from: ZoneId, to: ZoneId, w: string) => `Likely stopped between ${ZONE_NAMES[from].toLowerCase()} and ${ZONE_NAMES[to].toLowerCase()}, because ${w}.`

export const results = {
  heading: 'Your likely exposure',
  bands: {
    Contained: 'An attack is likely to stay close to where it got in.',
    'Partly exposed': 'An attack could likely reach important parts of the network.',
    'Highly exposed': 'An attack could likely reach much of the network.',
  } as Record<Band, string>,
  state: { hit: 'Likely reached', possible: 'Possibly reached', unlikely: 'Unlikely, but possible', safe: 'Likely safe', blocked: 'Likely stopped here' },
  stateShort: { hit: 'Likely', possible: 'Possibly', unlikely: 'Unlikely', safe: 'Likely safe', blocked: 'Stopped' },
  icon: { hit: '●', possible: '◐', unlikely: '○', safe: '✓', blocked: '✕' },
  tags: { entry: 'Way in', likely: 'Likely', possible: 'Possible', unlikely: 'Unlikely', stopped: 'Stopped', failed: 'Way in fails' },
  worstCase: 'Worst case',
  showPath: 'Show the likely attack path',
  reachHeading: 'What it likely reaches',
  likelihoodNote: 'Likelihood follows the weakest step on the most likely route. A zone shown as possible or unlikely could still be reached.',
  banners: {
    customer: 'Customer data is likely within reach. A breach here is a privacy matter as well as a SOCI one.',
    customerMaybe: 'Customer data could possibly be reached.',
    services: 'The core or transmission network is likely within reach, so services, including Triple Zero calls, could be disrupted.',
    servicesMaybe: 'The core or transmission network could possibly be reached.',
    li: 'Lawful intercept systems are within reach. These are among the most sensitive systems a carrier runs.',
    site: 'Site power and cooling are within reach. Losing them takes equipment offline, whatever the network design.',
  },
  outcome: {
    label: { succeeds: 'Likely succeeds', partly: 'Partly succeeds', stopped: 'Likely stopped' },
    replaying: 'Replaying the attack…',
  },
}

export const areas = {
  heading: 'Your network in three areas',
  sub: 'No carrier fixes everything at once. Each area shows its likely attack surface on its own, so you can see where to start.',
  wholeSite: 'Whole network',
  wholeHint: 'Worst case across every way in',
  level: { high: 'Likely large attack surface', medium: 'Likely moderate attack surface', low: 'Likely small attack surface' },
  list: {
    network: { title: 'Network layout', question: 'Once inside, how far could an attacker likely spread?', ways: 'Tested with an unpatched edge device and physical access to a site.' },
    access: { title: 'Privileged and vendor access', question: 'How easily could someone likely log in as an admin?', ways: 'Tested with a phished or stolen staff login and a compromised vendor login.' },
    exposure: { title: 'Internet-facing systems', question: 'What could an attacker likely find from outside?', ways: 'Tested with an exposed customer API and an unpatched edge device.' },
  },
  alone: (from: number, to: number) =>
    to < from ? `Improving only this area would likely take the whole network from ${from} to ${to}.` : `Improving only this area is unlikely to lower the whole network (${from}), because other ways in would still spread.`,
}

export const answerText: { [K in keyof Inputs]?: Partial<Record<string, string>> } = {
  mgmtSeparation: {
    shared: 'Network management is reachable from corporate IT, so a phished office login is likely to become a network incident.',
    firewalled: 'Management has its own network, but broad firewall rules usually leave a way through for admin logins.',
    dedicated_oob: 'Out-of-band management on dedicated workstations keeps corporate IT incidents away from the network.',
  },
  mgmtSegmentation: {
    flat: 'One management network reaches every device, so one compromised admin session can likely reach the whole network.',
    by_domain: 'Separating core, transmission and access slows an attacker, but each domain is still open once inside.',
    per_asset: 'Per-asset network segmentation means a session can only reach what it was approved for.',
  },
  liIsolation: {
    shared: 'Lawful intercept on the management network can likely be reached by anyone who gets into management.',
    separate: 'Lawful intercept in its own zone is unlikely to be reached from the rest of the network.',
  },
  siteOt: {
    on_corporate: 'Site power and cooling on the corporate network can likely be reached by an ordinary IT attack.',
    on_management: 'Site power and cooling on the management network are reachable by anyone who gets into management.',
    isolated: 'Site power and cooling on their own segment are unlikely to be reached over the network.',
  },
  privilegedAuth: {
    password: 'A single stolen password is likely enough to sign in to network equipment.',
    mfa_app: 'App and SMS codes help, but can be phished or approved by mistake (MFA fatigue).',
    phishing_resistant: 'Phishing-resistant sign-in means a stolen password is very unlikely to work.',
  },
  vendorAccess: {
    always_on: 'Always-on vendor access is a standing way in that an attacker only needs to borrow.',
    on_request: 'On-request access shortens the window, but a stolen vendor login still works while access is open.',
    brokered: 'Brokered, recorded sessions limit a vendor login to the asset it was approved for.',
  },
  edgePatching: {
    behind: 'Edge devices months behind are a common way in. Salt Typhoon mostly used known, unpatched flaws.',
    mostly: 'Mostly patched edge devices still leave a window between a flaw being published and being fixed.',
    current: 'Edge devices patched within weeks leave little for most attackers to use.',
  },
  apiExposure: {
    unknown: 'APIs nobody has listed are unlikely to be tested. An exposed API is how the Optus breach is alleged to have happened.',
    inventoried: 'Listed APIs are a good start, but untested ones could still have a weakness.',
    tested: 'Listed and regularly tested APIs make an easy weakness unlikely.',
  },
}
export const sharedText = {
  yes: 'Shared admin accounts mean one stolen password opens access for everyone using it, and actions cannot be traced to one person.',
  no: 'Personal admin accounts mean every action can be traced to one person.',
}
export const vendorCountText = (n: number) =>
  n >= 26 ? 'This many vendors with remote access make a vendor login one of your most likely ways in.' : n >= 11 ? 'With this many vendors, it is likely at least one login could be compromised.' : n >= 1 ? 'Each vendor with remote access is another login that could be stolen.' : 'No vendors with remote access removes this way in.'

export const exercise = {
  heading: 'Run a real attack as an exercise',
  lead: 'Pick an attack. We replay it against your network one stage at a time, like a tabletop exercise.',
  injects: {
    wayIn: 'The way in',
    spread: 'The spread',
    notice: 'Would you notice?',
    clock: 'The reporting clock',
    respond: 'Your response',
  },
  detect: {
    hours: 'With round-the-clock monitoring, this is likely to be noticed within hours.',
    days: 'This could possibly be noticed within days, if someone is reviewing the logs.',
    late: 'This is unlikely to be noticed until customers or services are affected.',
  },
  stealthy: 'This attacker uses normal admin tools and logins, so it looks like ordinary activity.',
  clock:
    'Once you become aware of a cyber incident, SOCI expects a report within 12 hours if it is having a significant impact on the availability of your asset, or within 72 hours for other relevant impacts.',
  respond: {
    none: 'Without a plan, it is unlikely to be clear who decides, who reports, or who calls the vendors.',
    it_only: 'An IT plan helps, but it may not cover isolating network equipment, vendor coordination or service restoration.',
    tested: 'A tested network plan means the team is likely to know who decides, who reports and who restores.',
  },
  questionsHeading: 'Questions for your team',
  generic: [
    'Who has the authority to isolate network equipment, even if it affects customers?',
    'Who makes the call on whether the 12-hour or 72-hour reporting clock has started?',
    'Which vendors would you need to call, and do you have their out-of-hours contacts?',
  ],
  scenarioQuestions: {
    optus2022: ['Which of your APIs could return customer records, and who last tested them?', 'How quickly could you tell how many customers were affected?'],
    iinet2025: ['Which internal systems can a single staff login reach without a second check?', 'How would you spot one account pulling far more records than usual?'],
    kyivstar: ['If your core and backups were wiped today, what would you restore first, and from where?', 'How would you keep Triple Zero working while you rebuild?'],
    salttyphoon: ['How many edge devices are behind on patches today, and who owns each one?', 'Would you notice a router configuration change made with a valid admin login?'],
    volttyphoon: ['Could someone already be inside, quietly, using normal admin tools? How would you know?', 'What would happen at your exchanges if site power or cooling were switched off remotely?'],
  } as Record<string, string[]>,
  latestNote: 'Attack facts and sources last reviewed',
}

export const obligationText: Record<ObligationId, { title: string; ref: string; asks: string; status: Partial<Record<'ready' | 'partly' | 'gap' | 'check', string>> }> = {
  security: {
    title: 'Security obligation',
    ref: 'SOCI Act Part 2D',
    asks: 'Do your best to protect your networks and facilities from unauthorised access and interference.',
    status: {
      ready: 'Your answers suggest an attack is likely to stay contained.',
      partly: 'An attack could likely reach important parts of the network.',
      gap: 'An attack could likely reach much of the network, which may be hard to reconcile with this obligation.',
    },
  },
  notification: {
    title: 'Notification obligation',
    ref: 'SOCI Act Part 2D',
    asks: 'Tell government before changes that are likely to affect your ability to meet the security obligation, such as new vendors, outsourcing or moving systems offshore.',
    status: {
      ready: 'A set process means notifiable changes are likely to be caught before they happen.',
      partly: 'Case-by-case checks could possibly miss a notifiable change.',
      gap: 'Without a check, a notifiable change is likely to be missed.',
    },
  },
  register: {
    title: 'Register of Critical Infrastructure Assets',
    ref: 'SOCI Act Part 2',
    asks: 'Give government ownership, operation, interest and control information about your assets, and keep it up to date.',
    status: { check: 'This tool does not ask about it. Check your details are current, especially after ownership or vendor changes.' },
  },
  reporting: {
    title: 'Cyber incident reporting',
    ref: 'SOCI Act Part 2B',
    asks: 'Report a cyber incident within 12 hours if it has a significant impact on availability, or within 72 hours for other relevant impacts.',
    status: {
      ready: 'Monitoring and a plan mean you are likely to notice in time and know who reports.',
      partly: 'You could possibly notice in time, but a quiet attack may run for days first.',
      gap: 'With limited logging or no plan, meeting a 12-hour clock is unlikely.',
    },
  },
  riskProgram: {
    title: 'Risk management program and annual report',
    ref: 'SOCI Act Part 2A, TSRMP Rules 2025',
    asks: 'Keep a written program that identifies material risks to your critical telecommunications assets and minimises them as far as reasonably practicable. The annual report applies for the first time in 2026.',
    status: {
      ready: 'A complete inventory and a set change process give your program and annual report something real to stand on.',
      partly: 'Your program is likely to have gaps where the inventory or change process is incomplete.',
      gap: 'A partial inventory makes it unlikely the program covers every material risk, which the annual report would need to attest to.',
    },
  },
  maturity: {
    title: 'Cyber security framework maturity',
    ref: 'SOCI Act Part 2A, TSRMP Rules 2025',
    asks: 'Meet maturity level 1 under your chosen cyber security framework (due by 4 October 2026), and maturity level 2 for critical carrier assets by 4 October 2027.',
    status: { check: 'This tool does not measure framework maturity. If level 1 is not yet met, it is overdue; level 2 work for critical carrier assets usually takes many months.' },
  },
  irPlan: {
    title: 'Incident response plan',
    ref: 'SOCI Act Part 2C',
    asks: 'Have a written cyber security incident response plan for the asset, and keep it up to date.',
    status: {
      ready: 'You have a network-specific plan.',
      partly: 'An IT plan is a start, but it may not cover the network itself.',
      gap: 'There is no plan yet.',
    },
  },
  exercises: {
    title: 'Cyber security exercises',
    ref: 'SOCI Act Part 2C',
    asks: 'When directed, run an exercise that tests your ability to respond to and recover from a cyber incident, and report on it.',
    status: {
      ready: 'Your plan has been tested in the last 12 months.',
      gap: 'Your plan has not been tested recently. The exercise in step 3 is a starting point, not the exercise itself.',
    },
  },
  vulnAssess: {
    title: 'Vulnerability assessments',
    ref: 'SOCI Act Part 2C',
    asks: 'When directed, assess the asset for vulnerabilities and report on it.',
    status: {
      ready: 'Patched edge devices, tested APIs and a complete inventory make an assessment likely to go smoothly.',
      partly: 'An assessment is likely to find gaps in patching, APIs or the inventory.',
      gap: 'Unpatched edge devices, unlisted APIs or a partial inventory are likely to be the first findings.',
    },
  },
  sysInfo: {
    title: 'Access to system information',
    ref: 'SOCI Act Part 2C',
    asks: 'When directed, give government information about the system, which can include periodic or event-based reporting.',
    status: {
      ready: 'Round-the-clock monitoring and a complete inventory mean you are likely able to provide it.',
      partly: 'You could possibly provide it, with some gaps.',
      gap: 'With limited logging or a partial inventory, providing it is unlikely without new work.',
    },
  },
  phishingMfa: {
    title: 'Phishing-resistant MFA for critical systems',
    ref: 'Enhanced CIRMP Rules 2026',
    asks: 'Use phishing-resistant multi-factor authentication for critical systems.',
    status: {
      ready: 'Your sign-in is already phishing-resistant.',
      partly: 'App and SMS codes are multi-factor, but not phishing-resistant.',
      gap: 'Password-only sign-in is well short of this.',
    },
  },
  segregation: {
    title: 'Segregate critical from non-critical systems',
    ref: 'Enhanced CIRMP Rules 2026',
    asks: 'Separate critical systems from non-critical systems such as corporate IT.',
    status: {
      ready: 'Management and site OT sit apart from corporate IT.',
      partly: 'Some separation is in place, but admin paths or site OT still connect to the wider network.',
      gap: 'Management, lawful intercept or site OT shares a network with less critical systems.',
    },
  },
  legacyRisk: {
    title: 'Assess legacy and emerging technology risks',
    ref: 'Enhanced CIRMP Rules 2026',
    asks: 'Assess the risks of legacy systems and novel or emerging technology, including artificial intelligence.',
    status: {
      ready: 'Current patching and a complete inventory make legacy risks visible.',
      partly: 'Some legacy risk is likely unassessed, such as devices behind on patches or missing from the inventory.',
      gap: 'Devices months behind, end of life or missing from the inventory are likely unassessed.',
    },
  },
  logging: {
    title: 'Stronger logging and monitoring',
    ref: 'Cyber Security Strategy, Horizon 2',
    asks: 'Strengthen logging and monitoring for critical infrastructure, a stated target of the Horizon 2 Action Plan.',
    status: {
      ready: 'Round-the-clock monitoring is in place.',
      partly: 'Central logs help, but are only reviewed after something happens.',
      gap: 'Limited logging is likely to fall short of where expectations are heading.',
    },
  },
}

export const obligations = {
  heading: 'Check your SOCI obligations',
  lead: 'Telecommunications security obligations now sit in the SOCI Act. Here is how your answers line up against each one.',
  allTitle: 'For carriers and relevant carriage service providers',
  allSub: 'Relevant carriage service providers include those with more than 20,000 active services, or that supply government. Which obligations apply depends on your assets and the rules; confirm with your advisers.',
  enhancedTitle: 'Enhanced obligations, if you are declared a System of National Significance',
  enhancedSub: 'Declarations are confidential and each obligation only applies when the Secretary of Home Affairs says so in writing. Preparing early is sensible, because getting ready usually takes months.',
  directionTitle: 'Where requirements are heading: the Enhanced CIRMP Rules 2026',
  directionSub:
    'The Enhanced CIRMP Rules commence in 2027 for listed asset classes, including critical energy, water, freight, broadcasting and domain name system assets. Telecommunications assets are not on the list, but carriers are likely to be measured against similar controls. Shown for guidance, not counted.',
  status: { ready: 'Likely ready', partly: 'Partly ready', gap: 'Likely gap', check: 'Check' },
  ready: (n: number, of: number) => `${n} of ${of} assessed obligations look likely ready.`,
  helps: 'Plan steps that help:',
  sourcesTitle: 'Read more',
  sources: [
    { label: 'CISC: TSRMP annual reporting and maturity dates (23 October 2026)', url: 'https://www.cisc.gov.au/news-media/archive/article?itemId=1452' },
    { label: 'CISC: Enhanced security requirements, Enhanced CIRMP Rules 2026', url: 'https://www.cisc.gov.au/news-media/archive/article?itemId=1412' },
    { label: 'CISC: SOCI Act for communications', url: 'https://www.cisc.gov.au/information-for-your-industry/communications/legislation-regulation-and-compliance/soci-act-2018' },
    { label: 'CISC: Systems of National Significance and enhanced obligations', url: 'https://www.cisc.gov.au/resources-subsite/Documents/cisc-factsheet-systems-of-national-significance-enhanced-cyber-security-obligations.pdf' },
    { label: 'CISC: Enhanced obligations guidance, cyber security exercises', url: 'https://www.cisc.gov.au/resources-subsite/Documents/ecso-guidance-cyber-security-exercises.pdf' },
  ],
}

export const fixes: Record<FixId, { name: string; detail: string; disruption: 'None expected' | 'Low' | 'Planned change windows likely' }> = {
  fix_inventory: { name: 'Complete the asset inventory', detail: 'Network equipment, systems, vendors with access and site OT, kept current.', disruption: 'None expected' },
  fix_change: { name: 'Add a notification check to change approval', detail: 'Every major change, new vendor or outsourcing decision is checked against the notification obligation.', disruption: 'None expected' },
  fix_privileged: { name: 'Phishing-resistant sign-in and personal admin accounts', detail: 'Passwordless or security-key sign-in for every admin and vendor, and no shared admin accounts.', disruption: 'Low' },
  fix_ir: { name: 'Write and test a network incident response plan', detail: 'Who decides, who reports within 12 or 72 hours, who calls vendors, and how services are restored. Exercised at least yearly.', disruption: 'None expected' },
  fix_vendor: { name: 'Brokered vendor sessions', detail: 'Vendors connect per session, to one approved asset, with recording. No standing access.', disruption: 'Low' },
  fix_edge: { name: 'Patch and harden edge devices', detail: 'Edge routers, firewalls and VPN appliances patched within weeks, with management interfaces off the internet.', disruption: 'Planned change windows likely' },
  fix_api: { name: 'List and test every customer API', detail: 'A complete list of internet-facing APIs and portals, with authentication tested regularly.', disruption: 'Low' },
  fix_monitor: { name: 'Round-the-clock monitoring', detail: 'Central logs from IT, management and the network, watched around the clock, so the reporting clock can be met.', disruption: 'None expected' },
  fix_mgmt_sep: { name: 'Dedicated out-of-band management', detail: 'Management on its own network, reached only from dedicated admin workstations.', disruption: 'Planned change windows likely' },
  fix_segment: { name: 'Network segmentation of the management network', detail: 'Per-asset network segmentation, so an admin session reaches only what it was approved for.', disruption: 'Low' },
  fix_li: { name: 'Isolate lawful intercept', detail: 'Lawful intercept in its own zone, with strict access and alerting.', disruption: 'Planned change windows likely' },
  fix_site: { name: 'Segment site power and cooling', detail: 'Power, batteries, cooling and building management at exchanges and data centres on their own segment.', disruption: 'Low' },
}

export const phases: Record<PhaseId, { title: string; when: string; intro: string; notes?: string[] }> = {
  know: { title: 'Know what you have', when: 'Often the first 1 to 2 months', intro: 'Plans built on an old diagram usually miss a path. Start with the inventory and the change process.' },
  quick: { title: 'Quick wins with little or no downtime', when: 'Often within the first 1 to 3 months', intro: 'Changes to sign-in, accounts and the response plan usually need no outage.' },
  access: { title: 'Close the ways in', when: 'Often 2 to 6 months', intro: 'Vendor access, edge devices and APIs are where most telco attacks start.' },
  segment: { title: 'Network segmentation, zone by zone', when: 'Often 3 to 12 months, staged through change windows', intro: 'Separate management, lawful intercept and site OT in stages, starting with the highest-consequence zones.' },
  keep: {
    title: 'Keep it working',
    when: 'Ongoing',
    intro: 'Controls drift. Keeping them effective is part of the program.',
    notes: ['Exercise the response plan at least once a year', 'Review vendor access, admin accounts and network segmentation policy on a schedule', 'Re-run this check after major changes, and keep evidence for your risk management program'],
  },
}

export const plan = {
  heading: 'Plan it step by step',
  lead: 'We have added the two steps likely to help most. Go phase by phase and add more.',
  topHeading: 'Your top three fixes',
  topSub: 'Ranked by how much each would likely lower your exposure on its own. The top two are added to your plan to start with.',
  add: 'Add to my plan',
  added: 'In my plan',
  inPlace: 'Already in place',
  today: 'Today',
  withPlan: 'With your plan',
  timeframes: 'Timeframes are indicative and depend on change windows, vendors and the size of the network.',
}

export const summary = {
  title: 'Your board summary (PDF)',
  sub: 'One page for your board or executive: your exposure, an exercise outcome, your obligations and your plan.',
  consent: 'We will send your result to OTCD so an engineer can follow up. We will not add you to a mailing list.',
  thanks: 'Your summary is ready. Use your browser\'s print dialog and choose "Save as PDF".',
}

export const offer = {
  title: 'Book a free 30-minute SOCI readiness review',
  sub: 'An OTCD engineer will walk through your result, your obligations and practical first steps. No obligation.',
  roles: ['Network engineer or architect', 'Security', 'Risk and compliance', 'Executive', 'Other'],
  types: ['Carrier', 'Carriage service provider', 'Other'],
  states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
  includeSettings: 'Include my answers so OTCD can prepare for the review.',
  consent: 'We will use your details to arrange the review and nothing else.',
  thanks: 'Thanks. An OTCD engineer will be in touch within one business day.',
}
