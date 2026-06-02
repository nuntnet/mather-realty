'use client'

import React, { useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { addDays, isBefore, isAfter, isWithinInterval, parseISO, startOfDay } from 'date-fns'

interface BlockedRange {
  start: string
  end: string
}

interface AvailabilityCalendarProps {
  propertyId: string
  blockedRanges: BlockedRange[]
  availableFrom?: string
}

function parseDateSafe(dateStr: string): Date {
  try {
    return startOfDay(parseISO(dateStr))
  } catch {
    return startOfDay(new Date(dateStr))
  }
}

export default function AvailabilityCalendar({
  propertyId: _propertyId,
  blockedRanges,
  availableFrom,
}: AvailabilityCalendarProps) {
  const today = startOfDay(new Date())

  const availableFromDate = useMemo(
    () => (availableFrom ? parseDateSafe(availableFrom) : today),
    [availableFrom, today],
  )

  const blockedIntervals = useMemo(
    () =>
      blockedRanges.map((r) => ({
        start: parseDateSafe(r.start),
        end: parseDateSafe(r.end),
      })),
    [blockedRanges],
  )

  function isBlocked(date: Date): boolean {
    return blockedIntervals.some((interval) =>
      isWithinInterval(date, { start: interval.start, end: interval.end }),
    )
  }

  function isBeforeAvailability(date: Date): boolean {
    return isBefore(date, availableFromDate)
  }

  const disabledMatcher = (date: Date): boolean => {
    return isBeforeAvailability(date) || isBlocked(date)
  }

  // Modifiers for styling
  const modifiers = useMemo(() => {
    return {
      blocked: (date: Date) => isBlocked(date),
      available: (date: Date) =>
        !isBlocked(date) && !isBeforeAvailability(date) && isAfter(date, addDays(today, -1)),
      past: (date: Date) => isBefore(date, today),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockedIntervals, availableFromDate, today])

  const modifiersClassNames = {
    blocked: 'rdp-day--blocked',
    available: 'rdp-day--available',
    past: 'rdp-day--past',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 w-fit">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Availability</h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-green-100 border border-green-300 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-red-100 border border-red-300 inline-block" />
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-gray-100 border border-gray-200 inline-block" />
          Unavailable
        </span>
      </div>

      <style>{`
        .rdp-day--blocked button {
          background-color: rgb(254 226 226) !important;
          color: rgb(185 28 28) !important;
          pointer-events: none;
          border-radius: 0.375rem;
        }
        .rdp-day--available button:not(:disabled):not([aria-selected="true"]) {
          background-color: rgb(220 252 231) !important;
          color: rgb(21 128 61) !important;
        }
        .rdp-day--available button:not(:disabled):hover {
          background-color: rgb(187 247 208) !important;
        }
        .rdp-day--past button {
          opacity: 0.4;
        }
      `}</style>

      <Calendar
        mode="single"
        disabled={disabledMatcher}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        fromDate={today}
        defaultMonth={availableFromDate < today ? today : availableFromDate}
        showOutsideDays={false}
        className="p-0"
      />

      {availableFrom && isAfter(availableFromDate, today) && (
        <p className="mt-3 text-xs text-orange-700 bg-orange-50 rounded-lg px-3 py-2 border border-orange-100">
          Available from{' '}
          {availableFromDate.toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
    </div>
  )
}
