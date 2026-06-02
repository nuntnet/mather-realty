export default function PropertyDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Gallery skeleton */}
      <div className="w-full aspect-[16/9] max-h-[520px] bg-gray-200" />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Title + location */}
            <div className="flex flex-col gap-2">
              <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
              <div className="h-5 w-1/2 bg-gray-100 rounded" />
              {/* Status + badges */}
              <div className="flex gap-2 mt-1">
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 border-y py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="h-5 w-8 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-3">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: i === 3 ? '60%' : '100%' }} />
              ))}
            </div>

            {/* Amenities */}
            <div className="flex flex-col gap-3">
              <div className="h-6 w-28 bg-gray-200 rounded" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-7 w-24 bg-gray-100 rounded-full" />
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden">
              <div className="h-6 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-64 w-full bg-gray-200 rounded-xl" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Price card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <div className="h-9 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-11 w-full bg-blue-100 rounded-lg" />
              <div className="h-11 w-full bg-gray-100 rounded-lg" />
            </div>

            {/* Availability calendar */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
              <div className="h-48 w-full bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
