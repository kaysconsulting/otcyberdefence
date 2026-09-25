// Shows the real value when set, otherwise a highlighted "[label]" so gaps are obvious before launch.
export default function Placeholder({ value, label }: { value: string; label: string }) {
  return value ? <>{value}</> : <span className="ph">[{label}]</span>
}
