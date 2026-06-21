export default function PropertiesLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header */}
      <div className="bg-gray-50 border-b py-8">
        <div className="container mx-auto px-4">
          <div className="h-9 w-48 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar skeleton */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col gap-4">
              <div className="h-5 w-24 bg-gray-200 rounded" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                  <div className="h-10 w-full bg-gray-100 rounded-lg" />
                </div>
              ))}
              <div className="h-11 w-full bg-[#cde9e8] rounded-lg mt-2" />
            </div>
          </aside>

          {/* Property grid skeleton */}
          <main className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="h-4 w-36 bg-gray-100 rounded" />
              <div className="h-9 w-32 bg-gray-100 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </main>
        </div>
      </div>
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
        <div className="flex gap-2 mt-1">
          <div className="h-6 w-16 bg-gray-100 rounded-full" />
          <div className="h-6 w-16 bg-gray-100 rounded-full" />
          <div className="h-6 w-10 bg-gray-100 rounded-full" />
        </div>
        <div className="h-11 w-full bg-gray-200 rounded-md" />
      </div>
    </div>
  )
}
