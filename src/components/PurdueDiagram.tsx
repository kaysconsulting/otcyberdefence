// Simplified Purdue reference model with IEC 62443 zones and conduits.
const levels = [
  { l: '4–5', name: 'Enterprise', eg: 'ERP, email, internet', tone: 'it' },
  { l: '3.5', name: 'Industrial DMZ', eg: 'Historian mirror, patch server, remote access', tone: 'dmz' },
  { l: '3', name: 'Site operations', eg: 'Historian, engineering workstations', tone: 'ot' },
  { l: '2', name: 'Supervisory control', eg: 'SCADA, HMI, DCS', tone: 'ot' },
  { l: '1', name: 'Basic control', eg: 'PLC, RTU, safety controllers', tone: 'ot' },
  { l: '0', name: 'Physical process', eg: 'Sensors, actuators, drives', tone: 'ot' },
]

export default function PurdueDiagram() {
  return (
    <figure className="purdue" aria-label="Purdue model with IEC 62443 zones and conduits">
      {levels.map((v, i) => (
        <div key={v.l}>
          <div className={`lvl ${v.tone}`}>
            <span className="mono">L{v.l}</span>
            <b>{v.name}</b>
            <small>{v.eg}</small>
          </div>
          {i < levels.length - 1 && (
            <div className="conduit" aria-hidden="true">
              <span />
              {i === 0 || i === 1 ? <em className="mono">conduit · firewall</em> : i === 2 ? <em className="mono">conduit</em> : null}
            </div>
          )}
        </div>
      ))}
      <figcaption>
        Each level is a <b>zone</b> and each link between zones is a <b>conduit</b>. IEC 62443-3-2 sets a target security
        level (SL-T) for every zone and conduit.
      </figcaption>
    </figure>
  )
}
