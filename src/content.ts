// All site copy lives here so text edits don't require touching layout code.

export const navLinks = [
  { href: '/consulting', label: 'Consulting' },
  { href: '/protection', label: 'Protection' },
  { href: '/case-studies', label: 'Case studies' },
  { href: '/sectors', label: 'Sectors' },
  { href: '/expertise', label: 'Expertise' },
]

export const pillars = [
  {
    num: '01',
    href: '#consulting',
    title: 'OT Cyber Consulting',
    body: 'SOCI, AESCSF, IEC 62443 and NIST CSF. Risk, governance and compliance delivered by people who understand operational technology.',
    go: 'Governance, risk & compliance',
  },
  {
    num: '02',
    href: '#protection',
    title: 'OT Cyber Protection',
    body: 'Official Australian partner of BlastWave. Its patented BlastShield™ platform makes critical assets invisible to attackers, with passwordless access and microsegmentation, and no downtime.',
    go: 'Patented zero trust technology',
  },
]

export const stats = [
  { value: '18+', label: 'Years securing OT and ICS in critical infrastructure' },
  { value: '500M+', sup: '*', label: 'Device hours of attack prevention by BlastShield™' },
  { value: 'IEC 62443', label: 'ISA/IEC 62443 Approved Instructor on our team' },
  { value: 'Patented', sup: '*', label: 'Zero trust OT platform, deployed without downtime' },
]

export type IconName =
  | 'shieldCheck'
  | 'gauge'
  | 'activity'
  | 'network'
  | 'presentation'
  | 'siren'
  | 'eyeOff'
  | 'fingerprint'
  | 'layoutGrid'
  | 'screenShare'
  | 'train'
  | 'hardHat'
  | 'clipboardCheck'
  | 'fileSearch'
  | 'wrench'
  | 'cable'

export const consultingServices: {
  icon: IconName
  tag: string
  title: string
  body: string
  points?: string[]
}[] = [
  {
    icon: 'shieldCheck',
    tag: 'SOCI Act',
    title: 'Critical infrastructure compliance',
    body: 'End-to-end support for obligations under the Security of Critical Infrastructure Act 2018.',
    points: [
      'CIRMP development and uplift',
      'Annual board-approved reporting',
      'Cyber incident reporting readiness',
      'Register of Critical Infrastructure Assets',
    ],
  },
  {
    icon: 'gauge',
    tag: 'Assessment',
    title: 'Framework maturity assessments',
    body: 'Independent, evidence-based assessment against the framework that fits your sector and regulator.',
    points: [
      'AESCSF maturity assessments',
      'IEC 62443 zone and conduit reviews',
      'NIST CSF 2.0 gap analysis',
      'Target-state roadmaps',
    ],
  },
  {
    icon: 'activity',
    tag: 'Risk',
    title: 'OT risk management',
    body: 'Cyber risk expressed in operational terms: safety, availability and production, not just data.',
    points: [
      'OT cyber risk assessments',
      'Asset visibility and criticality',
      'Third-party and supply chain risk',
      'Risk registers and treatment plans',
    ],
  },
  {
    icon: 'network',
    tag: 'Architecture',
    title: 'ICS & SCADA segmentation design',
    body: 'Purdue-model reference architectures, zones and conduits, and secure remote access designs.',
  },
  {
    icon: 'presentation',
    tag: 'Strategy',
    title: 'OT cyber strategy & board advisory',
    body: 'Executive briefings, investment prioritisation and multi-year programs that tie spend to risk reduction.',
  },
  {
    icon: 'siren',
    tag: 'Resilience',
    title: 'Incident response readiness',
    body: 'OT-specific response plans, playbooks and tabletop exercises aligned to SOCI reporting timeframes.',
  },
]

export const sociObligations = [
  'Register critical infrastructure assets and keep ownership and operational information current',
  'Report significant cyber incidents to the ACSC within tight statutory timeframes',
  'Adopt, maintain and comply with a written CIRMP, including a recognised cyber framework',
  'Submit an annual CIRMP report approved by the board or governing body',
]

export const frameworks = [
  'SOCI Act 2018',
  'AESCSF',
  'IEC 62443',
  'NIST CSF 2.0',
  'ISO/IEC 27001',
  'Essential Eight',
  'C2M2',
]

export const protectionFeatures: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'eyeOff',
    title: 'Network cloaking',
    body: 'HMIs, PLCs and RTUs become invisible to scanners and attackers, stopping reconnaissance, the first step in every OT attack chain.',
  },
  {
    icon: 'fingerprint',
    title: 'Passwordless MFA',
    body: 'Identity-based access with biometric authentication removes stolen and shared passwords from the equation.',
  },
  {
    icon: 'layoutGrid',
    title: 'Microsegmentation',
    body: 'Software-defined segments contain any breach and stop lateral movement, without complex firewall rule sets.',
  },
  {
    icon: 'screenShare',
    title: 'Secure remote access',
    body: 'Replace legacy VPNs and jump boxes with zero trust access and recorded sessions for vendors and engineers.',
  },
]

// BlastWave, Inc. facts — each one verified on blastwave.com (Sept 2026). Keep attributed.
export const partner = {
  name: 'BlastWave, Inc.',
  product: 'BlastShield™',
  facts: [
    { k: 'Headquarters', v: 'Mountain View, California, USA' },
    { k: 'Founders', v: 'Former executives and technologists from Apple and Cisco' },
    { k: 'Technology', v: 'Patented peer-to-peer zero trust stack: passwordless MFA, encrypted connectivity and built-in microsegmentation' },
    { k: 'Track record', v: '500 million+ device hours of cyberattack prevention' },
  ],
  components: [
    { name: 'Security Gateway', body: 'Software gateway deployed as a VM, container or appliance in front of OT assets.' },
    { name: 'Orchestrator', body: 'Central, real-time policy enforcement, on premises or in the cloud.' },
    { name: 'Authenticator', body: 'Passwordless, phishing-resistant MFA using on-device biometrics.' },
    { name: 'Client & Agent', body: 'Verified connections for Windows, macOS and Linux users and servers.' },
    { name: 'BlastAccess', body: 'Secure remote desktop for vendors and engineers, with session recording.' },
  ],
  standards: ['IEC 62443', 'NERC CIP', 'TSA Security Directives', 'DoD OT Zero Trust', 'NIS2', 'EU Cyber Resilience Act', 'CMMC Level 2'],
  // Named on blastwave.com (company page and customer logo wall). These are BlastWave customers.
  customers: [
    'U.S. Air Force',
    'Berkshire Hathaway Energy',
    'NTT',
    'CBRE',
    'City of Columbus',
    'Schweitzer Engineering Laboratories',
    'Lineage Logistics',
    'CoreWeave',
    'Diamondback Energy',
    'CDM Smith',
    'City of Fort Collins',
    'City of Daytona Beach',
  ],
}

export const testimonials = [
  {
    quote: 'I couldn’t believe how easy it was to install. We configured 97 devices into 95 individual segments in four hours.',
    who: 'BlastShield™ customer',
    source: 'Published on blastwave.com',
    big: '4 hrs',
    bigSub: '97 devices · 95 segments',
  },
  {
    quote: 'The security of our data and our customers’ data is our highest priority … BlastShield filled both these needs for us with their patented solution.',
    who: 'Emil Erlandsson, Vice President of Professional Services, A2i',
    source: 'BlastWave case study',
  },
  {
    quote: 'BlastShield truly works. In test after test, I was unsuccessful at circumventing its passwordless MFA login for remote access as well as break outside the software-defined microsegmentation to pivot around inside the network.',
    who: 'Alissa Knight, former CISO and security researcher',
    source: 'Independent testing, BlastWave case study',
  },
]

// From BlastWave's published case studies (blastwave.com/documents#CaseStudy). BlastWave deployments.
const CS = 'https://go.blastwave.com/hubfs/DOWNLOADS/Case-Study/'
export const caseStudies = [
  {
    tag: 'Oil & Gas',
    title: 'Hundreds of remote sites secured through an acquisition',
    body: 'A major North American energy producer placed a software-defined overlay across hundreds of remote sites. Overlapping IP schemes stopped being a problem, and trips to site for routine changes largely ended.',
    result: 'Segmentation scaled from 5,000 to 20,000 devices in under a month',
    href: CS + 'BlastWave-Oil-Gas-Case-Study.pdf',
  },
  {
    tag: 'Manufacturing',
    title: 'One protected line kept running through a cyber attack',
    body: 'An attack spread across a plant’s tightly coupled IT and OT networks and halted production for more than two days. The one line protected by BlastShield kept running. Management then extended it across the whole network.',
    result: 'Zero downtime on the protected line; US$4.8M lost elsewhere',
    href: CS + 'BlastWaves-Manufacturing-Case-Study.pdf',
  },
  {
    tag: 'Critical infrastructure',
    title: 'Hazardous ammonia refrigeration systems protected',
    body: 'A leading cold-chain logistics operator used BlastShield to cloak the legacy, unpatchable Windows controllers running ammonia refrigeration across its facilities, replacing exposed remote-access tools.',
    result: 'Two months of testing without a single outage',
    href: CS + 'BlastWave-Protecting-Critical-Assets-Case-Study.pdf',
  },
  {
    tag: 'Technology',
    title: 'Legacy VPN replaced with zero trust access',
    body: 'A2i, an artificial intelligence company, replaced an unstable hardware VPN with BlastShield zero trust access to its cloud and on-premise services, with no passwords to phish.',
    result: 'Two-continent network live in 10 minutes',
    href: CS + 'VPN-Alternative-Case-Study.pdf',
  },
]

export const approachSteps = [
  {
    step: 'Step 1 · Assess',
    title: 'Know where you stand',
    body: 'Map your assets and SOCI obligations, and baseline maturity against AESCSF, IEC 62443 or NIST CSF.',
  },
  {
    step: 'Step 2 · Protect',
    title: 'Close the highest-risk gaps fast',
    body: 'Deploy cloaking, passwordless access and segmentation, prioritised by the risk assessment, with no downtime.',
  },
  {
    step: 'Step 3 · Prove',
    title: 'Evidence for the board and regulator',
    body: 'Map every control back to your CIRMP and framework, ready for annual attestation and audit.',
  },
]

export const lifecycle = [
  { label: 'Assess', body: 'Risk, maturity and asset visibility' },
  { label: 'Design', body: 'Zones, conduits and target architecture' },
  { label: 'Implement', body: 'Controls deployed without disrupting operations' },
  { label: 'Sustain', body: 'Monitoring, reporting and continuous uplift' },
]

export const industries = [
  { name: 'Rail & Transport', detail: 'Signalling, traction power, tunnels, stations' },
  { name: 'Aviation & Airports', detail: 'Baggage handling, airfield lighting, HVAC, fuel systems' },
  { name: 'Energy & Electricity', detail: 'Generation, transmission, distribution, BESS' },
  { name: 'Water & Wastewater', detail: 'Treatment plants, pump stations, telemetry' },
  { name: 'Oil & Gas', detail: 'Upstream, pipelines, terminals' },
  { name: 'Ports & Maritime', detail: 'Cranes, terminal operations, traffic management' },
  { name: 'Mining & Resources', detail: 'Remote and autonomous operations' },
  { name: 'Government & Defence', detail: 'Facilities and building management' },
]

// Team capability — drawn from our practitioners' qualifications and experience (Sept 2026).
// Past organisations describe where the experience was gained, not OT Cyber Defence client engagements.
export const expertise = {
  intro:
    'Our practitioners bring more than 18 years of hands-on OT and ICS security across transport, energy and renewables, water, mining, utilities and defence. We apply IEC 62443, NIST SP 800-82 and ISO/IEC 27001 alongside functional safety standards, in environments where a failure puts safety and essential services at risk.',
  highlights: [
    {
      icon: 'train' as IconName,
      title: 'Major transport programs',
      body: 'Senior OT cybersecurity authority on major Transport for NSW programs, accountable for governance, assurance and formal sign-off across safety-critical rail and transport systems.',
    },
    {
      icon: 'hardHat' as IconName,
      title: 'Cyber and functional safety, together',
      body: 'IEC 62443 integrated with IEC 61508 and EN 50126. We add the cyber view to HAZOP and safety cases, so cyber-induced failure modes are captured in the safety risk framework.',
    },
    {
      icon: 'clipboardCheck' as IconName,
      title: 'IEC 62443 and AESCSF programs',
      body: 'Zone and conduit design, security level verification, IEC 62443-3-2 risk assessments and AESCSF maturity assessments across rail, water, power, gas, solar and oil & gas.',
    },
    {
      icon: 'fileSearch' as IconName,
      title: 'Vendor and integrator assurance',
      body: 'Review of vendor Cybersecurity Management Plans and integrator designs, OT security requirements for RFTs, and FAT/SAT evidence validated before acceptance.',
    },
    {
      icon: 'wrench' as IconName,
      title: 'Design, commissioning and delivery',
      body: 'Secure OT architectures designed, tested and commissioned in live operational environments, including SCADA, PLC and BMS delivery on major international infrastructure projects.',
    },
    {
      icon: 'cable' as IconName,
      title: 'Industrial networks from the ground up',
      body: 'Resilient, segmented OT/IT networks and SCADA operations across geographically dispersed mining and refinery sites.',
    },
  ],
  credentials: [
    'ISA/IEC 62443 Approved Instructor',
    'ISA/IEC 62443 Risk Assessment Specialist',
    'ISA/IEC 62443 Fundamentals Specialist',
    'ISO/IEC 27001 Lead Auditor',
    'ISO 9001 Quality Management System Auditor',
    'CCNP Enterprise · CCNA Cyber Ops',
    'NSW Class 2C Security Licence',
    'MBA (Information Systems) · BSc (Hons) Computer Science',
  ],
  standards: ['IEC 62443', 'NIST SP 800-82', 'IEC 61508', 'EN 50126', 'ISO/IEC 27001', 'AESCSF', 'Essential Eight'],
  systems: [
    'Rail signalling',
    'Traction power',
    'Tunnel ventilation',
    'Fire & life safety',
    'SCADA & DCS',
    'PLC, RTU & field devices',
    'Building management systems',
    'Passenger information',
  ],
  experienceWith: ['Transport for NSW', 'Schneider Electric', 'SIS Industrial Cyber Security', 'Sener Group (Tactix)', 'Rio Tinto'],
}


// Placeholders still to be supplied — render highlighted until filled in.
export const company = {
  legalName: 'OT Cyber Defence Pty Ltd',
  acn: '', // e.g. '123 456 789'
  address: 'Unit 217, 14 Lexington Drive, Bella Vista NSW 2153',
  email: '', // e.g. 'hello@otcyberdefence.com.au'
  phone: '', // e.g. '02 1234 5678'
}

// ─── Deeper layers (shown on section pages, behind "details" toggles) ────────────────────────

// Keyed by consultingServices[].title
export const serviceDetail: Record<string, { receive: string[]; refs: string[] }> = {
  'Critical infrastructure compliance': {
    receive: [
      'Gap assessment of your current program against the SOCI Act and CIRMP Rules',
      'A written CIRMP covering cyber, personnel, supply chain and physical hazards',
      'Board-ready annual report pack with an evidence trail',
      'Incident reporting runbook aligned to the 12-hour and 72-hour notification windows',
    ],
    refs: ['SOCI Act 2018', 'CIRMP Rules (LIN 23/006)', 'AESCSF', 'Essential Eight', 'NIST CSF 2.0'],
  },
  'Framework maturity assessments': {
    receive: [
      'Current-state maturity score, with evidence recorded against every practice',
      'Target profile agreed with your executives and regulator expectations',
      'Prioritised, costed remediation roadmap',
      'Executive summary for the board, plus a detailed technical report for engineering',
    ],
    refs: ['AESCSF (SP-1 to SP-3)', 'IEC 62443-2-1', 'IEC 62443-3-3', 'NIST CSF 2.0'],
  },
  'OT risk management': {
    receive: [
      'Asset and criticality register for the OT environment',
      'IEC 62443-3-2 threat and risk assessment (TARA) with target security levels',
      'Risk register with treatment plans that engineering can deliver',
      'Third-party and remote-access risk review',
    ],
    refs: ['IEC 62443-3-2', 'NIST SP 800-82', 'ISO/IEC 27005', 'IEC 61508 (safety interface)'],
  },
  'ICS & SCADA segmentation design': {
    receive: [
      'Zone and conduit model with security levels (SL-T) for each zone',
      'Reference architecture covering the DMZ, remote access and the IT/OT boundary',
      'Firewall and conduit requirements ready for integrators',
      'Design review of vendor and integrator proposals',
    ],
    refs: ['IEC 62443-3-2', 'IEC 62443-3-3', 'Purdue Reference Model', 'NIST SP 800-82'],
  },
  'OT cyber strategy & board advisory': {
    receive: [
      'Multi-year OT security strategy linked to measurable risk reduction',
      'Investment case with prioritised initiatives',
      'Board and executive briefings in plain operational language',
      'KPIs and reporting cadence for ongoing oversight',
    ],
    refs: ['SOCI board attestation', 'NIST CSF 2.0 (Govern)', 'ISO/IEC 27001'],
  },
  'Incident response readiness': {
    receive: [
      'OT incident response plan and playbooks for your control systems',
      'Tabletop exercises with operations, engineering and executives',
      'Mandatory reporting workflow to the ACSC',
      'Recovery priorities aligned to safety and service continuity',
    ],
    refs: ['SOCI Part 2B', 'NIST SP 800-61', 'IEC 62443-2-1'],
  },
}

// Keyed by protectionFeatures[].title — technical detail from BlastWave's published solution briefs.
export const featureDetail: Record<string, string[]> = {
  'Network cloaking': [
    'Places assets on a cryptographically enforced overlay network. The existing network stays as it is, with no re-IPing.',
    'Unauthorised scanners get no response to pings and see no open ports and no discoverable devices.',
    'Hides public-facing IP addresses and web services that are otherwise exposed to internet-wide scanning.',
  ],
  'Passwordless MFA': [
    'Phishing-resistant authentication through a mobile authenticator using a QR challenge-response and on-device biometrics.',
    'Removes factory-default and shared passwords as a path to credential theft.',
    'Every connection is verified before it is established, never trusted because of where it comes from on the network.',
  ],
  Microsegmentation: [
    'Software-defined zones and conduits between devices, without complex firewall rule sets.',
    'Contains ransomware and lateral movement to the smallest possible blast radius.',
    'Creates a “virtual air-gap” for legacy PLCs, RTUs and HMIs that cannot be patched.',
  ],
  'Secure remote access': [
    'Replaces VPNs and jump boxes for engineers and third-party vendors.',
    'BlastAccess provides remote desktop with session recording for audit.',
    'Remote diagnosis and configuration cut routine site visits (“truck rolls”).',
  ],
}

// Keyed by caseStudies[].title
export const caseDetail: Record<string, { challenge: string; approach: string; metrics: { v: string; k: string }[] }> = {
  'Hundreds of remote sites secured through an acquisition': {
    challenge:
      'Hundreds of remote, often unmanned sites, many with overlapping local IP schemes. Every configuration change needed a technician on site, and a large acquisition had to be integrated quickly.',
    approach:
      'A BlastShield software overlay with gateways at each site. The overlay resolved the IP conflicts, and software-defined zones and conduits were managed centrally.',
    metrics: [
      { v: '20,000', k: 'devices segmented (from 5,000)' },
      { v: '< 1 month', k: 'to integrate the acquisition' },
      { v: '< US$1k', k: 'capital cost per site' },
    ],
  },
  'One protected line kept running through a cyber attack': {
    challenge:
      'A plant with tightly integrated IT and OT networks was hit by an attack that spread quickly and forced the facility offline.',
    approach:
      'One production line was already under a small BlastWave trial with cloaking, IT/OT segmentation and zero trust verification on every access.',
    metrics: [
      { v: '0', k: 'hours of downtime on the protected line' },
      { v: '2+ days', k: 'of downtime for the rest of the plant' },
      { v: 'US$4.8M', k: 'revenue lost in unprotected areas' },
    ],
  },
  'Hazardous ammonia refrigeration systems protected': {
    challenge:
      'Legacy Windows controllers ran ammonia refrigeration across very large facilities and were reached through consumer remote-access tools. A VPN breach had already occurred.',
    approach:
      'BlastShield cloaked the controllers and replaced the remote-access tools with passwordless, segmented access. Seven structured tests ran during the proof of concept.',
    metrics: [
      { v: '2 months', k: 'of testing with no outage' },
      { v: '7', k: 'structured proof-of-concept tests' },
      { v: '4 days', k: 'to deliver a requested tablet client' },
    ],
  },
  'Legacy VPN replaced with zero trust access': {
    challenge:
      'A hardware VPN could not scale for a growing, remote workforce. It was unstable, and it left passwords open to phishing.',
    approach:
      'BlastShield zero trust network access to hybrid cloud and on-premise services, with biometric passwordless login.',
    metrics: [
      { v: '10 min', k: 'to a working two-continent network' },
      { v: '0', k: 'passwords to phish' },
      { v: 'Hybrid', k: 'cloud and on-premise covered' },
    ],
  },
}

export type Sector = {
  slug: string
  name: string
  photo: import('./media.ts').PhotoKey
  summary: string
  challenges: string[]
  systems: string[]
  regulation: string[]
  consulting: string
  protection: string
  reading?: { label: string; href: string }
}

export const sectors: Sector[] = [
  {
    slug: 'rail',
    name: 'Rail & Transport',
    photo: 'rail',
    summary: 'Signalling, traction power and tunnel systems where cyber risk is also a safety risk.',
    challenges: [
      'Safety-critical signalling and control systems with decades-long lifecycles',
      'Multi-vendor delivery, where security must hold across every integrator and every design stage',
      'Cyber and functional safety cases that must agree with each other',
    ],
    systems: ['Signalling & train control', 'Traction power & SCADA', 'Tunnel ventilation', 'Fire & life safety', 'Passenger information', 'Station BMS'],
    regulation: ['SOCI Act: transport sector', 'Rail Safety National Law (ONRSR)', 'IEC 62443', 'IEC 61508 / EN 50126'],
    consulting: 'Program-level OT security governance, zone and conduit design, vendor CMP review and FAT/SAT security assurance. Our team has held this role on major Transport for NSW programs.',
    protection: 'Cloaking and segmentation for station and wayside systems, and recorded, passwordless remote access for maintenance vendors.',
  },
  {
    slug: 'aviation',
    name: 'Aviation & Airports',
    photo: 'airport',
    summary: 'Converged IT and OT, extensive third-party access, and systems that cannot stop.',
    challenges: [
      'IT systems such as ticketing converged with OT systems such as baggage handling and airfield lighting',
      'Many contractors and vendors needing remote access',
      'Legacy, proprietary protocols that were never designed to be secure',
    ],
    systems: ['Baggage handling', 'Airfield lighting', 'HVAC & BMS', 'Fuel systems', 'Jet bridges', 'Security systems'],
    regulation: ['SOCI Act: aviation', 'Aviation Transport Security Act 2004', 'IEC 62443', 'Essential Eight'],
    consulting: 'SOCI and CIRMP uplift, OT asset visibility and risk assessment across airside and landside systems.',
    protection: 'A virtual air-gap for legacy airside systems, and controlled, recorded vendor access.',
    reading: { label: 'BlastWave: Zero Trust OT protection for airports (PDF)', href: 'https://go.blastwave.com/hubfs/DOWNLOADS/Solution%20Briefs/SB-BlastWave-Zero-Trust-Airports.pdf' },
  },
  {
    slug: 'energy',
    name: 'Energy & Electricity',
    photo: 'substation',
    summary: 'Generation, networks and renewables under AESCSF and SOCI.',
    challenges: [
      'Distributed substations and renewable sites with limited on-site staff',
      'AESCSF maturity targets and board attestation',
      'Public-facing IIoT and SCADA endpoints',
    ],
    systems: ['Substation automation', 'SCADA & DCS', 'Wind & solar sites', 'Battery storage (BESS)', 'Metering', 'Protection relays'],
    regulation: ['SOCI Act: energy', 'AESCSF', 'IEC 62443', 'IEC 61850 environments'],
    consulting: 'AESCSF assessments and gap analyses, remediation roadmaps and CIRMP alignment. Our team leads these for power, gas and renewable operators.',
    protection: 'Cloaked, segmented remote sites, with centralised policy and no site visits for routine changes.',
    reading: { label: 'BlastWave: energy sector', href: 'https://www.blastwave.com/energy' },
  },
  {
    slug: 'water',
    name: 'Water & Wastewater',
    photo: 'water',
    summary: 'Treatment plants and telemetry that communities rely on every hour.',
    challenges: [
      'Small teams responsible for large, dispersed telemetry networks',
      'Unpatchable PLCs and RTUs at pump stations',
      'Remote access for integrators and on-call staff',
    ],
    systems: ['Treatment plant SCADA', 'Pump stations', 'Telemetry & RTUs', 'Dosing control', 'Reservoir monitoring'],
    regulation: ['SOCI Act: water', 'IEC 62443', 'Essential Eight', 'NIST CSF 2.0'],
    consulting: 'SOCI compliance, OT risk assessments and practical architecture uplift sized to utility budgets.',
    protection: 'Cloaking for telemetry, passwordless access for on-call staff, and segmentation between sites.',
    reading: { label: 'BlastWave: water & wastewater', href: 'https://www.blastwave.com/water' },
  },
  {
    slug: 'oil-gas',
    name: 'Oil & Gas',
    photo: 'refinery',
    summary: 'Remote, harsh sites where every site visit is expensive.',
    challenges: ['Hundreds of dispersed, unmanned sites', 'Overlapping IP schemes after acquisitions', 'Hazardous processes where cyber risk becomes safety risk'],
    systems: ['Wellsite automation', 'Pipeline SCADA', 'Terminals', 'Safety instrumented systems', 'Compressor stations'],
    regulation: ['SOCI Act: energy (gas, liquid fuels)', 'IEC 62443', 'IEC 61511 environments'],
    consulting: 'OT risk and safety–cyber integration, IEC 62443 zone design and assurance for integrators.',
    protection: 'Overlay segmentation proven across hundreds of remote sites, integrating new assets without re-addressing.',
    reading: { label: 'Case study: North American energy producer (PDF)', href: 'https://go.blastwave.com/hubfs/DOWNLOADS/Case-Study/BlastWave-Oil-Gas-Case-Study.pdf' },
  },
  {
    slug: 'ports',
    name: 'Ports & Maritime',
    photo: 'port',
    summary: 'Cranes, terminal automation and traffic management at national gateways.',
    challenges: ['Highly automated terminals with many operators', 'Vendor-maintained crane and gate systems', 'Continuous operations with no downtime windows'],
    systems: ['Crane control', 'Terminal operating systems', 'Gate automation', 'Traffic management', 'Building & security systems'],
    regulation: ['SOCI Act: ports', 'Maritime Transport and Offshore Facilities Security Act 2003', 'IEC 62443'],
    consulting: 'Risk assessment and segmentation design across terminal OT, and vendor access governance.',
    protection: 'Hiding crane and gate systems from discovery, and controlling vendor access down to the individual device.',
    reading: { label: 'BlastWave: ports', href: 'https://www.blastwave.com/ports' },
  },
  {
    slug: 'mining',
    name: 'Mining & Resources',
    photo: 'mine',
    summary: 'Remote and autonomous operations on long, fragile links.',
    challenges: ['Remote sites on microwave and satellite links', 'Autonomous and remotely operated equipment', 'Converged corporate and processing networks'],
    systems: ['Processing plant DCS', 'Remote operations centres', 'Autonomous haulage networks', 'Site-wide WAN'],
    regulation: ['IEC 62443', 'NIST CSF 2.0', 'SOCI Act (where assets are in scope)'],
    consulting: 'OT network architecture and segmentation, and risk assessment. Our team has designed group-wide mining networks and SCADA operations.',
    protection: 'Cloaked, segmented access to remote plant, and resilient connectivity across several WAN links.',
  },
  {
    slug: 'government',
    name: 'Government & Defence',
    photo: 'parliament',
    summary: 'Facilities, building systems and defence infrastructure.',
    challenges: ['Building management and security systems on shared networks', 'Strict assurance and audit expectations', 'Many facilities with different integrators'],
    systems: ['Building management (BMS)', 'Access control & CCTV', 'Critical facility plant', 'Data centre OT'],
    regulation: ['PSPF', 'Information Security Manual (ISM)', 'Essential Eight', 'IEC 62443'],
    consulting: 'Assurance-grade assessments and documentation, with requirements written for procurement and RFTs.',
    protection: 'Zero trust access and segmentation for facility OT. BlastShield is used by the U.S. Air Force.',
    reading: { label: 'BlastWave: government', href: 'https://www.blastwave.com/government' },
  },
]
