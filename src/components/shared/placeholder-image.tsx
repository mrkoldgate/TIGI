import Image from 'next/image'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// PlaceholderImage — Property image strategy for MVP seed data.
//
// TIGI never shows empty gray boxes. This component provides:
//   1. CSS gradient backgrounds that look like realistic property tones
//   2. A slot system mapping to Unsplash property images (free, no auth)
//   3. A fallback that always renders something premium-looking
//
// Unsplash source IDs are curated real estate photos.
// See docs/product/design-principles.md §10 for image philosophy.
// ---------------------------------------------------------------------------

// Curated Unsplash photo IDs by property type
// Update these with actual AI-generated images once seed script runs.
const PLACEHOLDER_PHOTOS: Record<string, string> = {
  'residential-1': 'photo-1570129477492-45c003edd2be',
  'residential-2': 'photo-1568605114967-8130f3a36994',
  'residential-3': 'photo-1564013799919-ab600027ffc6',
  'residential-4': 'photo-1600585154340-be6161a56a0c',
  'residential-5': 'photo-1600596542815-ffad4c1539a9',
  'commercial-1': 'photo-1486325212027-8081e485255e',
  'commercial-2': 'photo-1497366216548-37526070297c',
  'commercial-3': 'photo-1577071278176-ed0bcd5a0bd7',
  'commercial-4': 'photo-1545324418-cc1a3fa10c00',
  'land-1': 'photo-1500534314209-a25ddb2bd429',
  'land-2': 'photo-1464822759023-fed622ff2c3b',
  'land-3': 'photo-1510798831971-661eb04b3739',
  'industrial-1': 'photo-1513828583688-c52646db42da',
  'industrial-2': 'photo-1558618666-fcd25c85cd64',
  'mixed-1': 'photo-1486325212027-8081e485255e',
  'hero-1': 'photo-1600585154526-990dced4db0d',
  'hero-2': 'photo-1600047509807-ba8f99d2cdde',
}

// Gradient fallbacks by property type — always renders something
const GRADIENT_FALLBACKS: Record<string, string> = {
  residential: 'linear-gradient(135deg, #1A1528 0%, #2A1F35 40%, #1A2030 100%)',
  commercial: 'linear-gradient(135deg, #0F1A1F 0%, #162028 40%, #1A1528 100%)',
  land: 'linear-gradient(135deg, #101A10 0%, #18271A 40%, #1A1F15 100%)',
  industrial: 'linear-gradient(135deg, #1A1210 0%, #261A14 40%, #201818 100%)',
  mixed: 'linear-gradient(135deg, #0F0F1A 0%, #1A1528 40%, #141528 100%)',
  default: 'linear-gradient(135deg, #0A0A0F 0%, #141420 50%, #1A1528 100%)',
}

type ImageSlot = keyof typeof PLACEHOLDER_PHOTOS
type PropertyType = 'residential' | 'commercial' | 'land' | 'industrial' | 'mixed'

interface PlaceholderImageProps {
  slot?: ImageSlot
  propertyType?: PropertyType
  alt: string
  className?: string
  priority?: boolean
  fill?: boolean
  width?: number
  height?: number
}

export function PlaceholderImage({
  slot,
  propertyType = 'residential',
  alt,
  className,
  priority = false,
  fill = true,
  width,
  height,
}: PlaceholderImageProps) {
  // Determine gradient for CSS fallback
  const gradient = GRADIENT_FALLBACKS[propertyType] ?? GRADIENT_FALLBACKS.default

  // Try Unsplash URL if slot is provided
  if (slot && PLACEHOLDER_PHOTOS[slot]) {
    const photoId = PLACEHOLDER_PHOTOS[slot]
    const unsplashUrl = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`

    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image
          src={unsplashUrl}
          alt={alt}
          fill={fill}
          width={!fill ? (width ?? 800) : undefined}
          height={!fill ? (height ?? 600) : undefined}
          className="object-cover"
          priority={priority}
          // Blurred gradient while loading — matches TIGI dark tone
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="#111118"/></svg>`
          )}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Subtle dark vignette overlay — blends images into dark UI */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/30 via-transparent to-transparent pointer-events-none" />
      </div>
    )
  }

  // Fallback: CSS gradient that looks like a premium dark property image
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      role="img"
      aria-label={alt}
    >
      <div
        className="absolute inset-0"
        style={{ background: gradient }}
      />
      {/* Geometric pattern overlay — looks architectural */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(201, 168, 76, 1) 20px,
            rgba(201, 168, 76, 1) 21px
          )`,
        }}
      />
      {/* Property type label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <PropertyTypeIcon type={propertyType} />
      </div>
    </div>
  )
}

// Minimal dark icon for CSS-only placeholder
function PropertyTypeIcon({ type }: { type: PropertyType }) {
  const icons: Record<PropertyType, string> = {
    residential: '⌂',
    commercial: '▣',
    land: '◈',
    industrial: '▦',
    mixed: '⊞',
  }

  return (
    <span className="text-[40px] opacity-10 select-none" aria-hidden>
      {icons[type]}
    </span>
  )
}

// ---------------------------------------------------------------------------
// InitialsAvatar — For user avatars (no photo uploaded yet)
// Gold circle with initials — see design-principles.md §10.2
// ---------------------------------------------------------------------------

interface InitialsAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function InitialsAvatar({ name, size = 'md', className }: InitialsAvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  const sizeClasses = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-md bg-[#C9A84C] font-heading font-semibold text-[#0A0A0F]',
        sizeClasses[size],
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  )
}
