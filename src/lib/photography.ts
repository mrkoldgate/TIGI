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
  // Africa-first set (v6) — markets TIGI launches in first
  kigaliSunset: {
    id: 'photo-1687986261123-b17f08f2796c',
    alt: 'Kigali skyline at sunset, Rwanda',
    credit: 'Jean Claude Akarikumutima',
  },
  kigaliHomes: {
    id: 'photo-1708772565599-2c4e4b3ed9db',
    alt: 'Terracotta rooftops across a hillside in Kigali, Rwanda',
    credit: 'Protais Benjamin Mugenzi',
  },
  lagosWaterfront: {
    id: 'photo-1618828665011-0abd973f7bb8',
    alt: 'The Lagos waterfront and the road to Victoria Island, Nigeria',
    credit: 'Nupo Deyon Daniel',
  },
  nairobiSkyline: {
    id: 'photo-1741991110666-88115e724741',
    alt: 'The Nairobi skyline on a clear day, Kenya',
    credit: 'imsogabriel stock',
  },
  dakarPink: {
    id: 'photo-1758061298787-667ae2a9d67c',
    alt: 'A pink house with palm trees by the water, Senegal',
    credit: 'Sweder Breet',
  },
  brickHome: {
    id: 'photo-1787672358119-25cb4c768d14',
    alt: 'A new brick family home with a grey metal roof',
    credit: 'Divaris Shirichena',
  },
  modernVilla: {
    id: 'photo-1787704113747-c1a65d1a6a62',
    alt: 'A modern three-storey home with wood panelling and a covered drive',
    credit: 'Ibrahim Design',
  },
  greenPlots: {
    id: 'photo-1776090416729-20bedcc1a207',
    alt: 'Open green land with a dirt road and scattered buildings',
    credit: 'Shane Ryan Herilalaina',
  },
  orangeHouse: {
    id: 'photo-1568903421626-ca0f5d72b5b2',
    alt: 'A woman carrying a child on her back walks past an orange house',
    credit: 'Vince Gx',
  },
} satisfies Record<string, Photo>

export type PhotoKey = keyof typeof PHOTOS

export function photoUrl(key: PhotoKey, width = 1600, quality = 80) {
  return `https://images.unsplash.com/${PHOTOS[key].id}?auto=format&fit=crop&w=${width}&q=${quality}`
}
