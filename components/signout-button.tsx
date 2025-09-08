"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export function SignOutButton() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      {loading ? "Wylogowuję..." : "Wyloguj"}
    </Button>
  )
}


