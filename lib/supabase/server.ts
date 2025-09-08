import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // These are no-ops on the server during SSR; next/headers cookies are immutable in RSC.
        set() {},
        remove() {},
      },
    }
  )
}


