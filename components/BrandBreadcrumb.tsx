import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/site";

interface BrandBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function BrandBreadcrumb({ items }: BrandBreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/50">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />}
              {isLast ? (
                <span className="text-white/90 font-medium">{item.name}</span>
              ) : (
                <Link href={item.path} className="hover:text-white transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
