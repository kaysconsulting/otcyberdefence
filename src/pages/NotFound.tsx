import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.tsx'
import { Arrow } from '../components/Icon.tsx'

export default function NotFound() {
  return (
    <>
      <PageHero photo="signal" eyebrow="404" title="This page doesn't exist" lead="The link may be out of date." depth={false} />
      <section>
        <div className="wrap">
          <Link to="/" className="text-link">
            Back to home <Arrow />
          </Link>
        </div>
      </section>
    </>
  )
}
