import { redirect } from 'next/navigation'

// Redirect root to the default locale
export default function RootPage() {
  redirect('/en')
}
