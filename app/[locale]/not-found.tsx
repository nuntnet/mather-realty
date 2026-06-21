import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg w-full">
        {/* House illustration */}
        <div
          className="text-8xl mb-6 select-none"
          role="img"
          aria-label="House"
        >
          🏠
        </div>

        {/* 404 label */}
        <p className="text-sm font-semibold uppercase tracking-widest text-[#2A8A88] mb-2">
          404 — Not Found
        </p>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
          This page doesn&apos;t exist
        </h1>

        {/* Description */}
        <p className="text-gray-500 mb-10 text-base leading-relaxed max-w-sm mx-auto">
          The page you&apos;re looking for may have been moved, renamed, or is no longer available.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto gap-2 h-12 text-base bg-gradient-to-r from-[#1E6B69] to-[#2A8A88] hover:from-[#18605E] hover:to-[#1E6B69] text-white border-0"
          >
            <Link href="/">
              <Home className="h-5 w-5" />
              Back to home
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            size="lg"
            className="w-full sm:w-auto gap-2 h-12 text-base"
          >
            <Link href="/properties">
              <Search className="h-5 w-5" />
              Browse properties
            </Link>
          </Button>
        </div>

        {/* Subtle brand */}
        <p className="mt-12 text-xs text-gray-300 font-medium tracking-wide">
          DoubleN Realty
        </p>
      </div>
    </div>
  )
}
