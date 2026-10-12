// ---------------------------------------------------------------------------
// Curated photography for the public site.
//
// Photography is content on TIGI (see docs/product/design-direction-v4.md):
// full-bleed or square-cornered plates, captions in the gutter beneath,
// no tinted overlays except a legibility scrim where text sits on an image.
//
// All images are from Unsplash under the Unsplash License (free to use,
// attribution appreciated). Replace with TIGI-commissioned or AI-directed
// photography before public launch.
// ---------------------------------------------------------------------------

export interface Photo {
  id: string
  alt: string
  credit: string
}

export const PHOTOS = {
  heroHouse: {
    id: 'photo-1728721647044-fd8a9c830531',
    alt: 'A modern glass house at dusk, mirrored in a still reflecting pool',
    credit: 'Islam Allam',
  },
  houseDusk: {
    id: 'photo-1748063578185-3d68121b11ff',
    alt: 'A two-storey modern home with warm interior light at dusk',
    credit: 'Arthur Baudry',
  },
  desertCabin: {
    id: 'photo-1743113590282-febd995242df',
    alt: 'Aerial view of a modern cabin set into a desert hillside',
    credit: 'Miltiadis Fragkidis',
  },
  apartmentsPink: {
    id: 'photo-1624204386084-dd8c05e32226',
    alt: 'An apartment building with glass balconies under a soft pink sky',
    credit: 'Tobias Wilden',
  },
  apartmentsBlueHour: {
    id: 'photo-1610286986642-057ece0c3656',
    alt: 'A mid-rise apartment building lit from within at blue hour',
    credit: 'Alexandre Lallemand',
  },
  interior: {
    id: 'photo-1758448755952-42b404bc6f39',
    alt: 'A calm living room with warm light and soft furnishings',
    credit: 'Aalo Lens',
  },
  farmlandAerial: {
    id: 'photo-1619719826894-89d6c4fd5739',
    alt: 'Aerial view of a tractor working the edge of a green field',
    credit: 'Red Zeppelin',
  },
  fieldsAerial: {
    id: 'photo-1703850827351-a1be4d85a095',
    alt: 'Wide aerial view of patchwork farmland under an open sky',
    credit: 'Haydn',
  },
  goldenLand: {
    id: 'photo-1604808397353-36670a4b679d',
    alt: 'Aerial view of tree lines and open fields in golden light',
    credit: 'Kevin',
  },
  coastAerial: {
    id: 'photo-1758737922159-0d526ec95516',
    alt: 'Forest meeting a blue ocean coastline from above',
    credit: 'Khai Hoan Chu',
  },
  foggyHomestead: {
    id: 'photo-1578842247281-dd63fcf4098f',
    alt: 'A lone tree and a house in morning fog',
    credit: 'Emanuel Haas',
  },
} satisfies Record<string, Photo>

export type PhotoKey = keyof typeof PHOTOS

export function photoUrl(key: PhotoKey, width = 1600, quality = 80) {
  return `https://images.unsplash.com/${PHOTOS[key].id}?auto=format&fit=crop&w=${width}&q=${quality}`
}
