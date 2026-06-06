import { redirect } from "next/navigation";
// New listing → property submission form
export default function NewListingPage() {
  redirect("/submit");
}
