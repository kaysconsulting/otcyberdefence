import { createContext, useContext } from 'react'
import type { Sector } from '../content/sectors.ts'

/** The visitor's sector, so the diagram can use their asset names. */
export const SectorContext = createContext<Sector>('other')
export const useSector = () => useContext(SectorContext)
