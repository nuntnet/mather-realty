import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showText?: boolean;
}

const sizeConfig = {
  sm: { monogram: "h-7 w-7 text-xs rounded-md", text: "text-base", gap: "gap-2" },
  md: { monogram: "h-9 w-9 text-sm rounded-lg", text: "text-lg", gap: "gap-2.5" },
  lg: { monogram: "h-12 w-12 text-base rounded-xl", text: "text-2xl", gap: "gap-3" },
};

export default function Logo({
  size = "md",
  variant = "dark",
  showText = true,
}: LogoProps) {
  const cfg = sizeConfig[size];

  return (
    <span className={cn("flex items-center", cfg.gap)}>
      {/* 2N monogram */}
      <span
        className={cn(
          "flex items-center justify-center bg-[#1E6B69] text-white font-black select-none shrink-0",
          cfg.monogram
        )}
      >
        2N
      </span>

      {/* Wordmark */}
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight leading-none",
            cfg.text,
            variant === "light" ? "text-white" : "text-gray-900"
          )}
        >
          Mather
        </span>
      )}
    </span>
  );
}
