"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocaleConfig {
  code: string;
  flag: string;
  shortCode: string;
  nativeName: string;
}

const LOCALES: LocaleConfig[] = [
  { code: "en", flag: "🇺🇸", shortCode: "EN", nativeName: "English" },
  { code: "th", flag: "🇹🇭", shortCode: "TH", nativeName: "ภาษาไทย" },
  { code: "zh-CN", flag: "🇨🇳", shortCode: "CN", nativeName: "简体中文" },
  { code: "zh-TW", flag: "🇹🇼", shortCode: "TW", nativeName: "繁體中文" },
  { code: "ja", flag: "🇯🇵", shortCode: "JA", nativeName: "日本語" },
  { code: "ko", flag: "🇰🇷", shortCode: "KO", nativeName: "한국어" },
  { code: "ru", flag: "🇷🇺", shortCode: "RU", nativeName: "Русский" },
  { code: "de", flag: "🇩🇪", shortCode: "DE", nativeName: "Deutsch" },
  { code: "fr", flag: "🇫🇷", shortCode: "FR", nativeName: "Français" },
  { code: "es", flag: "🇪🇸", shortCode: "ES", nativeName: "Español" },
  { code: "it", flag: "🇮🇹", shortCode: "IT", nativeName: "Italiano" },
  { code: "nl", flag: "🇳🇱", shortCode: "NL", nativeName: "Nederlands" },
  { code: "sv", flag: "🇸🇪", shortCode: "SV", nativeName: "Svenska" },
  { code: "ar", flag: "🇸🇦", shortCode: "AR", nativeName: "العربية" },
  { code: "hi", flag: "🇮🇳", shortCode: "HI", nativeName: "हिन्दी" },
];

interface LangSelectorProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
}

export default function LangSelector({
  className,
  variant = "ghost",
}: LangSelectorProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const handleSelect = (code: string) => {
    router.replace(pathname, { locale: code });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn("gap-1.5 font-medium", className)}
          aria-label="Select language"
        >
          <span aria-hidden="true">{current.flag}</span>
          <span className="text-xs">{current.shortCode}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 max-h-80 overflow-y-auto">
        {LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleSelect(loc.code)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              loc.code === locale && "bg-accent font-semibold"
            )}
          >
            <span className="text-base" aria-hidden="true">
              {loc.flag}
            </span>
            <span className="flex-1 text-sm">{loc.nativeName}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {loc.shortCode}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
