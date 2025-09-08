"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const email = String(formData.get("email") || "").trim()
      const password = String(formData.get("password") || "")
      if (!email || !password) {
        throw new Error("Podaj email i hasło")
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error

      // Profil zostanie utworzony automatycznie przez trigger w bazie danych
      if (data.user) {
        // Sprawdź czy użytkownik wymaga potwierdzenia email
        if (data.user.email_confirmed_at) {
          // Użytkownik jest już potwierdzony, przekieruj od razu
          router.push("/dashboard")
          router.refresh()
        } else {
          // Użytkownik wymaga potwierdzenia email
          setSuccess("Sprawdź swoją skrzynkę email i kliknij link potwierdzający, aby dokończyć rejestrację.")
        }
      }
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd rejestracji")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Załóż konto</CardTitle>
          <CardDescription>Rejestracja przez email i hasło</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Hasło</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {error ? (
                <div className="text-destructive text-sm">{error}</div>
              ) : null}
              {success ? (
                <div className="text-green-600 text-sm">{success}</div>
              ) : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Rejestruję..." : "Zarejestruj się"}
              </Button>
              <div className="text-center text-sm">
                Masz już konto?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Zaloguj się
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Rejestrując się, akceptujesz nasze <a href="#">Warunki</a> i <a href="#">Politykę prywatności</a>.
      </div>
    </div>
  )
}


