"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface PersonaSectionProps {
  perfectFor: string[]
  personaDescriptions: Record<string, string> | null
  propertySlug: string
}

const PERSONAS: Record<string, { label: string; emoji: string; color: string; fallback: string }> = {
  "teacher": {
    label: "International School Teachers",
    emoji: "👩‍🏫",
    color: "bg-blue-50 border-blue-200 text-blue-800",
    fallback: "Conveniently located near several international schools in the Bangna area.",
  },
  "expat-couple": {
    label: "Expat Couples",
    emoji: "👫",
    color: "bg-pink-50 border-pink-200 text-pink-800",
    fallback: "A comfortable, fully-furnished home perfect for couples starting life in Bangkok.",
  },
  "family": {
    label: "Families",
    emoji: "👨‍👩‍👧",
    color: "bg-green-50 border-green-200 text-green-800",
    fallback: "Spacious home with community amenities ideal for families with children.",
  },
  "airline-crew": {
    label: "Airline Crew",
    emoji: "✈️",
    color: "bg-orange-50 border-orange-200 text-orange-800",
    fallback: "Convenient access to Suvarnabhumi Airport for airline professionals.",
  },
  "remote-worker": {
    label: "Remote Workers",
    emoji: "💻",
    color: "bg-purple-50 border-purple-200 text-purple-800",
    fallback: "Quiet, comfortable space with amenities for productive remote work.",
  },
  "digital-nomad": {
    label: "Digital Nomads",
    emoji: "🌏",
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    fallback: "Flexible, fully-furnished option for location-independent professionals.",
  },
  "business-expat": {
    label: "Business Expats",
    emoji: "💼",
    color: "bg-gray-50 border-gray-200 text-gray-800",
    fallback: "Professional address in Bangkok's sought-after Bangna corridor.",
  },
}

export default function PersonaSection({
  perfectFor,
  personaDescriptions,
  propertySlug,
}: PersonaSectionProps) {
  const validPersonas = perfectFor.filter((p) => PERSONAS[p])
  const [activePersona, setActivePersona] = useState<string>(validPersonas[0] ?? "")

  if (validPersonas.length === 0) return null

  const active = PERSONAS[activePersona]
  const activeColor = active?.color ?? "bg-gray-50 border-gray-200 text-gray-800"

  const descriptionText =
    personaDescriptions?.[activePersona] ?? active?.fallback ?? ""

  const isGenerating = personaDescriptions === null

  return (
    <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 md:p-8">
      <h2 className="mb-5 text-xl font-semibold text-gray-900">
        🎯 Who is this home perfect for?
      </h2>

      {/* Persona tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {validPersonas.map((key) => {
          const persona = PERSONAS[key]
          if (!persona) return null
          const isActive = key === activePersona
          return (
            <button
              key={key}
              onClick={() => setActivePersona(key)}
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? `${persona.color} shadow-sm ring-2 ring-offset-1 ring-indigo-300`
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              <span>{persona.emoji}</span>
              <span>{persona.label}</span>
            </button>
          )
        })}
      </div>

      {/* Description panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePersona}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={[
            "rounded-xl border p-4 md:p-5",
            activeColor,
          ].join(" ")}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2 text-sm opacity-60">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Generating personalised description…</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed md:text-base">{descriptionText}</p>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
