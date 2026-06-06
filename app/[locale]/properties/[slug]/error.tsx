'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function PropertyDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
          <AlertTriangle className="h-10 w-10 text-orange-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Could not load this property
        </h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          There was a problem displaying this property listing. Please try again or browse other properties.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset} className="w-full sm:w-auto gap-2 h-11">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto gap-2 h-11">
            <Link href="/properties">
              <ArrowLeft className="h-4 w-4" />
              Back to listings
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
