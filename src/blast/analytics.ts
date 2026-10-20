// Privacy-friendly analytics: anonymous events only (spec 11). No-op unless Plausible is loaded.
type Plausible = (event: string, opts?: { props?: Record<string, string | number> }) => void
export function track(event: string, props?: Record<string, string | number>) {
  try {
    ;(window as unknown as { plausible?: Plausible }).plausible?.(event, props ? { props } : undefined)
  } catch {
    /* analytics must never break the tool */
  }
}
