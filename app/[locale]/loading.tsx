export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-[85vh] min-h-[520px] bg-gray-200" />

      {/* Search bar skeleton */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="h-16 bg-white rounded-2xl shadow-lg" />
      </div>

      {/* Featured properties section */}
      <section className="container mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* How it works skeleton */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="h-8 w-56 bg-gray-200 rounded-lg mx-auto mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-gray-200" />
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-48 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm">
      <div className="h-1 w-full bg-gray-200" />
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-100 rounded" />
        <div className="h-7 w-2/3 bg-gray-200 rounded" />
        <div className="flex gap-4">
          <div className="h-4 w-10 bg-gray-100 rounded" />
          <div className="h-4 w-10 bg-gray-100 rounded" />
          <div className="h-4 w-14 bg-gray-100 rounded" />
        </div>
        <div className="h-11 w-full bg-gray-200 rounded-md mt-1" />
      </div>
    </div>
  )
}
