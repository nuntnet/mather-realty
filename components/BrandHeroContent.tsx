"use client";

import { motion } from "framer-motion";

interface BrandHeroContentProps {
  children: React.ReactNode;
  className?: string;
}

/** Subtle fade/slide for brand hero copy — keeps background on the server. */
export default function BrandHeroContent({
  children,
  className,
}: BrandHeroContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
