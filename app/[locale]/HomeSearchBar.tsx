'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import SearchBar from '@/components/SearchBar'
import { useParams } from 'next/navigation'

interface HomeSearchBarProps {
  locale: string
  className?: string
}

export default function HomeSearchBar({ locale, className }: HomeSearchBarProps) {
  const router = useRouter()

  const handleSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        router.push(`/${locale}/properties`)
        return
      }
      router.push(`/${locale}/properties?q=${encodeURIComponent(q)}`)
    },
    [locale, router]
  )

  return <SearchBar onSearch={handleSearch} className={className} />
}
