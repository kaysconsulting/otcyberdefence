// Site content from the new site structure (index_2.html). Media is self-hosted in /public/media.
import type { ImgKey } from './media.ts'

export type Sector = {
  s: string
  n: string
  img: ImgKey
  t: string
  c: string
  p: string
  ch: string[]
  sy: string[]
  rg: string[]
}

export const SECTORS: Sector[] = [
  {
    s: 'rail',
    n: 'Rail & Transport',
    img: 'rail-transport',
    t: 'Signalling, traction power and tunnel systems where cyber risk is also a safety risk.',
    c: 'Program-level OT security governance, zone and conduit design, vendor CMP review and FAT/SAT security assurance. Our team has held this role on major Transport for NSW programs.',
    p: 'Cloaking and segmentation for station and wayside systems, and recorded, passwordless remote access for maintenance vendors.',
    ch: ['Safety-critical signalling with decades-long lifecycles', 'Multi-vendor delivery where security must hold across every integrator', 'Cyber and functional safety cases that must agree'],
    sy: ['Signalling & train control', 'Traction power & SCADA', 'Tunnel ventilation', 'Fire & life safety', 'Passenger information', 'Station BMS'],
    rg: ['SOCI Act: transport', 'Rail Safety National Law (ONRSR)', 'IEC 62443', 'IEC 61508 / EN 50126'],
  },
  {
    s: 'aviation',
    n: 'Aviation & Airports',
    img: 'aviation-airports',
    t: 'Converged IT and OT, extensive third-party access, and systems that cannot stop.',
    c: 'SOCI and CIRMP uplift, OT asset visibility and risk assessment across airside and landside systems.',
    p: 'A virtual air-gap for legacy airside systems, and controlled, recorded vendor access.',
    ch: ['IT systems such as ticketing converged with baggage handling and airfield lighting', 'Many contractors needing remote access', 'Legacy protocols never designed to be secure'],
    sy: ['Baggage handling', 'Airfield lighting', 'HVAC & BMS', 'Fuel systems', 'Jet bridges', 'Security systems'],
    rg: ['SOCI Act: aviation', 'Aviation Transport Security Act 2004', 'IEC 62443', 'Essential Eight'],
  },
  {
    s: 'energy',
    n: 'Energy & Electricity',
    img: 'energy-electricity',
    t: 'Generation, networks and renewables under AESCSF and SOCI.',
    c: 'AESCSF assessments and gap analyses, remediation roadmaps and CIRMP alignment for power, gas and renewable operators.',
    p: 'Cloaked, segmented remote sites, with centralised policy and no site visits for routine changes.',
    ch: ['Distributed substations and renewable sites with limited on-site staff', 'AESCSF maturity targets and board attestation', 'Public-facing IIoT and SCADA endpoints'],
    sy: ['Substation automation', 'SCADA & DCS', 'Wind & solar sites', 'Battery storage (BESS)', 'Metering', 'Protection relays'],
    rg: ['SOCI Act: energy', 'AESCSF', 'IEC 62443', 'IEC 61850 environments'],
  },
  {
    s: 'water',
    n: 'Water & Wastewater',
    img: 'water-wastewater',
    t: 'Treatment plants and telemetry that communities rely on every hour.',
    c: 'SOCI compliance, OT risk assessments and practical architecture uplift sized to utility budgets.',
    p: 'Cloaking for telemetry, passwordless access for on-call staff, and segmentation between sites.',
    ch: ['Small teams running large, dispersed telemetry networks', 'Unpatchable PLCs and RTUs at pump stations', 'Remote access for integrators and on-call staff'],
    sy: ['Treatment plant SCADA', 'Pump stations', 'Telemetry & RTUs', 'Dosing control', 'Reservoir monitoring'],
    rg: ['SOCI Act: water', 'IEC 62443', 'Essential Eight', 'NIST CSF 2.0'],
  },
  {
    s: 'oil-gas',
    n: 'Oil & Gas',
    img: 'oil-gas',
    t: 'Remote, harsh sites where every site visit is expensive.',
    c: 'OT risk and safety-cyber integration, IEC 62443 zone design and assurance for integrators.',
    p: 'Overlay segmentation proven across hundreds of remote sites, integrating new assets without re-addressing.',
    ch: ['Hundreds of dispersed, unmanned sites', 'Overlapping IP schemes after acquisitions', 'Hazardous processes where cyber risk becomes safety risk'],
    sy: ['Wellsite automation', 'Pipeline SCADA', 'Terminals', 'Safety instrumented systems', 'Compressor stations'],
    rg: ['SOCI Act: energy (gas, liquid fuels)', 'IEC 62443', 'IEC 61511 environments'],
  },
  {
    s: 'ports',
    n: 'Ports & Maritime',
    img: 'ports-maritime',
    t: 'Cranes, terminal automation and traffic management at national gateways.',
    c: 'Risk assessment and segmentation design across terminal OT, and vendor access governance.',
    p: 'Hiding crane and gate systems from discovery, and controlling vendor access down to the individual device.',
    ch: ['Highly automated terminals with many operators', 'Vendor-maintained crane and gate systems', 'Continuous operations with no downtime windows'],
    sy: ['Crane control', 'Terminal operating systems', 'Gate automation', 'Traffic management', 'Building & security systems'],
    rg: ['SOCI Act: ports', 'Maritime Transport and Offshore Facilities Security Act 2003', 'IEC 62443'],
  },
  {
    s: 'mining',
    n: 'Mining & Resources',
    img: 'mining-resources',
    t: 'Remote and autonomous operations on long, fragile links.',
    c: 'OT network architecture, segmentation and risk assessment. Our team has designed group-wide mining networks and SCADA operations.',
    p: 'Cloaked, segmented access to remote plant, and resilient connectivity across several WAN links.',
    ch: ['Remote sites on microwave and satellite links', 'Autonomous and remotely operated equipment', 'Converged corporate and processing networks'],
    sy: ['Processing plant DCS', 'Remote operations centres', 'Autonomous haulage networks', 'Site-wide WAN'],
    rg: ['IEC 62443', 'NIST CSF 2.0', 'SOCI Act (where in scope)'],
  },
  {
    s: 'government',
    n: 'Government & Defence',
    img: 'government-defence',
    t: 'Facilities, building systems and defence infrastructure.',
    c: 'Assurance-grade assessments and documentation, with requirements written for procurement and RFTs.',
    p: 'Zero trust access and segmentation for facility OT, on a platform already trusted by defence organisations overseas.',
    ch: ['Building management and security systems on shared networks', 'Strict assurance and audit expectations', 'Many facilities with different integrators'],
    sy: ['Building management (BMS)', 'Access control & CCTV', 'Critical facility plant', 'Data centre OT'],
    rg: ['PSPF', 'Information Security Manual (ISM)', 'Essential Eight', 'IEC 62443'],
  },
]

// [tag, title, description, what you receive, standards referenced]
export const SERVICES: [string, string, string, string[], string[]][] = [
  ['SOCI Act', 'Critical infrastructure compliance', 'End-to-end support for obligations under the Security of Critical Infrastructure Act 2018.',
    ['Gap assessment against the SOCI Act and CIRMP Rules', 'A written CIRMP covering cyber, personnel, supply chain and physical hazards', 'Board-ready annual report pack with an evidence trail', 'Incident reporting runbook for the 12-hour and 72-hour windows'],
    ['SOCI Act 2018', 'CIRMP Rules', 'AESCSF', 'Essential Eight', 'NIST CSF 2.0']],
  ['Assessment', 'Framework maturity assessments', 'Independent, evidence-based assessment against the framework that fits your sector and regulator.',
    ['Current-state maturity score, with evidence against every practice', 'Target profile agreed with executives', 'Prioritised, costed remediation roadmap', 'Board summary plus a detailed technical report'],
    ['AESCSF (SP-1 to SP-3)', 'IEC 62443-2-1', 'IEC 62443-3-3', 'NIST CSF 2.0']],
  ['Risk', 'OT risk management', 'Cyber risk expressed in operational terms: safety, availability and production, not just data.',
    ['Asset and criticality register', 'IEC 62443-3-2 threat and risk assessment with target security levels', 'Risk register with deliverable treatment plans', 'Third-party and remote-access risk review'],
    ['IEC 62443-3-2', 'NIST SP 800-82', 'ISO/IEC 27005', 'IEC 61508']],
  ['Architecture', 'ICS & SCADA segmentation design', 'Reference architectures, zones and conduits, and secure remote access designs.',
    ['Zone and conduit model with target security levels', 'Reference architecture for the DMZ, remote access and IT/OT boundary', 'Firewall and conduit requirements ready for integrators', 'Design review of vendor and integrator proposals'],
    ['IEC 62443-3-2', 'IEC 62443-3-3', 'NIST SP 800-82']],
  ['Strategy', 'OT cyber strategy & board advisory', 'Executive briefings, investment prioritisation and multi-year programs that tie spend to risk reduction.',
    ['Multi-year OT security strategy', 'Investment case with prioritised initiatives', 'Board briefings in plain operational language', 'KPIs and reporting cadence'],
    ['SOCI board attestation', 'NIST CSF 2.0 (Govern)', 'ISO/IEC 27001']],
  ['Resilience', 'Incident response readiness', 'OT-specific response plans, playbooks and exercises aligned to SOCI reporting timeframes.',
    ['OT incident response plan and playbooks', 'Tabletop exercises with operations and executives', 'Mandatory reporting workflow to the ACSC', 'Recovery priorities aligned to safety and service'],
    ['SOCI Part 2B', 'NIST SP 800-61', 'IEC 62443-2-1']],
]

export const CASES = [
  {
    tag: 'Oil & Gas',
    title: 'Hundreds of remote sites secured through an acquisition',
    body: 'A major North American energy producer placed a software-defined overlay across hundreds of remote sites. Overlapping IP schemes stopped being a problem, and trips to site for routine changes largely ended.',
    figs: [['20,000', 'devices segmented (from 5,000)'], ['< 1 month', 'to integrate the acquisition'], ['< US$1k', 'capital cost per site']],
    more: 'An acquisition brought hundreds of unmanned sites with overlapping address schemes. Rather than re-addressing every site, the overlay cloaked and segmented the new assets in place, with central policy replacing site visits.',
  },
  {
    tag: 'Manufacturing',
    title: 'One protected line kept running through a cyber attack',
    body: "An attack spread across a plant's tightly coupled IT and OT networks and halted production for more than two days. The one protected line kept running. Management then extended protection across the whole network.",
    figs: [['0', 'hours of downtime on the protected line'], ['2+ days', 'of downtime for the rest of the plant'], ['US$4.8M', 'revenue lost in unprotected areas']],
    more: 'Flat, converged IT and OT networks let the attack move freely. The protected line was cloaked and segmented, so the attack could not see or reach it.',
  },
  {
    tag: 'Critical infrastructure',
    title: 'Hazardous ammonia refrigeration systems protected',
    body: 'A leading cold-chain logistics operator cloaked the legacy, unpatchable Windows controllers running ammonia refrigeration across its facilities, replacing exposed remote-access tools.',
    figs: [['2 months', 'of testing with no outage'], ['7', 'structured proof-of-concept tests'], ['4 days', 'to deliver a requested tablet client']],
    more: 'Safety-critical controllers could not be patched and were reachable through remote-access tools. A structured proof of concept validated cloaking and passwordless access without a single outage.',
  },
  {
    tag: 'Technology',
    title: 'Legacy VPN replaced with zero trust access',
    body: 'An artificial intelligence company replaced an unstable hardware VPN with zero trust access to its cloud and on-premise services, with no passwords to phish.',
    figs: [['10 min', 'to a working two-continent network'], ['0', 'passwords to phish'], ['Hybrid', 'cloud and on-premise covered']],
    more: 'The existing VPN was unreliable and relied on passwords. Passwordless zero trust access replaced it across cloud and on-premise services in minutes.',
  },
]

export const FAQS = [
  ['What does OT Cyber Defence do?', 'We help Australian critical infrastructure operators meet their SOCI obligations and secure their operational technology. We deliver OT cyber consulting (SOCI, AESCSF, IEC 62443, NIST CSF) and OT cyber protection using a zero trust platform proven at more than 5,000 sites worldwide.'],
  ['Who do you work with?', 'Operators of the systems SOCI protects: rail and transport, aviation and airports, energy, water, oil and gas, ports, mining and government facilities.'],
  ['Can you protect legacy systems that cannot be patched?', 'Yes. Our protection platform cloaks PLCs, RTUs and HMIs so they cannot be discovered, and creates a virtual air-gap around equipment that cannot be updated.'],
  ['Does deployment need downtime or a network redesign?', 'No. The platform runs as a software overlay on your existing network, with no re-addressing or redesign. We plan every deployment around your operations.'],
  ['Which frameworks do you work with?', 'SOCI Act 2018 and the CIRMP Rules, AESCSF, ISA/IEC 62443, NIST CSF 2.0, NIST SP 800-82, ISO/IEC 27001 and the ACSC Essential Eight.'],
  ['How do I get started?', 'Book a 30-minute appointment. We will discuss your obligations and systems, and agree the right first step.'],
]
