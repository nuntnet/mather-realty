'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; href: string }
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-24 px-6',
        className,
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35, ease: 'backOut' }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"
      >
        {icon ?? <SearchX className="h-9 w-9 text-gray-400" />}
      </motion.div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}

      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </motion.div>
  )
}
