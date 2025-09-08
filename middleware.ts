import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    }
  )

  // Sprawdź czy użytkownik jest zalogowany
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Ścieżki publiczne, które nie wymagają autentykacji
  const publicPaths = ["/login", "/register"]
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)

  // Jeśli użytkownik nie jest zalogowany i próbuje uzyskać dostęp do chronionej strony
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Jeśli użytkownik jest zalogowany i próbuje uzyskać dostęp do stron logowania/rejestracji
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
