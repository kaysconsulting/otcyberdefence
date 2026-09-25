// Photography: Unsplash (free Unsplash License). Swap for your own site photography any time.
const u = (id: string) => (w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`

export const photos = {
  hero: u('1531033056439-63578c0d9f22'), // Sydney Harbour Bridge at night
  rail: u('1646215992825-688426407576'), // Sydney double-deck train under overhead wiring
  signal: u('1612083111232-29f08821e47a'), // rail tracks
  airport: u('1715268358642-fdab48114710'), // airport from the air
  jetbridge: u('1786788684882-14234a6c8613'), // jet bridge, foggy apron
  substation: u('1776251896448-a5eb8ae25e35'), // substation insulators
  water: u('1705708551758-76b153fa536e'), // clarifier tanks from above
  control: u('1738918937796-743064feefa1'), // control room
  port: u('1590496793907-4d66e2994b4d'), // container cranes at dusk
  refinery: u('1629447388369-760612337eff'), // refinery at night
  mine: u('1570979872224-a1ea9f1248b0'), // open-pit mine from above
  parliament: u('1672264597620-d792bb6de88d'), // Parliament House, Canberra
  engineers: u('1778074762022-c33cc42f79ae'), // engineers reviewing plans on site
  network: u('1594915440248-1e419eba6611'), // fibre into a network switch
}
export type PhotoKey = keyof typeof photos
