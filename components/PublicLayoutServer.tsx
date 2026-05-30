import { getActiveCars } from "@/lib/notion";
import {
  buildNavModelsByBrand,
  countActiveCarsByBrand,
  type NavCountsByBrand,
  type NavModelsByBrand,
} from "@/lib/navModels";
import PublicLayout from "@/components/PublicLayout";

export default async function PublicLayoutServer({
  children,
}: {
  children: React.ReactNode;
}) {
  let navModelsByBrand: NavModelsByBrand = {};
  let navCountsByBrand: NavCountsByBrand = {};

  try {
    const cars = await getActiveCars();
    navModelsByBrand = buildNavModelsByBrand(cars);
    navCountsByBrand = countActiveCarsByBrand(cars);
  } catch (err) {
    console.error("PublicLayout: failed to load nav models from Notion", err);
  }

  return (
    <PublicLayout
      navModelsByBrand={navModelsByBrand}
      navCountsByBrand={navCountsByBrand}
    >
      {children}
    </PublicLayout>
  );
}
