import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/** Brand wordmark from self-hosted SVG in /public/brands */
export default function BrandLogo({
  src,
  alt,
  className,
  width = 120,
  height = 40,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}
