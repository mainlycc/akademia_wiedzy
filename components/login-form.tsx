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
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    try {
      const email = String(formData.get("email") || "").trim()
      const password = String(formData.get("password") || "")
      if (!email || !password) {
        throw new Error("Podaj email i hasło")
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      router.push("/dashboard")
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Wystąpił błąd logowania")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Witaj z powrotem</CardTitle>
          <CardDescription>
            Zaloguj się używając swojego konta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Hasło</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Zapomniałeś hasła?
                    </a>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {error ? (
                  <div className="text-destructive text-sm">{error}</div>
                ) : null}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loguję..." : "Zaloguj się"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Nie masz konta?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Zarejestruj się
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Klikając kontynuuj, akceptujesz nasze <a href="#">Warunki usługi</a>{" "}
        i <a href="#">Politykę prywatności</a>.
      </div>
    </div>
  )
}
