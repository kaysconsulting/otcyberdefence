import { Link } from 'react-router-dom'
import Banner from '../components/Banner.tsx'

export default function NotFound() {
  return (
    <>
      <Banner image="rail-transport" crumbs={[{ label: 'Not found' }]} title="This page doesn't exist" text="The link may be out of date." button={false} />
      <section>
        <div className="wrap">
          <Link to="/" className="more">Back to home →</Link>
        </div>
      </section>
    </>
  )
}
