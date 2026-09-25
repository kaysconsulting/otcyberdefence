import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav.tsx'
import Footer from './components/Footer.tsx'
import Home from './pages/Home.tsx'
import Consulting from './pages/Consulting.tsx'
import Protection from './pages/Protection.tsx'
import CaseStudies from './pages/CaseStudies.tsx'
import Sectors from './pages/Sectors.tsx'
import SectorPage from './pages/SectorPage.tsx'
import Expertise from './pages/Expertise.tsx'
import ContactPage from './pages/ContactPage.tsx'
import NotFound from './pages/NotFound.tsx'
import Reveal from './components/Reveal.tsx'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/consulting" element={<Consulting />} />
          <Route path="/protection" element={<Protection />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/sectors" element={<Sectors />} />
          <Route path="/sectors/:slug" element={<SectorPage />} />
          <Route path="/expertise" element={<Expertise />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Reveal />
    </>
  )
}
