import { redirect } from "next/navigation"

export default function Home() {
  // Przekieruj na stronę logowania
  redirect("/login")
}
