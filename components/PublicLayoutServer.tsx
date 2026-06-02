import PublicLayout from "@/components/PublicLayout";

export default async function PublicLayoutServer({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  return (
    <PublicLayout locale={locale}>
      {children}
    </PublicLayout>
  );
}
