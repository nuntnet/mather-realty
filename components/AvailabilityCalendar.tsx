'use client'

import React, { useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import { addDays, isBefore, isAfter, isWithinInterval, parseISO, startOfDay, format } from 'date-fns'
import { CalendarDays, CheckCircle, XCircle } from 'lucide-react'
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
  const today = startOfDay(new Date())

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
              {isAfter(availableFromDate, today)
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

        <div className="p-4">
          <style>{`
            /* Override react-day-picker for clean look */
            .rdp { --rdp-cell-size: 38px; margin: 0; }
            .rdp-month { width: 100%; }
            .rdp-table { width: 100%; }
            .rdp-head_cell { color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; padding-bottom: 8px; }
            .rdp-button { border-radius: 8px; font-size: 13px; font-weight: 500; }
            .rdp-day_today:not(.rdp-day_selected) { font-weight: 700; color: #2563eb; }
            .rdp-nav_button { border-radius: 8px; }
            .rdp-caption_label { font-size: 15px; font-weight: 700; color: #111827; }

            /* Blocked dates */
            .rdp-day_blocked .rdp-button {
              background: #fee2e2 !important;
              color: #b91c1c !important;
              text-decoration: line-through;
            }

            /* Available dates */
            .rdp-day_available .rdp-button:not(:disabled) {
              background: #dcfce7 !important;
              color: #15803d !important;
            }
            .rdp-day_available .rdp-button:not(:disabled):hover {
              background: #bbf7d0 !important;
            }

            /* Past dates */
            .rdp-day_past .rdp-button {
              opacity: 0.35;
            }

            /* Disabled (before available) */
            .rdp-day_disabled .rdp-button {
              background: #f9fafb;
              color: #d1d5db;
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
