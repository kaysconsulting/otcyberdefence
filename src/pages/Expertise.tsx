import Banner from '../components/Banner.tsx'
import Band from '../components/Band.tsx'

const areas = [
  ['Transport', 'Major transport programs', 'Senior OT cybersecurity authority on major Transport for NSW programs, accountable for governance, assurance and formal sign-off across safety-critical rail and transport systems.'],
  ['Safety', 'Cyber and functional safety, together', 'IEC 62443 integrated with IEC 61508 and EN 50126, so cyber-induced failure modes are captured in HAZOP and safety cases.'],
  ['Standards', 'IEC 62443 and AESCSF programs', 'Zone and conduit design, security level verification, IEC 62443-3-2 risk assessments and AESCSF maturity assessments across rail, water, power, gas, solar and oil & gas.'],
  ['Assurance', 'Vendor and integrator assurance', 'Review of vendor Cybersecurity Management Plans, OT security requirements for RFTs, and FAT/SAT evidence validated before acceptance.'],
  ['Delivery', 'Design, commissioning and delivery', 'Secure OT architectures designed, tested and commissioned in live environments, including SCADA, PLC and BMS delivery on major international projects.'],
  ['Networks', 'Industrial networks from the ground up', 'Resilient, segmented OT/IT networks and SCADA operations across geographically dispersed mining and refinery sites.'],
]
const quals = [
  'ISA/IEC 62443 Approved Instructor', 'ISA/IEC 62443 Risk Assessment Specialist', 'ISA/IEC 62443 Fundamentals Specialist', 'ISO/IEC 27001 Lead Auditor',
  'ISO 9001 QMS Auditor', 'CCNP Enterprise · CCNA Cyber Ops', 'NSW Class 2C Security Licence', 'MBA (IS) · BSc (Hons) Computer Science',
]
const chipsets: [string, string[], string?][] = [
  ['Safety-critical systems secured', ['Rail signalling', 'Traction power', 'Tunnel ventilation', 'Fire & life safety', 'SCADA & DCS', 'PLC, RTU & field devices', 'BMS', 'Passenger information']],
  ['Standards applied', ['IEC 62443', 'NIST SP 800-82', 'IEC 61508', 'EN 50126', 'ISO/IEC 27001', 'AESCSF', 'Essential Eight']],
  ['Where our experience was gained', ['Transport for NSW', 'Schneider Electric', 'SIS Industrial Cyber Security', 'Sener Group (Tactix)', 'Rio Tinto'], 'Organisations where our team members have held roles. Not client endorsements.'],
]

export default function Expertise() {
  return (
    <>
      <Banner
        image="expertise-banner"
        crumbs={[{ label: 'Expertise' }]}
        eyebrow="Expertise"
        title="Practitioners Who Have Secured Australia's Safety-Critical Infrastructure"
        text="More than 18 years of hands-on OT and ICS security across transport, energy and renewables, water, mining, utilities and defence."
      />
      <section>
        <div className="wrap">
          <div className="grid3" style={{ marginTop: 0 }}>
            {areas.map(([t, h, p]) => (
              <div key={h} className="card">
                <span className="tag">{t}</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="alt">
        <div className="wrap">
          <span className="eyebrow">Qualifications held by our team</span>
          <h2>Certified Where It Counts</h2>
          <div className="quals">
            {quals.map((q) => (
              <div key={q}>{q}</div>
            ))}
          </div>
          <div className="grid3">
            {chipsets.map(([h, list, note]) => (
              <div key={h}>
                <h3>{h}</h3>
                <div className="chips">
                  {list.map((i) => (
                    <span key={i}>{i}</span>
                  ))}
                </div>
                {note && <p className="fine">{note}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Band title="Let's Work Together" />
    </>
  )
}
