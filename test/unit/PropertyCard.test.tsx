// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PropertyCard from '@/components/PropertyCard'

// Mock next-intl: return translation key as value
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Provide a working localStorage stub since jsdom's version may be incomplete
// in some vitest environments (bun --localstorage-file warning)
const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { localStorageStore[key] = value },
  removeItem: (key: string) => { delete localStorageStore[key] },
  clear: () => { for (const k in localStorageStore) delete localStorageStore[k] },
}
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
}

// Mock @/i18n/navigation Link — render as a plain <a>
vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    className,
    tabIndex,
    'aria-hidden': ariaHidden,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    className?: string
    tabIndex?: number
    'aria-hidden'?: boolean | string
    locale?: string
    [key: string]: unknown
  }) => (
    <a
      href={href}
      className={className}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden ? 'true' : undefined}
      {...rest}
    >
      {children}
    </a>
  ),
}))

// Minimal stub for next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const baseProperty = {
  id: 'prop-1',
  slug: 'luxury-condo-sukhumvit',
  title: { en: 'Luxury Condo Sukhumvit', th: 'คอนโดหรู สุขุมวิท' },
  city: 'Bangkok',
  district: 'Watthana',
  priceTHB: 45000,
  bedrooms: 2,
  bathrooms: 2,
  sizeSqm: 65,
  coverImage: 'https://example.com/image.jpg',
  status: 'available',
  amenities: ['pool', 'gym', 'parking'],
  tags: ['Condo'],
  verifiedAt: null,
  availableFrom: null,
  listingScore: 90,
}

beforeEach(() => {
  // Clear saved_properties so tests start with clean slate
  localStorageMock.clear()
})

describe('PropertyCard', () => {
  it('renders property title in the given locale', () => {
    render(<PropertyCard property={baseProperty} locale="en" />)
    expect(screen.getByText('Luxury Condo Sukhumvit')).toBeInTheDocument()
  })

  it('renders title in Thai when locale is th', () => {
    render(<PropertyCard property={baseProperty} locale="th" />)
    expect(screen.getByText('คอนโดหรู สุขุมวิท')).toBeInTheDocument()
  })

  it('shows formatted price', () => {
    render(<PropertyCard property={baseProperty} locale="en" />)
    // Intl.NumberFormat with THB — contains "45,000" regardless of locale symbol
    const priceEl = screen.getByText(/45[,.]?000/)
    expect(priceEl).toBeInTheDocument()
  })

  it('applies the correct status badge class for available', () => {
    const { container } = render(<PropertyCard property={baseProperty} locale="en" />)
    // Status badge span should contain green classes
    const badge = container.querySelector('.bg-green-100')
    expect(badge).not.toBeNull()
  })

  it('applies the correct status badge class for rented', () => {
    const rentedProp = { ...baseProperty, status: 'rented' }
    const { container } = render(<PropertyCard property={rentedProp} locale="en" />)
    const badge = container.querySelector('.bg-gray-100')
    expect(badge).not.toBeNull()
  })

  it('applies the correct status badge class for coming_soon', () => {
    const comingSoonProp = { ...baseProperty, status: 'coming_soon' }
    const { container } = render(<PropertyCard property={comingSoonProp} locale="en" />)
    const badge = container.querySelector('.bg-orange-100')
    expect(badge).not.toBeNull()
  })

  it('save button toggles saved state', () => {
    render(<PropertyCard property={baseProperty} locale="en" />)
    // Initially not saved — aria-label should be "save"
    const saveBtn = screen.getByRole('button', { name: /save/i })
    expect(saveBtn).toBeInTheDocument()

    fireEvent.click(saveBtn)

    // After click — should now be "unsave"
    expect(screen.getByRole('button', { name: /unsave/i })).toBeInTheDocument()
  })

  it('save button toggles back to unsaved on second click', () => {
    render(<PropertyCard property={baseProperty} locale="en" />)
    const saveBtn = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveBtn)
    const unsaveBtn = screen.getByRole('button', { name: /unsave/i })
    fireEvent.click(unsaveBtn)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('card title link points to the correct property detail URL', () => {
    render(<PropertyCard property={baseProperty} locale="en" />)
    const titleLink = screen.getByRole('link', { name: 'Luxury Condo Sukhumvit' })
    expect(titleLink).toHaveAttribute('href', '/properties/luxury-condo-sukhumvit')
  })

  it('shows the property type tag badge when tags are present', () => {
    render(<PropertyCard property={baseProperty} locale="en" />)
    expect(screen.getByText('Condo')).toBeInTheDocument()
  })
})
