import { Link } from 'react-router-dom'

// Official OT Cyber Defence logo (from "shared image.png", trimmed and made transparent).
export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="OT Cyber Defence home">
      <img src="/brand/otcd-logo.png" alt="OT Cyber Defence · Securing OT Systems" width={487} height={260} />
    </Link>
  )
}
