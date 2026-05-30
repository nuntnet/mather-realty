import Image from "next/image";
import { BRAND_BY_SLUG, type BrandSlug } from "@/lib/brandConfig";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  xs: { box: "h-8 w-[72px]", pad: "p-1" },
  sm: { box: "h-10 w-[88px]", pad: "p-1.5" },
  md: { box: "h-12 w-[104px]", pad: "p-2" },
  lg: { box: "h-14 w-[120px]", pad: "p-2" },
} as const;

export type BrandLogoSize = keyof typeof SIZE_CLASSES;

interface BrandLogoProps {
  src: string;
  alt: string;
  brandSlug?: BrandSlug;
  /** Overrides brandConfig.logoScale when set */
  scale?: number;
  size?: BrandLogoSize;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/** Brand wordmark in a uniform box — self-hosted assets in /public/brands */
export default function BrandLogo({
  src,
  alt,
  brandSlug,
  scale,
  size = "md",
  className,
  containerClassName,
  width = 120,
  height = 40,
  priority = false,
}: BrandLogoProps) {
  const logoScale =
    scale ?? (brandSlug ? BRAND_BY_SLUG[brandSlug].logoScale : undefined) ?? 1;
  const { box, pad } = SIZE_CLASSES[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        box,
        pad,
        containerClassName
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn("max-h-full max-w-full object-contain", className)}
        style={{ transform: logoScale !== 1 ? `scale(${logoScale})` : undefined }}
      />
    </div>
  );
}
