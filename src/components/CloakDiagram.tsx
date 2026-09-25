const nodes = [
  { x: 252, y: 70, name: 'HMI', seg: 'Segment A' },
  { x: 374, y: 70, name: 'PLC', seg: 'Segment B' },
  { x: 252, y: 160, name: 'RTU', seg: 'Segment C' },
]

export default function CloakDiagram() {
  return (
    <div
      className="diagram"
      aria-label="Diagram: attackers cannot see cloaked OT assets; authorised users connect through passwordless MFA to microsegmented zones"
    >
      <svg viewBox="0 0 520 380" fontFamily="Inter,sans-serif">
        <defs>
          <marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 10 5 0 10z" fill="#6A9FE6" />
          </marker>
        </defs>
        {/* attacker */}
        <rect x="18" y="40" width="120" height="54" rx="10" fill="#1B2438" stroke="#E5484D" />
        <text x="78" y="64" fill="#E8EEF7" fontSize="13" fontWeight="700" textAnchor="middle">Attacker</text>
        <text x="78" y="81" fill="#9AAAC2" fontSize="11" textAnchor="middle">scans, stolen creds</text>
        <path d="M138 67h92" stroke="#E5484D" strokeWidth="2" strokeDasharray="5 5" />
        <text x="184" y="58" fill="#E5484D" fontSize="11" textAnchor="middle">nothing to see</text>
        {/* engineer */}
        <rect x="18" y="262" width="120" height="54" rx="10" fill="#1B2438" stroke="#6A9FE6" />
        <text x="78" y="286" fill="#E8EEF7" fontSize="13" fontWeight="700" textAnchor="middle">Engineer</text>
        <text x="78" y="303" fill="#9AAAC2" fontSize="11" textAnchor="middle">passwordless MFA</text>
        <path d="M138 289h84" stroke="#6A9FE6" strokeWidth="2" markerEnd="url(#a)" />
        {/* cloaked network */}
        <rect x="230" y="20" width="272" height="340" rx="16" fill="#0F1A2C" stroke="#6A9FE6" strokeDasharray="6 6" />
        <text x="366" y="46" fill="#6A9FE6" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="1.5">
          CLOAKED OT NETWORK
        </text>
        <g fontSize="12" fill="#E8EEF7" textAnchor="middle">
          {nodes.map((n) => (
            <g key={n.name}>
              <rect x={n.x} y={n.y} width="108" height="76" rx="10" fill="#13213A" stroke="#223452" />
              <text x={n.x + 54} y={n.y + 34} fontWeight="700">{n.name}</text>
              <text x={n.x + 54} y={n.y + 52} fill="#9AAAC2" fontSize="10">{n.seg}</text>
            </g>
          ))}
          <rect x="374" y="160" width="108" height="76" rx="10" fill="#13213A" stroke="#6A9FE6" />
          <text x="428" y="194" fontWeight="700">Legacy SCADA</text>
          <text x="428" y="212" fill="#6A9FE6" fontSize="10">virtual air-gap</text>
          <rect x="252" y="262" width="230" height="54" rx="10" fill="#102A4C" stroke="#6A9FE6" />
          <text x="367" y="286" fontWeight="700">Security Gateway</text>
          <text x="367" y="303" fill="#9AAAC2" fontSize="10">identity-based policy, per-device segments</text>
        </g>
      </svg>
    </div>
  )
}
