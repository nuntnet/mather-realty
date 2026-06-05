'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { addDays, isBefore, isAfter, isWithinInterval, parseISO, startOfDay, format } from 'date-fns'
import { CalendarDays, CheckCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import 'react-day-picker/dist/style.css'

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
  try { return startOfDay(parseISO(dateStr)) }
  catch { return startOfDay(new Date(dateStr)) }
}

export default function AvailabilityCalendar({
  propertyId: _propertyId,
  blockedRanges,
  availableFrom,
}: AvailabilityCalendarProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const today = useMemo(() => startOfDay(new Date()), [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  const availableFromDate = useMemo(
    () => (availableFrom ? parseDateSafe(availableFrom) : today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableFrom],
  )

  const blockedIntervals = useMemo(
    () => blockedRanges.map(r => ({
      start: parseDateSafe(r.start),
      end: parseDateSafe(r.end),
    })),
    [blockedRanges],
  )

  const isBlocked = (date: Date) =>
    blockedIntervals.some(iv => isWithinInterval(date, { start: iv.start, end: iv.end }))

  const isBeforeAvailability = (date: Date) => isBefore(date, availableFromDate)

  const disabled = (date: Date) => isBeforeAvailability(date) || isBlocked(date)

  const modifiers = useMemo(() => ({
    blocked: (date: Date) => isBlocked(date),
    available: (date: Date) =>
      !isBlocked(date) &&
      !isBeforeAvailability(date) &&
      isAfter(date, addDays(today, -1)),
    past: (date: Date) => isBefore(date, today) && !isBlocked(date),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [blockedIntervals, availableFromDate])

  const nextAvailable = isAfter(availableFromDate, today) ? availableFromDate : today

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-xl p-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-800">Available from</p>
            <p className="text-sm font-bold text-green-700">
              {!mounted
                ? '—'
                : isAfter(availableFromDate, today)
                  ? format(availableFromDate, 'dd MMM yyyy')
                  : 'Now'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3">
          <CalendarDays className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-800">Min. rental</p>
            <p className="text-sm font-bold text-blue-700">1 month</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="px-5 pt-4 pb-2 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            Availability Calendar
          </h3>
        </div>

        <div className="px-4 pb-4 pt-2">
          {!mounted ? (
            <div className="space-y-2 py-2">
              <Skeleton className="h-7 w-40 mb-3" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <style>{`
                /* ── react-day-picker v9 full-width override ── */

                /* Root: accent colour, no margin */
                .rdp-root {
                  --rdp-accent-color: #46a758;
                  width: 100%;
                  margin: 0;
                }

                /* Kill the fit-content cap that causes the right gap */
                .rdp-months {
                  width: 100%;
                  max-width: 100%;
                }
                .rdp-month { width: 100%; }

                /* Table stretches to fill its container */
                .rdp-month_grid {
                  width: 100%;
                  table-layout: fixed;
                  border-collapse: collapse;
                }

                /* Weekday header row */
                .rdp-weekday {
                  opacity: 1;
                  color: #898e87;
                  font-size: 11px;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  padding: 4px 0;
                  text-align: center;
                }

                /* Day cells — let table-layout:fixed size the columns */
                .rdp-day {
                  width: auto;
                  height: 40px;
                  padding: 2px;
                  text-align: center;
                }

                /* Day buttons fill the cell */
                .rdp-day_button {
                  width: 100%;
                  height: 36px;
                  border-radius: 8px;
                  font-size: 13px;
                  font-weight: 500;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: none;
                  background: none;
                }

                /* Today highlight */
                .rdp-today:not(.rdp-selected) .rdp-day_button {
                  font-weight: 800;
                  color: #46a758;
                  border: 1.5px solid #46a758;
                }

                /* Nav buttons */
                .rdp-button_previous,
                .rdp-button_next {
                  border-radius: 8px;
                  width: 32px;
                  height: 32px;
                }

                /* Caption */
                .rdp-month_caption { margin-bottom: 8px; }
                .rdp-caption_label {
                  font-size: 14px;
                  font-weight: 700;
                  color: #1d211c;
                }

                /* ── Custom day-state colours ── */

                /* Available — green */
                .rdp-day_available .rdp-day_button {
                  background: #daf6da !important;
                  color: #297c3b !important;
                }
                .rdp-day_available .rdp-day_button:hover {
                  background: #c9f0ca !important;
                }

                /* Blocked — red strikethrough */
                .rdp-day_blocked .rdp-day_button {
                  background: #fee2e2 !important;
                  color: #b91c1c !important;
                  text-decoration: line-through;
                  text-decoration-color: #ef4444;
                }

                /* Past — faded */
                .rdp-day_past .rdp-day_button { opacity: 0.3; }

                /* Disabled (before available-from) */
                .rdp-disabled .rdp-day_button {
                  background: transparent !important;
                  color: #cdd1cb !important;
                  cursor: not-allowed;
                }
              `}</style>

              <DayPicker
                mode="single"
                disabled={disabled}
                modifiers={modifiers}
                modifiersClassNames={{
                  blocked: 'rdp-day_blocked',
                  available: 'rdp-day_available',
                  past: 'rdp-day_past',
                }}
                fromDate={today}
                defaultMonth={nextAvailable}
                showOutsideDays={false}
              />
            </>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="size-3 rounded bg-green-100 border border-green-300" />
            Available
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="size-3 rounded bg-red-100 border border-red-300" />
            Booked
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="size-3 rounded bg-gray-100 border border-gray-200" />
            Unavailable
          </span>
        </div>
      </div>
    </div>
  )
}
