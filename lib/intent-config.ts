export const PERSONAS = [
  'teacher',
  'expat-couple',
  'family',
  'airline-crew',
  'remote-worker',
  'digital-nomad',
  'business-expat',
] as const

export type Persona = (typeof PERSONAS)[number]

export interface IntentConfig {
  title: string
  subtitle: string
  headline: string
  description: string
  keywords: string[]
  metaTitle: string
  metaDesc: string
  emoji: string
  color: string
  bgClass: string
}

export const INTENT_CONFIG: Record<Persona, IntentConfig> = {
  teacher: {
    title: 'Homes for International School Teachers',
    subtitle: "Furnished rentals near Bangkok's top international schools",
    headline: 'Find Your Home Near School',
    emoji: '👩‍🏫',
    description:
      'As an international school teacher, you deserve a comfortable, fully-furnished home close to work. Browse properties near Concordian, D-PREP, Bangkok Pattana, NIST, and more.',
    keywords: ['teacher housing bangkok', 'rent near international school', 'expat teacher accommodation'],
    metaTitle: 'Rental Homes for International School Teachers in Bangkok',
    metaDesc:
      "Furnished rental properties near Bangkok's top international schools. For teachers at Concordian, D-PREP, Bangkok Pattana, NIST. Move in ready.",
    color: 'text-blue-700',
    bgClass: 'from-blue-50 to-indigo-50',
  },
  'expat-couple': {
    title: 'Homes for Expat Couples in Bangkok',
    subtitle: 'Comfortable rentals for couples starting life in Thailand',
    headline: 'Perfect for Couples Relocating',
    emoji: '👫',
    description:
      'Starting fresh in Bangkok? These furnished properties are perfect for expat couples — with community amenities, easy maintenance, and vibrant neighbourhoods.',
    keywords: ['expat couple housing bangkok', 'rent for couples thailand', 'furnished apartment couple'],
    metaTitle: 'Rental Properties for Expat Couples in Bangkok, Thailand',
    metaDesc:
      'Find furnished homes for couples in Bangkok. Great neighbourhoods, community amenities, no setup hassle.',
    color: 'text-pink-700',
    bgClass: 'from-pink-50 to-rose-50',
  },
  family: {
    title: 'Family Homes for Rent in Bangkok',
    subtitle: 'Spacious rentals for families with children',
    headline: 'Family-Friendly Rentals',
    emoji: '👨‍👩‍👧',
    description:
      'Looking for a family home in Bangkok? Our properties offer space, safety, proximity to international schools, and community facilities like pools and playgrounds.',
    keywords: ['family home rent bangkok', 'house for family expat', 'school near rental property'],
    metaTitle: 'Family Homes for Rent in Bangkok | Near International Schools',
    metaDesc:
      'Spacious, family-friendly rental homes in Bangkok. Near international schools, pools, safe communities.',
    color: 'text-green-700',
    bgClass: 'from-green-50 to-emerald-50',
  },
  'airline-crew': {
    title: 'Rentals for Airline Crew Near Suvarnabhumi',
    subtitle: 'Comfortable layover and long-stay accommodation',
    headline: 'Homes Near Suvarnabhumi Airport',
    emoji: '✈️',
    description:
      'Based in Bangkok? Find comfortable, easy-commute homes near Suvarnabhumi Airport. Fully furnished, secure communities, and flexible leases.',
    keywords: ['airline crew housing bangkok', 'rent near suvarnabhumi', 'pilot accommodation bangkok'],
    metaTitle: 'Rentals for Airline Crew Near Suvarnabhumi Airport Bangkok',
    metaDesc:
      'Furnished homes for airline crew near Suvarnabhumi Airport. Easy commute, secure communities, flexible leases.',
    color: 'text-orange-700',
    bgClass: 'from-orange-50 to-amber-50',
  },
  'remote-worker': {
    title: 'Homes for Remote Workers in Bangkok',
    subtitle: 'Quiet, comfortable spaces to work from home',
    headline: 'Work From Home in Bangkok',
    emoji: '💻',
    description:
      'Remote work from Bangkok? Our properties offer the quiet, comfort, and infrastructure you need — plus the lifestyle that makes Thailand a top remote work destination.',
    keywords: ['remote work home bangkok', 'wfh apartment thailand', 'work from home expat'],
    metaTitle: 'Rental Homes for Remote Workers in Bangkok, Thailand',
    metaDesc:
      'Comfortable homes for remote workers in Bangkok. Quiet, furnished, great lifestyle — ideal work-from-Thailand base.',
    color: 'text-purple-700',
    bgClass: 'from-purple-50 to-violet-50',
  },
  'digital-nomad': {
    title: 'Rentals for Digital Nomads in Bangkok',
    subtitle: 'Flexible, furnished homes for location-independent professionals',
    headline: 'Bangkok Base for Nomads',
    emoji: '🌏',
    description:
      'Bangkok is a top destination for digital nomads. Find fully-furnished, short-term friendly rentals with all the infrastructure you need to work and explore.',
    keywords: ['digital nomad accommodation bangkok', 'nomad housing thailand', 'flexible rent bangkok'],
    metaTitle: 'Rentals for Digital Nomads in Bangkok | Flexible Furnished Homes',
    metaDesc: 'Furnished, flexible rentals for digital nomads in Bangkok. Everything included, short-term friendly.',
    color: 'text-yellow-700',
    bgClass: 'from-yellow-50 to-amber-50',
  },
  'business-expat': {
    title: 'Premium Rentals for Business Expats in Bangkok',
    subtitle: "Professional homes in Bangkok's business corridors",
    headline: 'Executive Living in Bangkok',
    emoji: '💼',
    description:
      'Relocating for work? Our premium rentals offer professional addresses, easy access to business districts, and all the comforts of home.',
    keywords: ['business expat housing bangkok', 'executive rental thailand', 'corporate housing bangkok'],
    metaTitle: 'Executive Homes for Business Expats in Bangkok, Thailand',
    metaDesc:
      'Premium furnished rentals for business expats in Bangkok. Professional addresses, easy commute, luxury amenities.',
    color: 'text-gray-800',
    bgClass: 'from-gray-50 to-slate-100',
  },
}
