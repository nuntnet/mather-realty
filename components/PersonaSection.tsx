"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Users } from "lucide-react"

interface PersonaSectionProps {
  perfectFor: string[]
  personaDescriptions: Record<string, string> | null
  propertySlug: string
}

const PERSONAS: Record<string, { label: string; emoji: string; color: string; fallback: string }> = {
  "teacher": {
    label: "International School Teachers",
    emoji: "👩‍🏫",
    color: "bg-[#E8F6F5] border-[#A7D8D6] text-[#124E4C]",
    fallback: "Conveniently located near several international schools in the Bangna area.",
  },
  "expat-couple": {
    label: "Expat Couples",
    emoji: "👫",
    color: "bg-[#E8F6F5] border-[#A7D8D6] text-[#124E4C]",
    fallback: "A comfortable, fully-furnished home perfect for couples starting life in Bangkok.",
  },
  "family": {
    label: "Families",
    emoji: "👨‍👩‍👧",
    color: "bg-[#E8F6F5] border-[#A7D8D6] text-[#124E4C]",
    fallback: "Spacious home with community amenities ideal for families with children.",
  },
  "airline-crew": {
    label: "Airline Crew",
    emoji: "✈️",
    color: "bg-[#E8F6F5] border-[#A7D8D6] text-[#124E4C]",
    fallback: "Convenient access to Suvarnabhumi Airport for airline professionals.",
  },
  "remote-worker": {
    label: "Remote Workers",
    emoji: "💻",
    color: "bg-[#E8F6F5] border-[#A7D8D6] text-[#124E4C]",
    fallback: "Quiet, comfortable space with amenities for productive remote work.",
  },
  "digital-nomad": {
    label: "Digital Nomads",
    emoji: "🌏",
    color: "bg-[#E8F6F5] border-[#A7D8D6] text-[#124E4C]",
    fallback: "Flexible, fully-furnished option for location-independent professionals.",
  },
  "business-expat": {
    label: "Business Expats",
    emoji: "💼",
    color: "bg-[#E8F6F5] border-[#A7D8D6] text-[#124E4C]",
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
  const activeColor = active?.color ?? "bg-[#E8F6F5] border-[#A7D8D6] text-[#124E4C]"

  const descriptionText =
    personaDescriptions?.[activePersona] ?? active?.fallback ?? ""

  const isGenerating = personaDescriptions === null

  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#E8F6F5] to-[#F7F4EF] p-6 md:p-8">
      <h2 className="mb-5 flex items-center gap-2.5 font-serif text-2xl text-[#1A2624]">
        <Users className="size-5 text-[#1E6B69]" strokeWidth={1.5} />
        Who is this home perfect for?
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
                  ? `${persona.color} shadow-sm ring-2 ring-offset-1 ring-[#7FCECC]`
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
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
