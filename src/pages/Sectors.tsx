import { SECTORS } from '../data.ts'
import Banner from '../components/Banner.tsx'
import Band from '../components/Band.tsx'
import SectorCard from '../components/SectorCard.tsx'

export default function Sectors() {
  return (
    <>
      <Banner
        image="ports-maritime"
        crumbs={[{ label: 'Sectors' }]}
        eyebrow="Sectors"
        title="Built for the Sectors SOCI Protects"
        text="Choose your sector to see the systems in scope, the regulation that applies and how we help."
      />
      <section>
        <div className="wrap">
          <div className="sectors" style={{ marginTop: 0 }}>
            {SECTORS.map((x) => (
              <SectorCard key={x.s} x={x} />
            ))}
          </div>
        </div>
      </section>
      <Band title="Let's Work Together" />
    </>
  )
}
